import { useEffect, useState } from "react";
import { fetchMyDocumentRequests, type DocumentRequest } from "./documentApi";
import { Spinner } from "../components/Loader/Loader";
import "../../departments/it/gmail/GmailManagementPage.css";

const STATUS_META: Record<string, string> = {
  PendingEA: "badge-pending",
  PendingPartner: "badge-progress",
  Approved: "badge-active",
  RejectedByEA: "badge-rejected",
  ReturnedToEA: "badge-progress",
  RejectedByPartner: "badge-rejected",
};

const STATUS_LABEL: Record<string, string> = {
  PendingEA: "Awaiting EA Review",
  PendingPartner: "Awaiting Partner Approval",
  Approved: "Approved",
  RejectedByPartner: "Rejected",
};

export function MyDocumentsPage() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchMyDocumentRequests().then((data) => {
      setRequests(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="gmail-page-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  const filtered = statusFilter === "all" ? requests : requests.filter((r) => r.status === statusFilter);

  return (
    <div className="gmail-page">
      <div className="gmail-page-header">
        <div>
          <h1 className="page-title">My Documents</h1>
          <p className="page-subtitle">Track every document you've submitted, including rejected ones.</p>
        </div>
      </div>

      <div className="gmail-field" style={{ maxWidth: 260, marginBottom: 20 }}>
        <label className="gmail-label">Status</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="gmail-input">
          <option value="all">All</option>
          <option value="PendingEA">Awaiting EA Review</option>
          <option value="PendingPartner">Awaiting Partner Approval</option>
          <option value="Approved">Approved</option>
          <option value="RejectedByPartner">Rejected</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="gmail-empty">No documents match this filter.</div>
      ) : (
        <div className="gmail-table-panel">
          <div className="gmail-table-wrap">
            <table className="gmail-table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>EA Notes</th>
                  <th>Partner Notes</th>
                  <th>File</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="mono-cell">{r.trackingNumber}</td>
                    <td>{r.title}</td>
                    <td>
                      <span className={`status-badge ${STATUS_META[r.status] ?? ""}`}>
                        {STATUS_LABEL[r.status] ?? r.status}
                      </span>
                    </td>
                    <td>{r.eaDecisionNotes || <span className="unassigned-text">—</span>}</td>
                    <td>{r.partnerDecisionNotes || <span className="unassigned-text">—</span>}</td>
                    <td>
                      {r.fileUrl ? (
                        <a href={r.fileUrl} target="_blank" rel="noreferrer" className="ls-test-btn" style={{ textDecoration: "none" }}>
                          View File
                        </a>
                      ) : r.documentLink ? (
                        <a href={r.documentLink} target="_blank" rel="noreferrer" className="ls-test-btn" style={{ textDecoration: "none" }}>
                          Open Link
                        </a>
                      ) : (
                        <span className="unassigned-text">—</span>
                      )}
                    </td>
                    <td className="email-date-cell">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}