import { useState } from "react";
import { Modal } from "../components/Modal/Modal";
import { Spinner } from "../components/Loader/Loader";
import { decideRetraction, type LeaveRequest } from "./leaveApi";
import "../../departments/it/gmail/GmailForms.css";

interface DecideRetractionModalProps {
  request: LeaveRequest | null;
  approved: boolean;
  onClose: () => void;
  onDecided: (request: LeaveRequest) => void;
}

export function DecideRetractionModal({ request, approved, onClose, onDecided }: DecideRetractionModalProps) {
  if (!request) return null;
  const current = request;

  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await decideRetraction(current.id, approved, notes || undefined);
      onDecided(updated);
      onClose();
      setNotes("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={!!request} onClose={onClose}>
      <div className="gmail-modal">
        <h2 className="gmail-modal-title">{approved ? "Approve" : "Decline"} Retraction</h2>

        <div className="editing-badge">
          <span className="editing-badge-label">{current.department} · {current.leaveTypeName}</span>
          <span className="editing-badge-value">
            {current.employeeName} — {new Date(current.startDate).toLocaleDateString()} to {new Date(current.endDate).toLocaleDateString()}
          </span>
        </div>

        {current.retractionReason && (
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
            <strong style={{ color: "var(--text-primary)" }}>Employee's reason:</strong> {current.retractionReason}
          </p>
        )}

        <form onSubmit={handleSubmit} className="gmail-form">
          <div className="gmail-field">
            <label className="gmail-label">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="gmail-input gmail-textarea" />
          </div>

          {error && <p className="gmail-error">{error}</p>}

          <div className="gmail-actions">
            <button type="button" className="gmail-cancel-btn" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className={approved ? "gmail-submit-btn" : "gmail-cancel-btn"}
              disabled={isSubmitting}
              style={!approved ? { color: "var(--accent-error)", borderColor: "var(--accent-error)" } : undefined}
            >
              {isSubmitting ? <span className="btn-loading"><Spinner size="sm" /> Saving…</span> : approved ? "Approve Retraction" : "Decline Retraction"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}