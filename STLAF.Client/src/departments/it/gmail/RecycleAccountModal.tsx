import { useState } from "react";
import { Modal } from "../../../common/components/Modal/Modal";
import { Spinner } from "../../../common/components/Loader/Loader";
import { recycleEmailAccount, type EmailAccount } from "./gmailApi";
import { generateEmailAlias, EMAIL_DOMAIN } from "./generateAlias";
import "./RecycleAccountModal.css";

interface RecycleAccountModalProps {
  account: EmailAccount | null;
  onClose: () => void;
  onRecycled: (account: EmailAccount) => void;
}

export function RecycleAccountModal({ account, onClose, onRecycled }: RecycleAccountModalProps) {
  if (!account) return null;
  const current = account;

  const [newFullName, setNewFullName] = useState("");
  const [newLocalPart, setNewLocalPart] = useState("");
  const [aliasManuallyEdited, setAliasManuallyEdited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const updated = await recycleEmailAccount(current.id, {
        newFullName,
        newStlafEmail: `${newLocalPart}@${EMAIL_DOMAIN}`,
      });
      onRecycled(updated);
      onClose();
      setNewFullName("");
      setNewLocalPart("");
      setAliasManuallyEdited(false);
    } catch {
      setError("Something went wrong recycling this account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={!!account} onClose={onClose}>
      <div className="recycle-modal">
        <h2 className="recycle-title">Recycle Account</h2>

        <div className="recycle-notice">
          <strong>Reuse this Gmail for a new user</strong>
          <p>
            The current user will be moved to "Old User" and "Old STLAF Email".
            The local Gmail will be kept the same.
          </p>
        </div>

        <span className="recycle-section-label">Moving to Old User Records</span>
        <div className="recycle-preview">
          <div className="recycle-preview-item">
            <span className="recycle-preview-label">Old User</span>
            <span className="recycle-preview-value">{current.fullName}</span>
          </div>
          <div className="recycle-preview-item">
            <span className="recycle-preview-label">Old STLAF Email (alias)</span>
            <span className="recycle-preview-value mono">{current.stlafEmail}</span>
          </div>
        </div>

        <div className="gmail-field">
          <label className="gmail-label">Local Gmail (kept)</label>
          <div className="recycle-static-value mono">{current.localGmail}</div>
        </div>

        <span className="recycle-section-label recycle-new-section">New User Details</span>

        <form onSubmit={handleSubmit} className="gmail-form">
          <div className="gmail-field">
            <label className="gmail-label">New Full Name <span className="required-mark">*</span></label>
            <input
              type="text"
              value={newFullName}
              onChange={(e) => {
                const value = e.target.value;
                setNewFullName(value);
                if (!aliasManuallyEdited) {
                  setNewLocalPart(generateEmailAlias(value));
                }
              }}
              required
              className="gmail-input"
              placeholder="Enter new user's full name"
            />
          </div>

          <div className="gmail-field">
            <label className="gmail-label">New STLAF Email (Alias) <span className="required-mark">*</span></label>
            <div className="recycle-email-input">
              <input
                type="text"
                value={newLocalPart}
                onChange={(e) => {
                  setAliasManuallyEdited(true);
                  setNewLocalPart(e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, ""));
                }}
                required
                className="gmail-input recycle-local-input"
                placeholder="new.user"
              />
              <span className="recycle-domain">@{EMAIL_DOMAIN}</span>
            </div>
          </div>

          {error && <p className="gmail-error">{error}</p>}

          <div className="gmail-actions">
            <button type="button" className="gmail-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="gmail-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? <span className="btn-loading"><Spinner size="sm" /> Recycling…</span> : "Recycle Account"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}