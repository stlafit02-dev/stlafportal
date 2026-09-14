import { useState } from "react";
import { isAxiosError } from "axios";
import { Modal } from "../../../common/components/Modal/Modal";
import { Spinner } from "../../../common/components/Loader/Loader";
import { updateIntern, type InternAccount } from "./internAccountApi";
import "../../it/gmail/GmailForms.css";

const STATUSES = ["Active", "Inactive"];

interface InternEditModalProps {
  intern: InternAccount | null;
  onClose: () => void;
  onSaved: (intern: InternAccount) => void;
}

export function InternEditModal({
  intern,
  onClose,
  onSaved,
}: InternEditModalProps) {
  if (!intern) return null;
  const current = intern;

  const [email, setEmail] = useState(current.email);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(current.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const updated = await updateIntern(current.id, {
        email: email.trim(),
        password: password.trim() || undefined,
        status,
      });
      onSaved(updated);
      onClose();
    } catch (err) {
      const message =
        isAxiosError(err) && err.response?.data?.message
          ? (err.response.data.message as string)
          : "Something went wrong saving changes. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={!!intern} onClose={onClose}>
      <div className="gmail-modal" style={{ width: 440 }}>
        <h2 className="gmail-modal-title">Edit Intern</h2>

        <div className="editing-badge">
          <span className="editing-badge-label">Editing</span>
          <span className="editing-badge-value">{current.companyId}</span>
        </div>

        <form onSubmit={handleSubmit} className="gmail-form">
          <div className="gmail-field">
            <label className="gmail-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="gmail-input"
            />
          </div>
          <div className="gmail-field">
            <label className="gmail-label">New Password (optional)</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              className="gmail-input"
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div className="gmail-field">
            <label className="gmail-label">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="gmail-input"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="gmail-error">{error}</p>}

          <div className="gmail-actions">
            <button type="button" className="gmail-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="gmail-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="btn-loading">
                  <Spinner size="sm" /> Saving…
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
