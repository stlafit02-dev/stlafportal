import { useState } from "react";
import { Modal } from "../../../common/components/Modal/Modal";
import { Spinner } from "../../../common/components/Loader/Loader";
import { updateEmailAccount, type EmailAccount } from "./gmailApi";
import "./GmailForms.css";

const STATUSES = ["Active", "Inactive"];

interface EmailAccountEditModalProps {
  account: EmailAccount | null;
  onClose: () => void;
  onSaved: (account: EmailAccount) => void;
}

export function EmailAccountEditModal({ account, onClose, onSaved }: EmailAccountEditModalProps) {
  if (!account) return null;
  const current = account;

  const [fullName, setFullName] = useState(current.fullName);
  const [oldUser, setOldUser] = useState(current.oldUser ?? "");
  const [password, setPassword] = useState(current.password);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState(current.status);
  const [remarks, setRemarks] = useState(current.remarks ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const updated = await updateEmailAccount(current.id, {
        fullName,
        oldUser: oldUser || undefined,
        password,
        status,
        remarks: remarks || undefined,
      });
      onSaved(updated);
      onClose();
    } catch {
      setError("Something went wrong saving changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={!!account} onClose={onClose}>
      <div className="gmail-modal">
        <h2 className="gmail-modal-title">Edit Account</h2>

        <div className="editing-badge">
          <span className="editing-badge-label">Editing</span>
          <span className="editing-badge-value">{current.stlafEmail}</span>
        </div>

        <form onSubmit={handleSubmit} className="gmail-form">
          <div className="gmail-field">
            <label className="gmail-label">Full Name <span className="required-mark">*</span></label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="gmail-input"
            />
          </div>

          <div className="gmail-field">
            <label className="gmail-label">Old User</label>
            <input
              type="text"
              value={oldUser}
              onChange={(e) => setOldUser(e.target.value)}
              className="gmail-input"
              placeholder="Previous user of this account, if any"
            />
          </div>

          <div className="gmail-field">
            <label className="gmail-label">Password <span className="required-mark">*</span></label>
            <div className="password-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="gmail-input"
              />
              <button
                type="button"
                className="password-toggle-inset"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="gmail-field">
            <label className="gmail-label">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="gmail-input">
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="gmail-field">
            <label className="gmail-label">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="gmail-input gmail-textarea"
            />
          </div>

          {error && <p className="gmail-error">{error}</p>}

          <div className="gmail-actions">
            <button type="button" className="gmail-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="gmail-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? <span className="btn-loading"><Spinner size="sm" /> Saving…</span> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}