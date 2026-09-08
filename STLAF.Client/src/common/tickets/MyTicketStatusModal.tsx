import { Modal } from "../components/Modal/Modal";
import type { Ticket } from "../../departments/it/ticketing/ticketingApi";
import { STATUS_META } from "../../departments/it/ticketing/ticketStatusMeta";
import "../../departments/it/ticketing/TicketDetailModal.css";

const PRIORITY_CLASS: Record<string, string> = {
  Low: "priority-low",
  Medium: "priority-medium",
  High: "priority-high",
  Urgent: "priority-urgent",
};

interface MyTicketStatusModalProps {
  ticket: Ticket | null;
  onClose: () => void;
}

export function MyTicketStatusModal({ ticket, onClose }: MyTicketStatusModalProps) {
  if (!ticket) return null;

  const remarksLog = ticket.remarks
    ? ticket.remarks.split("\n").filter(Boolean).reverse()
    : [];

  return (
    <Modal isOpen={!!ticket} onClose={onClose}>
      <div className="ticket-modal">
        <div className="ticket-modal-header">
          <div>
            <span className="ticket-modal-number">{ticket.ticketNumber}</span>
            <span className={`priority-badge ${PRIORITY_CLASS[ticket.priority] ?? ""}`}>
              {ticket.priority}
            </span>
          </div>
          <button className="ticket-modal-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="ticket-modal-meta-grid">
          <div className="meta-item">
            <span className="meta-label">Status</span>
            <span className={`status-badge ${STATUS_META[ticket.status] ?? ""}`}>{ticket.status}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Category</span>
            <span className="meta-value">{ticket.category}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Assigned To</span>
            <span className="meta-value">{ticket.assignedToName || "Unassigned"}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Submitted</span>
            <span className="meta-value">{new Date(ticket.dateSubmitted).toLocaleString()}</span>
          </div>
        </div>

        <div className="ticket-modal-description">
          <span className="meta-label">Description</span>
          <p className="description-text">{ticket.description}</p>
        </div>

        {remarksLog.length > 0 && (
          <div className="ticket-modal-description">
            <span className="meta-label">Remarks</span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                border: "1px solid var(--border-color)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              {remarksLog.map((line, i) => (
                <p
                  key={i}
                  style={{
                    margin: 0,
                    fontSize: 12.5,
                    color: "var(--text-body)",
                    padding: "8px 12px",
                    borderBottom: i === remarksLog.length - 1 ? "none" : "1px solid var(--border-color)",
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="ticket-modal-footer">
          <p className="ticket-modal-updated">
            Last updated {new Date(ticket.updatedDate).toLocaleString()}
          </p>
        </div>
      </div>
    </Modal>
  );
}
