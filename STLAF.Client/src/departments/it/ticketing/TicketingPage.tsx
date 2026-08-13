import { useEffect, useState } from "react";
import {
  fetchAllTickets,
  fetchItStaff,
  updateTicketStatus,
  assignTicket,
  type Ticket,
  type ItStaff,
} from "./ticketingApi";
import { Spinner } from "../../../common/components/Loader/Loader";
import { Toast } from "../../../common/components/Toast/Toast";
import { TicketDetailModal } from "./TicketDetailModal";
import { deleteTicket } from "./ticketingApi";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog/ConfirmDialog";
import "./TicketingPage.css";

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
  }, []);

  async function handleStatusChange(ticketId: string, status: string) {
    const updated = await updateTicketStatus(ticketId, status);
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
    setToastMessage(`${updated.ticketNumber} marked ${status}.`);
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
    const diff =
      new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime();
    return sortOrder === "asc" ? diff : -diff;
  });

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
                {sortedTickets.map((t) => (
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
      </div>
      <TicketDetailModal
        ticket={selectedTicket}
        staff={staff}
        onClose={() => setSelectedTicketId(null)}
        onStatusChange={handleStatusChange}
        onAssignChange={handleAssignChange}
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
