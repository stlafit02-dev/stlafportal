import { useEffect, useState } from "react";
import { fetchPartnerDashboard, decidePartner, type DocumentRequest } from "../../common/documents/documentApi";
import { Spinner } from "../../common/components/Loader/Loader";
import { Toast } from "../../common/components/Toast/Toast";
import { Modal } from "../../common/components/Modal/Modal";
import "../it/gmail/GmailManagementPage.css";

const STATUS_META: Record<string, string> = {
  PendingPartner: "badge-pending",
  Approved: "badge-active",
  RejectedByPartner: "badge-rejected",
  ReturnedToEA: "badge-progress",
};

const STATUS_LABEL: Record<string, string> = {
  PendingPartner: "Pending Your Approval",
  Approved: "Approved",
  RejectedByPartner: "Rejected",
  ReturnedToEA: "Returned to EA",
};

const FILTERS = ["All", "PendingPartner", "Approved", "RejectedByPartner", "ReturnedToEA"];

export function PartnerDashboardPage() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [notesTarget, setNotesTarget] = useState<{ request: DocumentRequest; approved: boolean } | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  async function loadAll() {
    setIsLoading(true);
    setRequests(await fetchPartnerDashboard());
    setIsLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function confirmDecide() {
    if (!notesTarget) return;
    const { request, approved } = notesTarget;
    setDecidingId(request.id);
    try {
      const updated = await decidePartner(request.id, approved, notesInput || undefined);
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setToastMessage(
        approved
          ? `${request.trackingNumber} approved.`
          : `${request.trackingNumber} declined and returned to the Executive Assistant.`,
      );
      setIsToastVisible(true);
    } finally {
      setDecidingId(null);
      setNotesTarget(null);
      setNotesInput("");
    }
  }

  const filtered = statusFilter === "All" ? requests : requests.filter((r) => r.status === statusFilter);

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
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Documents approved by the Executive Assistant and their outcomes.</p>
        </div>
      </div>

      <div className="gmail-field" style={{ maxWidth: 260, marginBottom: 20 }}>
        <label className="gmail-label">Status</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="gmail-input">
          {FILTERS.map((f) => (
            <option key={f} value={f}>
              {f === "All" ? "All" : STATUS_LABEL[f]}
            </option>
          ))}
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
                  <th>Submitted By</th>
                  <th>Title</th>
                  <th>Submitted</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>File</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="mono-cell">{r.trackingNumber}</td>
                    <td>{r.employeeName} ({r.department})</td>
                    <td>{r.title}</td>
                    <td className="email-date-cell">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="email-date-cell">
                      {r.deadlineDate ? new Date(r.deadlineDate).toLocaleDateString() : <span className="unassigned-text">—</span>}
                    </td>
                    <td>
                      <span className={`status-badge ${STATUS_META[r.status] ?? ""}`}>
                        {STATUS_LABEL[r.status] ?? r.status}
                      </span>
                    </td>
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
                    <td>
                      {r.status === "PendingPartner" ? (
                        <div className="action-icons">
                          <button
                            className="leave-approve-btn"
                            disabled={decidingId === r.id}
                            onClick={() => setNotesTarget({ request: r, approved: true })}
                          >
                            Approve
                          </button>
                          <button
                            className="leave-reject-btn"
                            disabled={decidingId === r.id}
                            onClick={() => setNotesTarget({ request: r, approved: false })}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="unassigned-text">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {notesTarget && (
        <Modal isOpen={!!notesTarget} onClose={() => { setNotesTarget(null); setNotesInput(""); }}>
          <div className="gmail-modal" style={{ width: 420 }}>
            <h2 className="gmail-modal-title">
              {notesTarget.approved ? "Approve" : "Reject"} {notesTarget.request.trackingNumber}
            </h2>
            <div className="gmail-field">
              <label className="gmail-label">Notes {notesTarget.approved ? "(optional)" : ""}</label>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                rows={3}
                className="gmail-input gmail-textarea"
              />
            </div>
            <div className="gmail-actions">
              <button className="gmail-cancel-btn" onClick={() => { setNotesTarget(null); setNotesInput(""); }}>
                Cancel
              </button>
              <button
                className={notesTarget.approved ? "gmail-submit-btn" : "gmail-cancel-btn"}
                style={!notesTarget.approved ? { color: "var(--accent-error)", borderColor: "var(--accent-error)" } : undefined}
                onClick={confirmDecide}
                disabled={decidingId === notesTarget.request.id}
              >
                {decidingId === notesTarget.request.id ? <Spinner size="sm" /> : notesTarget.approved ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Toast message={toastMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
    </div>
  );
}