import { useState } from "react";
import { Modal } from "../../../common/components/Modal/Modal";
import { Spinner } from "../../../common/components/Loader/Loader";
import { createGwsAccount, updateGwsAccount, type GwsAccount } from "./gmailApi";
import "./GmailForms.css";

interface GwsAccountModalProps {
  isOpen: boolean;
  account?: GwsAccount | null;
  onClose: () => void;
  onSaved: (account: GwsAccount) => void;
}

export function GwsAccountModal({ isOpen, account, onClose, onSaved }: GwsAccountModalProps) {
  const isEditMode = !!account;

  const [name, setName] = useState(account?.name ?? "");
  const [maxCapacity, setMaxCapacity] = useState(account ? String(account.maxCapacity) : "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetAndClose() {
    setName(account?.name ?? "");
    setMaxCapacity(account ? String(account.maxCapacity) : "");
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = { name, maxCapacity: parseInt(maxCapacity || "0", 10) };
      const result = isEditMode
        ? await updateGwsAccount(account!.id, payload)
        : await createGwsAccount(payload);
      onSaved(result);
      resetAndClose();
    } catch {
      setError(`Something went wrong ${isEditMode ? "updating" : "adding"} this account. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose}>
      <div className="gmail-modal">
        <h2 className="gmail-modal-title">{isEditMode ? "Edit GWS Account" : "Add GWS Account"}</h2>
        <form onSubmit={handleSubmit} className="gmail-form">
          <div className="gmail-field">
            <label className="gmail-label">Account Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="gmail-input"
              placeholder="e.g. stlaf-org-1"
            />
          </div>

          <div className="gmail-field">
            <label className="gmail-label">Max Capacity</label>
            <input
              type="number"
              min={1}
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(e.target.value)}
              required
              className="gmail-input"
              placeholder="e.g. 30"
            />
          </div>

          {error && <p className="gmail-error">{error}</p>}

          <div className="gmail-actions">
            <button type="button" className="gmail-cancel-btn" onClick={resetAndClose}>
              Cancel
            </button>
            <button type="submit" className="gmail-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="btn-loading"><Spinner size="sm" /> Saving…</span>
              ) : isEditMode ? (
                "Save Changes"
              ) : (
                "Add Account"
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}