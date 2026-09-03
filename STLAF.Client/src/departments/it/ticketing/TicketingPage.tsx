import { useEffect, useRef, useState } from "react";
import {
  fetchAllTickets,
  fetchItStaff,
  updateTicketStatus,
  assignTicket,
  addTicketRemark,
  exportTickets,
  type Ticket,
  type ItStaff,
} from "./ticketingApi";
import { Spinner } from "../../../common/components/Loader/Loader";
import { Toast } from "../../../common/components/Toast/Toast";
import { TicketDetailModal } from "./TicketDetailModal";
import { deleteTicket } from "./ticketingApi";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog/ConfirmDialog";
import "../gmail/GmailForms.css";
import "./TicketingPage.css";

const PAGE_SIZE = 20;

function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

const STATUS_FILTERS = [
  "All",
  "Open",
  "In Progress",
  "On Hold",
  "Resolved",
  "Closed",
];

const STATUS_META: Record<string, string> = {
  Open: "badge-open",
  "In Progress": "badge-progress",
  "On Hold": "badge-hold",
  Resolved: "badge-resolved",
  Closed: "badge-closed",
};

const PRIORITY_CLASS: Record<string, string> = {
  Low: "priority-low",
  Medium: "priority-medium",
  High: "priority-high",
  Urgent: "priority-urgent",
};

export function TicketingPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [staff, setStaff] = useState<ItStaff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [pendingDeleteTicket, setPendingDeleteTicket] = useState<Ticket | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportMonth, setExportMonth] = useState(currentMonthValue());
  const exportPopoverRef = useRef<HTMLDivElement>(null);

  async function loadData() {
    const [ticketData, staffData] = await Promise.all([
      fetchAllTickets(),
      fetchItStaff(),
    ]);
    setTickets(ticketData);
    setStaff(staffData);
    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // refresh every 15 seconds
    return () => clearInterval(interval);
  }, []);

  async function handleStatusChange(ticketId: string, status: string) {
    const updated = await updateTicketStatus(ticketId, status);
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
    setToastMessage(`${updated.ticketNumber} marked ${status}.`);
    setIsToastVisible(true);
  }

  async function handleAddRemark(ticketId: string, remarks: string) {
    const updated = await addTicketRemark(ticketId, remarks);
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
    setToastMessage(`Remark added to ${updated.ticketNumber}.`);
    setIsToastVisible(true);
  }

  async function handleAssignChange(ticketId: string, assignedToId: string) {
    const updated = await assignTicket(ticketId, assignedToId || null);
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
    setToastMessage(
      assignedToId
        ? `${updated.ticketNumber} assigned to ${updated.assignedToName}.`
        : `${updated.ticketNumber} unassigned.`,
    );
    setIsToastVisible(true);
  }

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) ?? null;

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      t.ticketNumber.toLowerCase().includes(query) ||
      t.name.toLowerCase().includes(query) ||
      t.companyEmail.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const cmp = a.ticketNumber.localeCompare(b.ticketNumber, undefined, {
      numeric: true,
    });
    return sortOrder === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sortedTickets.length / PAGE_SIZE));
  const pagedTickets = sortedTickets.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortOrder]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!isExportModalOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        exportPopoverRef.current &&
        !exportPopoverRef.current.contains(e.target as Node)
      ) {
        setIsExportModalOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExportModalOpen]);

  async function handleExport(e: React.FormEvent) {
    e.preventDefault();
    if (!exportMonth) return;

    setIsExporting(true);
    try {
      await exportTickets({
        status: statusFilter,
        search: searchQuery,
        month: exportMonth,
      });
      setIsExportModalOpen(false);
      setToastMessage(`Tickets for ${formatMonthLabel(exportMonth)} exported.`);
      setIsToastVisible(true);
    } catch {
      setToastMessage("Something went wrong exporting tickets.");
      setIsToastVisible(true);
    } finally {
      setIsExporting(false);
    }
  }

  function handleDelete(ticket: Ticket) {
    setPendingDeleteTicket(ticket);
  }

  async function confirmDeleteTicket() {
    if (!pendingDeleteTicket) return;
    const ticket = pendingDeleteTicket;
    setPendingDeleteTicket(null);

    await deleteTicket(ticket.id);
    setTickets((prev) => prev.filter((t) => t.id !== ticket.id));
    setSelectedTicketId(null);
    setToastMessage(`${ticket.ticketNumber} deleted.`);
    setIsToastVisible(true);
  }

  return (
    <div className="ticketing-page">
      <h1 className="page-title">Ticketing</h1>
      <p className="page-subtitle">
        All tickets, including closed. Click a row to view details and update.
      </p>
      <div className="ticketing-toolbar">
        <div className="search-box">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by ticket #, name, email, category…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-chips">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              className={`filter-chip ${statusFilter === s ? "filter-chip-active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="ticketing-export-wrap" ref={exportPopoverRef}>
          <button
            className="gmail-submit-btn ticketing-export-btn"
            onClick={() => setIsExportModalOpen((prev) => !prev)}
            disabled={isLoading}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ marginRight: 8 }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export to Excel
          </button>

          {isExportModalOpen && (
            <div className="ticketing-export-popover">
              <form onSubmit={handleExport} className="ticketing-export-popover-form">
                <label className="gmail-label" htmlFor="export-month">
                  Export month
                </label>
                <input
                  id="export-month"
                  type="month"
                  value={exportMonth}
                  onChange={(e) => setExportMonth(e.target.value)}
                  required
                  max={currentMonthValue()}
                  className="gmail-input"
                  autoFocus
                />
                <p className="ticketing-export-note">
                  Only {formatMonthLabel(exportMonth)} tickets
                  {statusFilter !== "All" ? ` (“${statusFilter}” status)` : ""}{" "}
                  will be included.
                </p>
                <div className="ticketing-export-popover-actions">
                  <button
                    type="button"
                    className="gmail-cancel-btn"
                    onClick={() => setIsExportModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="gmail-submit-btn"
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <span className="btn-loading">
                        <Spinner size="sm" /> Exporting…
                      </span>
                    ) : (
                      "Export"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      <div className="ticketing-table-panel">
        {isLoading ? (
          <div className="ticketing-loading">
            <Spinner size="md" />
          </div>
        ) : sortedTickets.length === 0 ? (
          <div className="ticketing-empty">
            <p>
              {tickets.length === 0
                ? "No tickets yet."
                : "No tickets match your search or filter."}
            </p>
          </div>
        ) : (
          <div className="ticketing-table-wrap">
            <table className="ticketing-table">
              <thead>
                <tr>
                  <th>
                    <button
                      onClick={() =>
                        setSortOrder((prev) =>
                          prev === "desc" ? "asc" : "desc",
                        )
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        color: "inherit",
                        font: "inherit",
                      }}
                    >
                      Ticket #
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        {sortOrder === "desc" ? (
                          <path d="M12 5v14M5 12l7 7 7-7" />
                        ) : (
                          <path d="M12 19V5M5 12l7-7 7 7" />
                        )}
                      </svg>
                    </button>
                  </th>
                  <th>Requester</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Submitted</th>
                  <th>Closed</th>
                </tr>
              </thead>
              <tbody>
                {pagedTickets.map((t) => (
                  <tr
                    key={t.id}
                    className="ticket-row"
                    onClick={() => setSelectedTicketId(t.id)}
                  >
                    <td className="ticket-number">{t.ticketNumber}</td>
                    <td>
                      <div className="requester-cell">
                        <span>{t.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">{t.category}</span>
                    </td>
                    <td>
                      <span
                        className={`priority-badge ${PRIORITY_CLASS[t.priority] ?? ""}`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${STATUS_META[t.status] ?? ""}`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="assignee-cell">
                      {t.assignedToName ?? (
                        <span className="unassigned-text">Unassigned</span>
                      )}
                    </td>
                    <td className="ticket-date">
                      {new Date(t.dateSubmitted).toLocaleString()}
                    </td>
                    <td className="ticket-date">
                      {t.status === "Closed" ? (
                        new Date(t.updatedDate).toLocaleString()
                      ) : (
                        <span className="unassigned-text">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && sortedTickets.length > 0 && (
          <div className="ticketing-pagination">
            <span className="ticketing-pagination-count">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, sortedTickets.length)} of{" "}
              {sortedTickets.length} tickets
            </span>
            <div className="ticketing-pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <span className="ticketing-pagination-page">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      <TicketDetailModal
        ticket={selectedTicket}
        staff={staff}
        onClose={() => setSelectedTicketId(null)}
        onStatusChange={handleStatusChange}
        onAssignChange={handleAssignChange}
        onAddRemark={handleAddRemark}
        onDelete={handleDelete}
      />
      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />

      <ConfirmDialog
        isOpen={!!pendingDeleteTicket}
        title="Delete Ticket"
        message={
          pendingDeleteTicket
            ? `Delete ${pendingDeleteTicket.ticketNumber}? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        danger
        onConfirm={confirmDeleteTicket}
        onCancel={() => setPendingDeleteTicket(null)}
      />
    </div>
  );
}
