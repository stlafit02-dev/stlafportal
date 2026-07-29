import { useState } from "react";
import { Modal } from "../../../common/components/Modal/Modal";
import { Spinner } from "../../../common/components/Loader/Loader";
import {
  createAppPassword,
  type GwsAccount,
  type AppPasswordEntry,
} from "./gmailApi";
import "./GmailForms.css";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

interface AppPasswordModalProps {
  isOpen: boolean;
  gwsAccounts: GwsAccount[];
  onClose: () => void;
  onCreated: (entry: AppPasswordEntry) => void;
}

export function AppPasswordModal({
  isOpen,
  gwsAccounts,
  onClose,
  onCreated,
}: AppPasswordModalProps) {
  const [gwsAccountId, setGwsAccountId] = useState("");
  const [appPasswordValue, setAppPasswordValue] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function countLetters(value: string): number {
    return value.replace(/[^a-zA-Z0-9]/g, "").length;
  }

  function formatAppPassword(value: string): string {
    const lettersOnly = value
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 16);
    return lettersOnly.match(/.{1,4}/g)?.join(" ") ?? lettersOnly;
  }

  function resetAndClose() {
    setGwsAccountId("");
    setAppPasswordValue("");
    setMonth(new Date().getMonth() + 1);
    setYear(currentYear);
    setNotes("");
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      const entry = await createAppPassword({
        gwsAccountId,
        appPasswordValue,
        month,
        year,
        notes: notes || undefined,
      });
      onCreated(entry);
      resetAndClose();
    } catch {
      setError(
        "Something went wrong saving this app password. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose}>
      <div className="gmail-modal">
        <h2 className="gmail-modal-title">Add App Password</h2>
        <form onSubmit={handleSubmit} className="gmail-form">
          <div className="gmail-field">
            <label className="gmail-label">GWS Account</label>
            <select
              value={gwsAccountId}
              onChange={(e) => setGwsAccountId(e.target.value)}
              required
              className="gmail-input"
            >
              <option value="" disabled>
                Select GWS account…
              </option>
              {gwsAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="gmail-field">
            <label className="gmail-label">App Password</label>
            <input
              type="text"
              value={appPasswordValue}
              onChange={(e) =>
                setAppPasswordValue(formatAppPassword(e.target.value))
              }
              required
              className="gmail-input"
              placeholder="16-Character text"
            />
            <span className="char-count">
              {countLetters(appPasswordValue)}/16
            </span>
            {/* <span className="char-count">{appPasswordValue.length}/16</span> */}
          </div>

          <div className="gmail-grid">
            <div className="gmail-field">
              <label className="gmail-label">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                className="gmail-input"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="gmail-field">
              <label className="gmail-label">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
                className="gmail-input"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="gmail-field">
            <label className="gmail-label">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
                "Add Record"
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
