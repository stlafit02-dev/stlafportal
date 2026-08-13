import { useEffect, useState } from "react";
import {
  fetchPendingEa,
  fetchReturnedToEa,
  decideEa,
  forwardRejection,
  type DocumentRequest,
} from "../../common/documents/documentApi";
import { Spinner } from "../../common/components/Loader/Loader";
import { Toast } from "../../common/components/Toast/Toast";
import { Modal } from "../../common/components/Modal/Modal";
import "../it/gmail/GmailManagementPage.css";

export function EaReviewPage() {
  const [pending, setPending] = useState<DocumentRequest[]>([]);
  const [returned, setReturned] = useState<DocumentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [notesTarget, setNotesTarget] = useState<{ request: DocumentRequest; approved: boolean } | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  async function loadAll() {
    setIsLoading(true);
    const [p, r] = await Promise.all([fetchPendingEa(), fetchReturnedToEa()]);
    setPending(p);
    setReturned(r);
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
      await decideEa(request.id, approved, notesInput || undefined);
      setPending((prev) => prev.filter((r) => r.id !== request.id));
      setToastMessage(
        approved
          ? `${request.trackingNumber} forwarded to Partner for approval.`
          : `${request.trackingNumber} rejected and returned to ${request.employeeName}.`,
      );
      setIsToastVisible(true);
    } finally {
      setDecidingId(null);
      setNotesTarget(null);
      setNotesInput("");
    }
  }

  async function handleForward(request: DocumentRequest) {
    setDecidingId(request.id);
    try {
      await forwardRejection(request.id);
      setReturned((prev) => prev.filter((r) => r.id !== request.id));
      setToastMessage(`${request.trackingNumber} rejection forwarded to ${request.employeeName}.`);
      setIsToastVisible(true);
    } finally {
      setDecidingId(null);
    }
  }

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
          <h1 className="page-title">EA Review</h1>
          <p className="page-subtitle">Document requests awaiting your review, plus ones the Partner has declined.</p>
        </div>
      </div>

      <section className="gmail-section">
        <h2 className="gmail-section-title">Pending Your Review</h2>
        {pending.length === 0 ? (
          <div className="gmail-empty">No document requests pending.</div>
        ) : (
          <div className="gmail-table-panel">
            <div className="gmail-table-wrap">
              <table className="gmail-table">
                <thead>
                  <tr>
                    <th>Tracking #</th>
                    <th>Submitted By</th>
                    <th>Title</th>
                    <th>Note</th>
                    <th>Submitted</th>
                    <th>Deadline</th>
                    <th>File</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((r) => (
                    <tr key={r.id}>
                      <td className="mono-cell">{r.trackingNumber}</td>
                      <td>{r.employeeName} ({r.department})</td>
                      <td>{r.title}</td>
                      <td>{r.note}</td>
                      <td className="email-date-cell">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="email-date-cell">
                        {r.deadlineDate ? new Date(r.deadlineDate).toLocaleDateString() : <span className="unassigned-text">—</span>}
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section className="gmail-section">
        <h2 className="gmail-section-title">Declined by Partner</h2>
        {returned.length === 0 ? (
          <div className="gmail-empty">Nothing here.</div>
        ) : (
          <div className="gmail-table-panel">
            <div className="gmail-table-wrap">
              <table className="gmail-table">
                <thead>
                  <tr>
                    <th>Tracking #</th>
                    <th>Submitted By</th>
                    <th>Title</th>
                    <th>Partner Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returned.map((r) => (
                    <tr key={r.id}>
                      <td className="mono-cell">{r.trackingNumber}</td>
                      <td>{r.employeeName} ({r.department})</td>
                      <td>{r.title}</td>
                      <td>{r.partnerDecisionNotes || <span className="unassigned-text">—</span>}</td>
                      <td>
                        <button
                          className="ls-test-btn"
                          disabled={decidingId === r.id}
                          onClick={() => handleForward(r)}
                        >
                          {decidingId === r.id ? <Spinner size="sm" /> : "Forward to Submitter"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

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