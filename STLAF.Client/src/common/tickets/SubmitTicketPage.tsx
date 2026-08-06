import { useEffect, useState } from "react";
import {
  fetchMyTicketProfile,
  fetchMyTickets,
  createMyTicket,
  type EmployeeTicketProfile,
  type Ticket,
} from "../../departments/it/ticketing/ticketingApi";
import { Spinner } from "../components/Loader/Loader";
import { Toast } from "../components/Toast/Toast";
import "../../departments/it/gmail/GmailManagementPage.css";

const CATEGORIES = ["Hardware", "Software", "Network", "Email & Communications", "Access Request", "Other"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const STATUS_META: Record<string, string> = {
  Open: "badge-open",
  "In Progress": "badge-progress",
  "On Hold": "badge-hold",
  Resolved: "badge-resolved",
  Closed: "badge-closed",
};

export function SubmitTicketPage() {
  const [profile, setProfile] = useState<EmployeeTicketProfile | null>(null);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  async function loadAll() {
    setIsLoading(true);
    const [prof, tickets] = await Promise.all([fetchMyTicketProfile(), fetchMyTickets()]);
    setProfile(prof);
    setMyTickets(tickets);
    setIsLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const ticket = await createMyTicket({ category, priority, description });
      setMyTickets((prev) => [ticket, ...prev]);
      setCategory("");
      setPriority("");
      setDescription("");
      setToastMessage(`Ticket ${ticket.ticketNumber} submitted.`);
      setIsToastVisible(true);
    } catch {
      setError("Something went wrong submitting your ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || !profile) {
    return (
      <div className="gmail-page-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="gmail-page">
      <div className="gmail-page-header">
        <div>
          <h1 className="page-title">Submit Ticket</h1>
          <p className="page-subtitle">
            {profile.fullName} · {profile.department} · {profile.companyEmail}
          </p>
        </div>
      </div>

      <div className="ls-inline-form-wrap" style={{ marginBottom: 28 }}>
        <form onSubmit={handleSubmit} className="gmail-form">
          <div className="gmail-grid">
            <div className="gmail-field">
              <label className="gmail-label">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required className="gmail-input">
                <option value="" disabled>Select category…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="gmail-field">
              <label className="gmail-label">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} required className="gmail-input">
                <option value="" disabled>Select priority…</option>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="gmail-field">
            <label className="gmail-label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="gmail-input gmail-textarea"
              placeholder="Describe the issue…"
            />
          </div>

          {error && <p className="gmail-error">{error}</p>}

          <button type="submit" className="gmail-submit-btn" disabled={isSubmitting} style={{ alignSelf: "flex-start" }}>
            {isSubmitting ? <span className="btn-loading"><Spinner size="sm" /> Submitting…</span> : "Submit Ticket"}
          </button>
        </form>
      </div>

      <section className="gmail-section">
        <h2 className="gmail-section-title">My Tickets</h2>
        {myTickets.length === 0 ? (
          <div className="gmail-empty">No tickets submitted yet.</div>
        ) : (
          <div className="gmail-table-wrap email-table-wrap">
            <table className="gmail-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {myTickets.map((t) => (
                  <tr key={t.id}>
                    <td className="mono-cell">{t.ticketNumber}</td>
                    <td>{t.category}</td>
                    <td>{t.priority}</td>
                    <td>
                      <span className={`status-badge ${STATUS_META[t.status] ?? ""}`}>{t.status}</span>
                    </td>
                    <td className="email-date-cell">{new Date(t.dateSubmitted).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Toast message={toastMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
    </div>
  );
}