import { useState } from "react";
import { isAxiosError } from "axios";
import { Modal } from "../../../common/components/Modal/Modal";
import { Spinner } from "../../../common/components/Loader/Loader";
import { createIntern, type InternAccount } from "./internAccountApi";
import "../../it/gmail/GmailForms.css";
import "../../hr-admin/employees/EmployeeFormModal.css";

interface InternFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (intern: InternAccount) => void;
}

export function InternFormModal({
  isOpen,
  onClose,
  onCreated,
}: InternFormModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InternAccount | null>(null);
  const [copied, setCopied] = useState(false);

  function resetAndClose() {
    setEmail("");
    setPassword("");
    setError(null);
    setResult(null);
    setCopied(false);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const created = await createIntern({ email: email.trim(), password });
      setResult(created);
      onCreated(created);
    } catch (err) {
      const message =
        isAxiosError(err) && err.response?.data?.message
          ? (err.response.data.message as string)
          : "Something went wrong adding this intern. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(`Email: ${result.email}\nPassword: ${password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose}>
      <div className="employee-modal" style={{ width: 440 }}>
        {result ? (
          <div className="employee-result">
            <div className="employee-result-header">
              <span className="success-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <h2 className="gmail-modal-title">Intern Added</h2>
            </div>

            <p className="employee-result-name">{result.companyId}</p>

            <div className="credential-box">
              <div className="credential-row">
                <span className="credential-label">Email</span>
                <span className="credential-value mono">{result.email}</span>
              </div>
              <div className="credential-row">
                <span className="credential-label">Password</span>
                <span className="credential-value mono">{password}</span>
              </div>
            </div>

            <p className="credential-warning">
              Share these sign-in details with the intern now — the password
              won't be shown again.
            </p>

            <div className="gmail-actions">
              <button
                type="button"
                className="gmail-cancel-btn"
                onClick={handleCopy}
              >
                {copied ? "Copied!" : "Copy Credentials"}
              </button>
              <button
                type="button"
                className="gmail-submit-btn"
                onClick={resetAndClose}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="gmail-modal-title">Add Intern</h2>
            <form onSubmit={handleSubmit} className="gmail-form">
              <div className="gmail-field">
                <label className="gmail-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="gmail-input"
                  placeholder="intern@stlaf.global"
                />
              </div>
              <div className="gmail-field">
                <label className="gmail-label">Password</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="gmail-input"
                  placeholder="At least 6 characters"
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
                    "Add Intern"
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
