import { useEffect, useState } from "react";
import {
  fetchQueue,
  fetchSummary,
  createTicket,
  type Ticket,
  type TicketSummary,
} from "./ticketingApi";
import { Spinner } from "../../../common/components/Loader/Loader";
import "./ITHelpdeskPage.css";
import { Toast } from "../../../common/components/Toast/Toast";

const CATEGORIES = [
  "Hardware",
  "Software",
  "Network",
  "Email",
  "Other",
];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const DEPARTMENTS = [
  "IT",
  "HR Admin",
  "Litigation",
  "Accounting",
  "Corporate",
  "Marketing",
];

const STATUS_META: Record<string, { label: string; className: string }> = {
  Open: { label: "Open", className: "badge-open" },
  "In Progress": { label: "In Progress", className: "badge-progress" },
  "On Hold": { label: "On Hold", className: "badge-hold" },
  Resolved: { label: "Resolved", className: "badge-resolved" },
  Closed: { label: "Closed", className: "badge-closed" },
};

const PRIORITY_CLASS: Record<string, string> = {
  Low: "priority-low",
  Medium: "priority-medium",
  High: "priority-high",
  Urgent: "priority-urgent",
};

export function ITHelpdeskPage() {
  const [summary, setSummary] = useState<TicketSummary | null>(null);
  const [queue, setQueue] = useState<Ticket[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);

  const [form, setForm] = useState({
    name: "",
    companyEmail: "",
    viberNumber: "",
    department: "",
    category: "",
    priority: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  async function loadData() {
    const [summaryData, queueData] = await Promise.all([
      fetchSummary(),
      fetchQueue(),
    ]);
    setSummary(summaryData);
    setQueue(queueData);
    setIsLoadingQueue(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const result = await createTicket(form);
      setToastMessage(`Ticket ${result.ticketNumber} submitted.`);
      setIsToastVisible(true);
      setForm({
        name: "",
        companyEmail: "",
        viberNumber: "",
        department: "",
        category: "",
        priority: "",
        description: "",
      });
      await loadData();
    } catch {
      setSubmitError(
        "Something went wrong submitting your ticket. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const cards: {
    key: keyof TicketSummary;
    label: string;
    className: string;
  }[] = [
    { key: "open", label: "Open", className: "badge-open" },
    { key: "inProgress", label: "In Progress", className: "badge-progress" },
    { key: "onHold", label: "On Hold", className: "badge-hold" },
    { key: "resolved", label: "Resolved", className: "badge-resolved" },
    { key: "closed", label: "Closed", className: "badge-closed" },
  ];

  return (
    <div className="helpdesk">
      <header className="helpdesk-header">
        <h1 className="helpdesk-title">IT Helpdesk</h1>
        <p className="helpdesk-subtitle">
          Submit an IT request and monitor live ticket updates.
        </p>
      </header>

      <section className="summary-grid">
        {cards.map((c) => (
          <div key={c.key} className="summary-card">
            <span className={`status-badge ${c.className}`}>
              {c.label.toUpperCase()}
            </span>
            <span className="summary-count">
              {summary ? summary[c.key] : "–"}
            </span>
          </div>
        ))}
      </section>

      <section className="helpdesk-body">
        <div className="ticket-form-panel">
          <h2 className="panel-title">
            <span className="panel-title-bar" />
            Create New Ticket
          </h2>

          <form onSubmit={handleSubmit} className="ticket-form">
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
              className="ticket-input"
            />
            <input
              type="email"
              placeholder="Company Email"
              value={form.companyEmail}
              onChange={(e) => updateField("companyEmail", e.target.value)}
              required
              className="ticket-input"
            />
            <input
              type="text"
              placeholder="Viber Number"
              value={form.viberNumber}
              onChange={(e) => updateField("viberNumber", e.target.value)}
              className="ticket-input"
            />
            <select
              value={form.department}
              onChange={(e) => updateField("department", e.target.value)}
              required
              className="ticket-input"
            >
              <option value="" disabled>
                Department
              </option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              required
              className="ticket-input"
            >
              <option value="" disabled>
                Category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={form.priority}
              onChange={(e) => updateField("priority", e.target.value)}
              required
              className="ticket-input"
            >
              <option value="" disabled>
                Priority
              </option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              required
              rows={4}
              className="ticket-input ticket-textarea"
            />
            {submitError && (
              <p className="form-message form-error">{submitError}</p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="submit-btn"
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
        </div>

        <div className="queue-panel">
          <h2 className="panel-title">
            <span className="live-dot" />
            Live Queue
          </h2>

          {isLoadingQueue ? (
            <div className="queue-loading">
              <Spinner size="md" />
            </div>
          ) : queue.length === 0 ? (
            <div className="queue-empty">
              <p>No tickets.</p>
            </div>
          ) : (
            <div className="queue-table-wrap">
              <table className="queue-table">
                <thead>
                  <tr>
                    <th>Ticket #</th>
                    <th>Date Submitted</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((t) => (
                    <tr key={t.id}>
                      <td className="ticket-number">{t.ticketNumber}</td>
                      <td>{new Date(t.dateSubmitted).toLocaleDateString()}</td>
                      <td className="ticket-desc" title={t.description}>
                        {t.description}
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
                          className={`status-badge ${STATUS_META[t.status]?.className ?? ""}`}
                        >
                          {STATUS_META[t.status]?.label ?? t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
    </div>
  );
}
