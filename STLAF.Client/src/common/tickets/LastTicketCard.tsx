import { useEffect, useState } from "react";
import { fetchMyLastTicket, type Ticket } from "../../departments/it/ticketing/ticketingApi";
import { MyTicketStatusModal } from "./MyTicketStatusModal";
import { useLastTicket } from "./useLastTicket";
import { STATUS_META } from "../../departments/it/ticketing/ticketStatusMeta";
import "./LastTicketCard.css";

function TicketWireframeIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.2a1.3 1.3 0 0 0 0 2.6V13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.2a1.3 1.3 0 0 0 0-2.6V8Z" />
      <line x1="12" y1="6.5" x2="12" y2="15.5" strokeDasharray="2 2.2" />
    </svg>
  );
}

export function LastTicketCard() {
  const { version } = useLastTicket();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchMyLastTicket().then((t) => {
      setTicket(t);
      setIsLoading(false);
    });
  }, [version]);

  if (isLoading) return null;

  return (
    <div className="last-ticket-panel">
      <p className="last-ticket-panel-label">Last Ticket Submitted</p>
      {ticket ? (
        <div
          className="last-ticket-card"
          onClick={() => setIsModalOpen(true)}
          role="button"
          tabIndex={0}
        >
          <div className="last-ticket-main">
            <span className="last-ticket-number">{ticket.ticketNumber}</span>
            <span className={`status-badge ${STATUS_META[ticket.status] ?? ""}`}>{ticket.status}</span>
          </div>
          <div className="last-ticket-meta">
            <span>{ticket.category}</span>
            <span>{new Date(ticket.dateSubmitted).toLocaleDateString()}</span>
          </div>
        </div>
      ) : (
        <div className="last-ticket-empty">
          <TicketWireframeIcon />
          <span>No tickets submitted yet.</span>
        </div>
      )}
      <MyTicketStatusModal ticket={isModalOpen ? ticket : null} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
