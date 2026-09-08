import { useEffect, useState } from "react";
import {
  fetchPartnerDashboard,
  decidePartner,
  archiveForPartner,
  fetchPartnerTrash,
  restoreForPartner,
  hardDeleteForPartner,
  type DocumentRequest,
} from "../../common/documents/documentApi";
import { Spinner } from "../../common/components/Loader/Loader";
import { Toast } from "../../common/components/Toast/Toast";
import { Modal } from "../../common/components/Modal/Modal";
import { ConfirmDialog } from "../../common/components/ConfirmDialog/ConfirmDialog";
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

// Approved documents move to the Repository — this dashboard is only for
// things still needing attention.
const FILTERS = ["All", "PendingPartner", "RejectedByPartner", "ReturnedToEA"];
const ARCHIVABLE_STATUSES = ["RejectedByPartner", "ReturnedToEA"];

export function PartnerDashboardPage() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [trash, setTrash] = useState<DocumentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [notesTarget, setNotesTarget] = useState<{ request: DocumentRequest; approved: boolean } | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [pendingArchive, setPendingArchive] = useState<DocumentRequest | null>(null);
  const [pendingHardDelete, setPendingHardDelete] = useState<DocumentRequest | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  async function loadAll() {
    setIsLoading(true);
    const [active, deleted] = await Promise.all([fetchPartnerDashboard(), fetchPartnerTrash()]);
    setRequests(active);
    setTrash(deleted);
    setIsLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function showToast(message: string) {
    setToastMessage(message);
    setIsToastVisible(true);
  }

  async function confirmDecide() {
    if (!notesTarget) return;
    const { request, approved } = notesTarget;
    setDecidingId(request.id);
    try {
      const updated = await decidePartner(request.id, approved, notesInput || undefined);
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      showToast(
        approved
          ? `${request.trackingNumber} approved.`
          : `${request.trackingNumber} declined and returned to the Executive Assistant.`,
      );
    } finally {
      setDecidingId(null);
      setNotesTarget(null);
      setNotesInput("");
    }
  }

  async function confirmArchive() {
    if (!pendingArchive) return;
    const target = pendingArchive;
    setPendingArchive(null);
    const updated = await archiveForPartner(target.id);
    setRequests((prev) => prev.filter((r) => r.id !== target.id));
    setTrash((prev) => [updated, ...prev]);
    showToast(`${target.trackingNumber} moved to trash.`);
  }

  async function handleRestore(request: DocumentRequest) {
    const updated = await restoreForPartner(request.id);
    setTrash((prev) => prev.filter((r) => r.id !== request.id));
    setRequests((prev) => [updated, ...prev]);
    showToast(`${updated.trackingNumber} restored.`);
  }

  async function confirmHardDelete() {
    if (!pendingHardDelete) return;
    const target = pendingHardDelete;
    setPendingHardDelete(null);
    await hardDeleteForPartner(target.id);
    setTrash((prev) => prev.filter((r) => r.id !== target.id));
    showToast(`${target.trackingNumber} permanently deleted.`);
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
        <div className="gmail-header-actions">
          <button
            className="icon-btn"
            onClick={() => setIsTrashOpen(true)}
            aria-label="Open trash"
            title="Trash"
            style={{ position: "relative", width: 34, height: 34 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            {trash.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  background: "var(--accent-error)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 999,
                  minWidth: 16,
                  height: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 3px",
                  lineHeight: 1,
                }}
              >
                {trash.length}
              </span>
            )}
          </button>
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
        <div className="gmail-empty gmail-table-empty">No documents match this filter.</div>
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
                      <div className="action-icons">
                        {r.status === "PendingPartner" && (
                          <>
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
                          </>
                        )}
                        {ARCHIVABLE_STATUSES.includes(r.status) && (
                          <button className="leave-reject-btn" onClick={() => setPendingArchive(r)}>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={isTrashOpen} onClose={() => setIsTrashOpen(false)}>
        <div className="gmail-modal" style={{ width: 720, maxWidth: "100%", maxHeight: "80vh", overflowY: "auto" }}>
          <h2 className="gmail-modal-title">Trash</h2>
          <p className="page-subtitle" style={{ margin: "-8px 0 16px" }}>
            Documents you've deleted from the dashboard stay here until you restore or permanently delete them.
          </p>

          {trash.length === 0 ? (
            <div className="gmail-empty gmail-table-empty">Trash is empty.</div>
          ) : (
            <div className="gmail-table-wrap">
              <table className="gmail-table">
                <thead>
                  <tr>
                    <th>Tracking #</th>
                    <th>Submitted By</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Deleted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trash.map((r) => (
                    <tr key={r.id}>
                      <td className="mono-cell">{r.trackingNumber}</td>
                      <td>{r.employeeName} ({r.department})</td>
                      <td>{r.title}</td>
                      <td>
                        <span className={`status-badge ${STATUS_META[r.status] ?? ""}`}>
                          {STATUS_LABEL[r.status] ?? r.status}
                        </span>
                      </td>
                      <td className="email-date-cell">
                        {r.partnerArchivedAt ? new Date(r.partnerArchivedAt).toLocaleDateString() : "—"}
                      </td>
                      <td>
                        <div className="action-icons">
                          <button className="leave-approve-btn" onClick={() => handleRestore(r)}>
                            Restore
                          </button>
                          <button className="leave-reject-btn" onClick={() => setPendingHardDelete(r)}>
                            Delete Forever
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="gmail-actions" style={{ marginTop: 16 }}>
            <button className="gmail-cancel-btn" onClick={() => setIsTrashOpen(false)}>Close</button>
          </div>
        </div>
      </Modal>

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

      <ConfirmDialog
        isOpen={!!pendingArchive}
        title="Move to Trash"
        message={pendingArchive ? `Move ${pendingArchive.trackingNumber} — ${pendingArchive.title} to trash? You can restore it later.` : ""}
        confirmLabel="Move to Trash"
        danger
        onConfirm={confirmArchive}
        onCancel={() => setPendingArchive(null)}
      />

      <ConfirmDialog
        isOpen={!!pendingHardDelete}
        title="Delete Forever"
        message={pendingHardDelete ? `Permanently delete ${pendingHardDelete.trackingNumber} — ${pendingHardDelete.title}? This cannot be undone.` : ""}
        confirmLabel="Delete Forever"
        danger
        onConfirm={confirmHardDelete}
        onCancel={() => setPendingHardDelete(null)}
      />

      <Toast message={toastMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
    </div>
  );
}
