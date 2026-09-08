import { useEffect, useState } from "react";
import {
  fetchMyDocumentRequests,
  fetchDocumentTrash,
  returnDocumentRequest,
  deleteDocumentRequest,
  restoreDocumentRequest,
  hardDeleteDocumentRequest,
  type DocumentRequest,
} from "./documentApi";
import { EditDocumentModal } from "./EditDocumentModal";
import { Spinner } from "../components/Loader/Loader";
import { Toast } from "../components/Toast/Toast";
import { ConfirmDialog } from "../components/ConfirmDialog/ConfirmDialog";
import { Modal } from "../components/Modal/Modal";
import "../../departments/it/gmail/GmailManagementPage.css";
import "../leave/LeavePage.css";

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
  RejectedByEA: "Rejected by EA",
  ReturnedToEA: "Awaiting Partner Approval",
  RejectedByPartner: "Rejected",
};

const EDITABLE_STATUSES = ["PendingEA", "RejectedByEA", "RejectedByPartner"];
const REJECTED_STATUSES = ["RejectedByEA", "RejectedByPartner"];

export function MyDocumentsPage() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [trash, setTrash] = useState<DocumentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  const [editTarget, setEditTarget] = useState<DocumentRequest | null>(null);
  const [pendingTrash, setPendingTrash] = useState<DocumentRequest | null>(null);
  const [pendingHardDelete, setPendingHardDelete] = useState<DocumentRequest | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  async function loadAll() {
    setIsLoading(true);
    const [active, deleted] = await Promise.all([fetchMyDocumentRequests(), fetchDocumentTrash()]);
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

  function handleUpdated(updated: DocumentRequest) {
    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    showToast(`${updated.trackingNumber} updated.`);
  }

  async function handleReturn(request: DocumentRequest) {
    const updated = await returnDocumentRequest(request.id);
    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    showToast(`${updated.trackingNumber} returned for review.`);
  }

  async function confirmTrash() {
    if (!pendingTrash) return;
    const target = pendingTrash;
    setPendingTrash(null);
    const updated = await deleteDocumentRequest(target.id);
    setRequests((prev) => prev.filter((r) => r.id !== target.id));
    setTrash((prev) => [updated, ...prev]);
    showToast(`${target.trackingNumber} moved to trash.`);
  }

  async function handleRestore(request: DocumentRequest) {
    const updated = await restoreDocumentRequest(request.id);
    setTrash((prev) => prev.filter((r) => r.id !== request.id));
    setRequests((prev) => [updated, ...prev]);
    showToast(`${updated.trackingNumber} restored.`);
  }

  async function confirmHardDelete() {
    if (!pendingHardDelete) return;
    const target = pendingHardDelete;
    setPendingHardDelete(null);
    await hardDeleteDocumentRequest(target.id);
    setTrash((prev) => prev.filter((r) => r.id !== target.id));
    showToast(`${target.trackingNumber} permanently deleted.`);
  }

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
          <option value="all">All</option>
          <option value="PendingEA">Awaiting EA Review</option>
          <option value="PendingPartner">Awaiting Partner Approval</option>
          <option value="Approved">Approved</option>
          <option value="RejectedByEA">Rejected by EA</option>
          <option value="RejectedByPartner">Rejected</option>
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
                  <th>Title</th>
                  <th>Status</th>
                  <th>EA Notes</th>
                  <th>Partner Notes</th>
                  <th>File</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const canEdit = EDITABLE_STATUSES.includes(r.status);
                  const canReturn = REJECTED_STATUSES.includes(r.status);
                  const canDelete = EDITABLE_STATUSES.includes(r.status);
                  return (
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
                      <td>
                        <div className="action-icons">
                          {canEdit && (
                            <button className="ls-test-btn" onClick={() => setEditTarget(r)}>
                              Edit
                            </button>
                          )}
                          {canReturn && (
                            <button className="leave-approve-btn" onClick={() => handleReturn(r)}>
                              Return
                            </button>
                          )}
                          {canDelete && (
                            <button className="leave-reject-btn" onClick={() => setPendingTrash(r)}>
                              Delete
                            </button>
                          )}
                          {!canEdit && !canReturn && !canDelete && <span className="unassigned-text">—</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={isTrashOpen} onClose={() => setIsTrashOpen(false)}>
        <div className="gmail-modal" style={{ width: 720, maxWidth: "100%", maxHeight: "80vh", overflowY: "auto" }}>
          <h2 className="gmail-modal-title">Trash</h2>
          <p className="page-subtitle" style={{ margin: "-8px 0 16px" }}>
            Deleted documents stay here until you restore or permanently delete them.
          </p>

          {trash.length === 0 ? (
            <div className="gmail-empty gmail-table-empty">Trash is empty.</div>
          ) : (
            <div className="gmail-table-wrap">
              <table className="gmail-table">
                <thead>
                  <tr>
                    <th>Tracking #</th>
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
                      <td>{r.title}</td>
                      <td>
                        <span className={`status-badge ${STATUS_META[r.status] ?? ""}`}>
                          {STATUS_LABEL[r.status] ?? r.status}
                        </span>
                      </td>
                      <td className="email-date-cell">{r.deletedAt ? new Date(r.deletedAt).toLocaleDateString() : "—"}</td>
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

      <EditDocumentModal
        key={editTarget?.id ?? "edit-empty"}
        request={editTarget}
        onClose={() => setEditTarget(null)}
        onUpdated={handleUpdated}
      />

      <ConfirmDialog
        isOpen={!!pendingTrash}
        title="Move to Trash"
        message={pendingTrash ? `Move ${pendingTrash.trackingNumber} — ${pendingTrash.title} to trash? You can restore it later.` : ""}
        confirmLabel="Move to Trash"
        danger
        onConfirm={confirmTrash}
        onCancel={() => setPendingTrash(null)}
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

      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
    </div>
  );
}
