import { Modal } from "../../../common/components/Modal/Modal";
import type { Ticket, ItStaff } from "./ticketingApi";
import "./TicketDetailModal.css";

const STATUSES = ["Open", "In Progress", "On Hold", "Resolved", "Closed"];

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

function formatDuration(startIso: string, endIso: string): string {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const totalMinutes = Math.max(0, Math.round((end - start) / 60000));

  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(" ");
}

interface TicketDetailModalProps {
  ticket: Ticket | null;
  staff: ItStaff[];
  onClose: () => void;
  onStatusChange: (ticketId: string, status: string) => void;
  onAssignChange: (ticketId: string, assignedToId: string) => void;
  onDelete: (ticket: Ticket) => void;
}

export function TicketDetailModal({
  ticket,
  staff,
  onClose,
  onStatusChange,
  onAssignChange,
  onDelete,
}: TicketDetailModalProps) {
  if (!ticket) return null;

  const isClosed = ticket.status === "Closed";
  return (
    <Modal isOpen={!!ticket} onClose={onClose}>
      <div className="ticket-modal">
        <div className="ticket-modal-header">
          <div>
            <span className="ticket-modal-number">{ticket.ticketNumber}</span>
            <span
              className={`priority-badge ${PRIORITY_CLASS[ticket.priority] ?? ""}`}
            >
              {ticket.priority}
            </span>
          </div>
          <button
            className="ticket-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="ticket-modal-meta-grid">
          <div className="meta-item">
            <span className="meta-label">Requester</span>
            <span className="meta-value">{ticket.name}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Company Email</span>
            <span className="meta-value">{ticket.companyEmail}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Viber Number</span>
            <span className="meta-value">{ticket.viberNumber || "—"}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Department</span>
            <span className="meta-value">{ticket.department}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Category</span>
            <span className="meta-value">{ticket.category}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">
              {isClosed ? "Resolution Time" : "Submitted"}
            </span>
            <span className="meta-value">
              {isClosed
                ? formatDuration(ticket.dateSubmitted, ticket.updatedDate)
                : new Date(ticket.dateSubmitted).toLocaleString()}
            </span>
          </div>
          
        </div>

        <div className="ticket-modal-description">
          <span className="meta-label">Description</span>
          <p className="description-text">{ticket.description}</p>
        </div>

        <div className="ticket-modal-controls">
          <div className="control-group">
            <label className="meta-label">Status</label>
            <select
              className={`modal-select ${STATUS_META[ticket.status] ?? ""}`}
              value={ticket.status}
              onChange={(e) => onStatusChange(ticket.id, e.target.value)}
              disabled={isClosed}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label className="meta-label">Assigned To</label>
            <select
              className="modal-select"
              value={ticket.assignedToId ?? ""}
              onChange={(e) => onAssignChange(ticket.id, e.target.value)}
              disabled={isClosed}
            >
              <option value="">Unassigned</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isClosed && (
          <p className="ticket-modal-locked">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            This ticket is closed and can no longer be edited.
          </p>
        )}

        <div className="ticket-modal-footer">
          <p className="ticket-modal-updated">
            Last updated {new Date(ticket.updatedDate).toLocaleString()}
          </p>
          <button
            className="ticket-delete-btn"
            onClick={() => onDelete(ticket)}
          >
            Delete Ticket
          </button>
        </div>
      </div>
    </Modal>
  );
}
