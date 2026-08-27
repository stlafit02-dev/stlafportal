import { useEffect, useState } from "react";
import { Modal } from "../components/Modal/Modal";
import { Spinner } from "../components/Loader/Loader";
import {
  fetchMyTicketProfile,
  fetchMyTickets,
  createMyTicket,
  type EmployeeTicketProfile,
  type Ticket,
} from "../../departments/it/ticketing/ticketingApi";
import { SLA_MINUTES, formatSlaDuration } from "../../departments/it/ticketing/slaConfig";
import "../../departments/it/gmail/GmailForms.css";
import "./SubmitTicketModal.css";

const STATUS_BADGE_CLASS: Record<string, string> = {
  Open: "badge-open",
  "In Progress": "badge-progress",
  "On Hold": "badge-hold",
  Resolved: "badge-resolved",
};

const CATEGORIES = [
  "Technical Support",
  "Network - Access / Issue",
  "Account & Access",
  "Installation / Setup",
  "Booking / Reservation",
  "Email Services",
  "Website Development",
];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

interface SubmitTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubmitTicketModal({ isOpen, onClose }: SubmitTicketModalProps) {
  const [profile, setProfile] = useState<EmployeeTicketProfile | null>(null);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([fetchMyTicketProfile(), fetchMyTickets()]).then(([prof, tickets]) => {
      setProfile(prof);
      setMyTickets(tickets);
      setError(null);
      setSuccessMessage(null);
      setIsLoading(false);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const openTickets = myTickets.filter((t) => t.status !== "Closed");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      const ticket = await createMyTicket({ category, priority, description });
      setMyTickets((prev) => [ticket, ...prev]);
      setCategory("");
      setPriority("");
      setDescription("");
      setSuccessMessage(`Ticket ${ticket.ticketNumber} submitted.`);
    } catch {
      setError(
        "Something went wrong submitting your ticket. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="submit-ticket-modal">
        <div className="submit-ticket-header">
          <h2 className="gmail-modal-title">Submit Ticket</h2>
          <button
            className="submit-ticket-close"
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

        {isLoading || !profile ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 40 }}
          >
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="editing-badge">
              <span className="editing-badge-label">{profile.department}</span>
              <span className="editing-badge-value">
                {profile.fullName} · {profile.companyEmail}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="gmail-form">
              <div className="gmail-grid">
                <div className="gmail-field">
                  <label className="gmail-label">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="gmail-input"
                  >
                    <option value="" disabled>
                      Select category…
                    </option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="gmail-field">
                  <label className="gmail-label">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    required
                    className="gmail-input"
                  >
                    <option value="" disabled>
                      Select priority…
                    </option>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {priority && (
                    <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "4px 0 0" }}>
                      Resolution Time (SLA): {formatSlaDuration(SLA_MINUTES[priority] ?? SLA_MINUTES.Low)}
                    </p>
                  )}
                </div>
              </div>

              <div className="gmail-field">
                <label className="gmail-label">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  className="gmail-input gmail-textarea"
                  placeholder="Describe the issue…"
                />
              </div>

              {error && <p className="gmail-error">{error}</p>}
              {successMessage && (
                <p className="submit-ticket-success">{successMessage}</p>
              )}

              <button
                type="submit"
                className="gmail-submit-btn"
                disabled={isSubmitting}
                style={{ alignSelf: "flex-start" }}
              >
                {isSubmitting ? (
                  <span className="btn-loading">
                    <Spinner size="sm" /> Submitting…
                  </span>
                ) : (
                  "Submit Ticket"
                )}
              </button>
            </form>

            {openTickets.length > 0 && (
              <div className="submit-ticket-history">
                <h3 className="submit-ticket-history-title">Your open tickets</h3>
                <div className="submit-ticket-history-list">
                  {openTickets.map((t) => (
                    <div key={t.id} className="submit-ticket-history-row">
                      <div className="submit-ticket-history-main">
                        <div className="submit-ticket-history-top">
                          <span className="mono-cell">{t.ticketNumber}</span>
                          <span className={`status-badge ${STATUS_BADGE_CLASS[t.status] ?? "badge-open"}`}>
                            {t.status}
                          </span>
                        </div>
                        <p className="submit-ticket-history-meta">
                          {t.category} · {t.priority}
                        </p>
                        {t.remarks && (
                          <p className="submit-ticket-history-remarks">
                            <strong>Remarks:</strong> {t.remarks}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}