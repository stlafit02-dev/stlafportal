import { useEffect, useState } from "react";
import { fetchMyInquiries, type IntakeSubmissionSummary } from "./intakeApi";
import { Spinner } from "../components/Loader/Loader";
import { Modal } from "../components/Modal/Modal";
import "../../departments/it/gmail/GmailManagementPage.css";

const STATUS_META: Record<string, string> = {
  New: "badge-pending",
  Contacted: "badge-progress",
  Closed: "badge-active",
};

export function MyInquiriesPage() {
  const [inquiries, setInquiries] = useState<IntakeSubmissionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewInquiry, setViewInquiry] = useState<IntakeSubmissionSummary | null>(null);

  useEffect(() => {
    fetchMyInquiries().then((data) => {
      setInquiries(data);
      setIsLoading(false);
    });
  }, []);

  const categories = Array.from(new Set(inquiries.flatMap((i) => i.categories)));

  const filtered = inquiries.filter((i) => {
    const matchesCategory = categoryFilter === "All" || i.categories.includes(categoryFilter);
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      i.clientName.toLowerCase().includes(query) ||
      i.trackingNumber.toLowerCase().includes(query) ||
      i.matchedServices.some((s) => s.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
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
          <h1 className="page-title">Inquiries</h1>
          <p className="page-subtitle">
            {filtered.length} of {inquiries.length} inquiries · Click a row for details
          </p>
        </div>
      </div>

      <div className="app-pw-filters" style={{ marginBottom: 20 }}>
        <div className="gws-search-box email-search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by client, tracking #, or service…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="gws-search-input"
          />
        </div>

        {categories.length > 1 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="email-gws-filter"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="gmail-empty">
          {inquiries.length === 0
            ? "No inquiries assigned to you yet."
            : "No inquiries match your search or filter."}
        </div>
      ) : (
        <div className="gmail-table-panel">
          <div className="gmail-table-wrap">
            <table className="gmail-table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Client</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id} className="email-row" onClick={() => setViewInquiry(i)}>
                    <td className="mono-cell">{i.trackingNumber}</td>
                    <td>{i.clientName}</td>
                    <td>
                      <span className={`status-badge ${STATUS_META[i.status] ?? ""}`}>
                        {i.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewInquiry && (
        <Modal isOpen={!!viewInquiry} onClose={() => setViewInquiry(null)}>
          <div className="gmail-modal">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 20,
              }}
            >
              <div>
                <h2 className="gmail-modal-title" style={{ marginBottom: 4 }}>
                  {viewInquiry.clientName}
                </h2>
                <span
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: 12.5,
                    color: "var(--accent-gold)",
                  }}
                >
                  {viewInquiry.trackingNumber}
                </span>
              </div>
              <button
                onClick={() => setViewInquiry(null)}
                aria-label="Close"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="gmail-grid">
              <div className="gmail-field">
                <label className="gmail-label">Client Type</label>
                <div className="recycle-static-value">{viewInquiry.clientType}</div>
              </div>
              <div className="gmail-field">
                <label className="gmail-label">Status</label>
                <div className="recycle-static-value">
                  <span className={`status-badge ${STATUS_META[viewInquiry.status] ?? ""}`}>
                    {viewInquiry.status}
                  </span>
                </div>
              </div>
              <div className="gmail-field">
                <label className="gmail-label">Contact Person</label>
                <div className="recycle-static-value">{viewInquiry.contactPerson}</div>
              </div>
              <div className="gmail-field">
                <label className="gmail-label">Contact Email</label>
                <div className="recycle-static-value mono">{viewInquiry.contactEmail || "—"}</div>
              </div>
              <div className="gmail-field">
                <label className="gmail-label">Contact Phone</label>
                <div className="recycle-static-value mono">{viewInquiry.contactPhone || "—"}</div>
              </div>
              <div className="gmail-field">
                <label className="gmail-label">Consultation Preference</label>
                <div className="recycle-static-value">{viewInquiry.consultationPreference}</div>
              </div>
              <div className="gmail-field">
                <label className="gmail-label">Consultation Date</label>
                <div className="recycle-static-value">
                  {new Date(viewInquiry.consultationDate).toLocaleDateString()}
                </div>
              </div>
              <div className="gmail-field">
                <label className="gmail-label">Submitted</label>
                <div className="recycle-static-value">
                  {new Date(viewInquiry.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="gmail-field" style={{ marginTop: 16 }}>
              <label className="gmail-label">Services</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {viewInquiry.matchedServices.map((s, idx) => (
                  <span key={idx} className="category-badge">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}