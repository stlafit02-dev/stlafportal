import { useState } from "react";
import { Modal } from "../../../common/components/Modal/Modal";
import { Spinner } from "../../../common/components/Loader/Loader";
import {
  createEmailAccount,
  type GwsAccount,
  type EmailAccount,
} from "./gmailApi";
import "./GmailForms.css";
import { generateEmailAlias, EMAIL_DOMAIN } from "./generateAlias";

const STATUSES = ["Active", "Inactive"];

interface EmailAccountModalProps {
  isOpen: boolean;
  gwsAccounts: GwsAccount[];
  onClose: () => void;
  onCreated: (account: EmailAccount) => void;
}

const emptyForm = {
  fullName: "",
  oldUser: "",
  localGmail: "",
  stlafEmail: "",
  password: "",
  status: "Active",
  gwsAccountId: "",
  remarks: "",
};

export function EmailAccountModal({
  isOpen,
  gwsAccounts,
  onClose,
  onCreated,
}: EmailAccountModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [aliasManuallyEdited, setAliasManuallyEdited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof typeof form>(
    field: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetAndClose() {
    setForm(emptyForm);
    setAliasManuallyEdited(false);
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const account = await createEmailAccount({
        fullName: form.fullName,
        oldUser: form.oldUser || undefined,
        localGmail: form.localGmail,
        stlafEmail: form.stlafEmail,
        password: form.password,
        status: form.status,
        gwsAccountId: form.gwsAccountId,
        remarks: form.remarks || undefined,
      });
      onCreated(account);
      resetAndClose();
    } catch {
      setError(
        "Something went wrong adding this email account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  const selectedGws = gwsAccounts.find((g) => g.id === form.gwsAccountId);

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose}>
      <div className="gmail-modal">
        <h2 className="gmail-modal-title">Add Employee Email Account</h2>
        <form onSubmit={handleSubmit} className="gmail-form">
          <div className="gmail-grid">
            <div className="gmail-field">
              <label className="gmail-label">Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => {
                  const newName = e.target.value;
                  updateField("fullName", newName);
                  if (!aliasManuallyEdited) {
                    const alias = generateEmailAlias(newName);
                    updateField(
                      "stlafEmail",
                      alias ? `${alias}@${EMAIL_DOMAIN}` : "",
                    );
                  }
                }}
                required
                className="gmail-input"
              />
            </div>

            <div className="gmail-field">
              <label className="gmail-label">Old User (optional)</label>
              <input
                type="text"
                value={form.oldUser}
                onChange={(e) => updateField("oldUser", e.target.value)}
                className="gmail-input"
              />
            </div>

            <div className="gmail-field">
              <label className="gmail-label">Local Gmail</label>
              <input
                type="email"
                value={form.localGmail}
                onChange={(e) => updateField("localGmail", e.target.value)}
                required
                className="gmail-input"
                placeholder="personal@gmail.com"
              />
            </div>

            <div className="gmail-field">
              <label className="gmail-label">STLAF Email (alias)</label>
              <input
                type="email"
                value={form.stlafEmail}
                onChange={(e) => {
                  setAliasManuallyEdited(true);
                  updateField("stlafEmail", e.target.value);
                }}
                required
                className="gmail-input"
                placeholder={`name@${EMAIL_DOMAIN}`}
              />
            </div>

            <div className="gmail-field">
              <label className="gmail-label">Password</label>
              <input
                type="text"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                required
                className="gmail-input"
              />
            </div>

            <div className="gmail-field">
              <label className="gmail-label">Status</label>
              <select
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
                className="gmail-input"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="gmail-field">
              <label className="gmail-label">GWS Account</label>
              <select
                value={form.gwsAccountId}
                onChange={(e) => updateField("gwsAccountId", e.target.value)}
                required
                className="gmail-input"
              >
                <option value="" disabled>
                  Select GWS account…
                </option>
                {gwsAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.activeCount + a.inactiveCount}/{a.maxCapacity})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedGws && (() => {
            const total = selectedGws.activeCount + selectedGws.inactiveCount;
            const free = Math.max(0, selectedGws.maxCapacity - total);
            const pct = selectedGws.maxCapacity > 0
              ? Math.min(100, (total / selectedGws.maxCapacity) * 100)
              : 0;
            const isFull = free === 0;

            return (
              <div className={`gws-preview-box ${isFull ? "gws-preview-full" : ""}`}>
                <div className="gws-preview-top">
                  <span className="gws-preview-name">
                    {selectedGws.name} — {isFull ? "Full" : "Available"}
                  </span>
                  <span className="gws-preview-count">{total} / {selectedGws.maxCapacity}</span>
                </div>
                <div className="gws-preview-bar">
                  <div className="gws-preview-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <p className="gws-preview-caption">{free} slots available</p>
              </div>
            );
          })()}

          <div className="gmail-field">
            <label className="gmail-label">Remarks (optional)</label>
            <textarea
              value={form.remarks}
              onChange={(e) => updateField("remarks", e.target.value)}
              rows={3}
              className="gmail-input gmail-textarea"
            />
          </div>

          {error && <p className="gmail-error">{error}</p>}

          <div className="gmail-actions">
            <button
              type="button"
              className="gmail-cancel-btn"
              onClick={resetAndClose}
            >
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
                "Add Email Account"
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}