import { useState } from "react";
import { Modal } from "../components/Modal/Modal";
import { Spinner } from "../components/Loader/Loader";
import { updateDocumentRequest, type DocumentRequest } from "./documentApi";
import "../../departments/it/gmail/GmailForms.css";

interface EditDocumentModalProps {
  request: DocumentRequest | null;
  onClose: () => void;
  onUpdated: (request: DocumentRequest) => void;
}

export function EditDocumentModal({ request, onClose, onUpdated }: EditDocumentModalProps) {
  if (!request) return null;
  const current = request;

  const [title, setTitle] = useState(current.title);
  const [note, setNote] = useState(current.note);
  const [documentLink, setDocumentLink] = useState(current.documentLink ?? "");
  const [deadlineDate, setDeadlineDate] = useState(
    current.deadlineDate ? current.deadlineDate.slice(0, 10) : "",
  );
  const [file, setFile] = useState<File | null>(null);
  const [removeFile, setRemoveFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 3.5 * 1024 * 1024) {
      setError("File is too large. Maximum size is 3.5 MB.");
      e.target.value = "";
      return;
    }
    setError(null);
    setFile(selected);
    setRemoveFile(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await updateDocumentRequest(
        current.id,
        title,
        note,
        documentLink || undefined,
        deadlineDate || undefined,
        file,
        removeFile,
      );
      onUpdated(updated);
      onClose();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Something went wrong updating your document. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasExistingFile = !!current.fileName && !removeFile;

  return (
    <Modal isOpen={!!request} onClose={onClose}>
      <div className="gmail-modal" style={{ width: 560, maxWidth: "100%", maxHeight: "85vh", overflowY: "auto" }}>
        <h2 className="gmail-modal-title">Edit Document</h2>

        <div className="editing-badge">
          <span className="editing-badge-label">{current.trackingNumber}</span>
          <span className="editing-badge-value">Editing a rejected request — you can update it and return it for review.</span>
        </div>

        <form onSubmit={handleSubmit} className="gmail-form">
          <div className="gmail-field">
            <label className="gmail-label">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="gmail-input"
            />
          </div>

          <div className="gmail-field">
            <label className="gmail-label">Note for Reviewer</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
              rows={3}
              className="gmail-input gmail-textarea"
            />
          </div>

          <div className="gmail-field">
            <label className="gmail-label">Document Link (if file is too large)</label>
            <input
              type="url"
              value={documentLink}
              onChange={(e) => setDocumentLink(e.target.value)}
              className="gmail-input"
              placeholder="https://…"
            />
          </div>

          <div className="gmail-field">
            <label className="gmail-label">Deadline Date (optional)</label>
            <input
              type="date"
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
              className="gmail-input"
            />
          </div>

          <div className="gmail-field">
            <label className="gmail-label">Attach File (max 3.5 MB, optional)</label>
            {hasExistingFile && (
              <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "0 0 6px" }}>
                Current file: {current.fileName}{" "}
                <button
                  type="button"
                  onClick={() => setRemoveFile(true)}
                  className="ls-test-btn"
                  style={{ marginLeft: 8 }}
                >
                  Remove
                </button>
              </p>
            )}
            <input type="file" onChange={handleFileChange} className="gmail-input" />
            {file && <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "4px 0 0" }}>{file.name}</p>}
          </div>

          {error && <p className="gmail-error">{error}</p>}

          <div className="gmail-actions">
            <button type="button" className="gmail-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="gmail-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? <span className="btn-loading"><Spinner size="sm" /> Saving…</span> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
