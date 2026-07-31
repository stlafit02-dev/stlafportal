import { useState } from "react";
import { Modal } from "../../../common/components/Modal/Modal";
import { Spinner } from "../../../common/components/Loader/Loader";
import { createCategory, type EmployeeCategory } from "./employeeApi";
import "../../it/gmail/GmailForms.css";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (category: EmployeeCategory) => void;
}

export function CategoryModal({ isOpen, onClose, onCreated }: CategoryModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetAndClose() {
    setName("");
    setCode("");
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const category = await createCategory({ name, code: parseInt(code || "0", 10) });
      onCreated(category);
      resetAndClose();
    } catch {
      setError("Something went wrong adding this category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose}>
      <div className="gmail-modal">
        <h2 className="gmail-modal-title">Add Employee Category</h2>
        <form onSubmit={handleSubmit} className="gmail-form">
          <div className="gmail-field">
            <label className="gmail-label">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="gmail-input"
              placeholder="e.g. STLAF"
            />
          </div>

          <div className="gmail-field">
            <label className="gmail-label">Code (single digit)</label>
            <input
              type="number"
              min={1}
              max={9}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="gmail-input"
              placeholder="e.g. 1"
            />
          </div>

          {error && <p className="gmail-error">{error}</p>}

          <div className="gmail-actions">
            <button type="button" className="gmail-cancel-btn" onClick={resetAndClose}>
              Cancel
            </button>
            <button type="submit" className="gmail-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? <span className="btn-loading"><Spinner size="sm" /> Saving…</span> : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}