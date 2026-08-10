import { useState } from "react";
import { Modal } from "../components/Modal/Modal";
import { Spinner } from "../components/Loader/Loader";
import { requestRetraction, type LeaveRequest } from "./leaveApi";
import "../../departments/it/gmail/GmailForms.css";

interface RequestRetractionModalProps {
  request: LeaveRequest | null;
  onClose: () => void;
  onRequested: (request: LeaveRequest) => void;
}

export function RequestRetractionModal({ request, onClose, onRequested }: RequestRetractionModalProps) {
  if (!request) return null;
  const current = request;

  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await requestRetraction(current.id, reason);
      onRequested(updated);
      onClose();
      setReason("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={!!request} onClose={onClose}>
      <div className="gmail-modal">
        <h2 className="gmail-modal-title">Retract Leave Request</h2>

        <div className="editing-badge">
          <span className="editing-badge-label">{current.leaveTypeName}</span>
          <span className="editing-badge-value">
            {new Date(current.startDate).toLocaleDateString()} – {new Date(current.endDate).toLocaleDateString()} ({current.days} day(s))
          </span>
        </div>

        <form onSubmit={handleSubmit} className="gmail-form">
          <div className="gmail-field">
            <label className="gmail-label">Why do you want to retract this?</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              className="gmail-input gmail-textarea"
            />
          </div>

          {error && <p className="gmail-error">{error}</p>}

          <div className="gmail-actions">
            <button type="button" className="gmail-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="gmail-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? <span className="btn-loading"><Spinner size="sm" /> Submitting…</span> : "Submit Retraction"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}