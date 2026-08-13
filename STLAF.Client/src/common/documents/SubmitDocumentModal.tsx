import { useState } from "react";
import { Modal } from "../components/Modal/Modal";
import { Spinner } from "../components/Loader/Loader";
import { createDocumentRequest } from "./documentApi";
import "../../departments/it/gmail/GmailForms.css";

interface SubmitDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubmitDocumentModal({ isOpen, onClose }: SubmitDocumentModalProps) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [documentLink, setDocumentLink] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

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
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      const created = await createDocumentRequest(title, note, documentLink || undefined, deadlineDate || undefined, file);
      setTitle("");
      setNote("");
      setDocumentLink("");
      setDeadlineDate("");
      setFile(null);
      setSuccessMessage(`Submitted — tracking number ${created.trackingNumber}.`);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Something went wrong submitting your document. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="gmail-modal" style={{ width: 560, maxWidth: "100%", maxHeight: "85vh", overflowY: "auto" }}>
        <h2 className="gmail-modal-title">Submit Document</h2>

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
            <input type="file" onChange={handleFileChange} className="gmail-input" />
            {file && <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "4px 0 0" }}>{file.name}</p>}
          </div>

          {error && <p className="gmail-error">{error}</p>}
          {successMessage && <p style={{ fontSize: 13, color: "#4FCB84", margin: 0 }}>{successMessage}</p>}

          <button type="submit" className="gmail-submit-btn" disabled={isSubmitting} style={{ alignSelf: "flex-start" }}>
            {isSubmitting ? <span className="btn-loading"><Spinner size="sm" /> Submitting…</span> : "Submit Document"}
          </button>
        </form>
      </div>
    </Modal>
  );
}