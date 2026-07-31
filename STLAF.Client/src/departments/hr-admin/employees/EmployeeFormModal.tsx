import { useState } from "react";
import { Modal } from "../../../common/components/Modal/Modal";
import { Spinner } from "../../../common/components/Loader/Loader";
import {
  createEmployee,
  type EmployeeCategory,
  type CreateEmployeeResult,
} from "./employeeApi";
import "../../it/gmail/GmailForms.css";
import "./EmployeeFormModal.css";

const DEPARTMENTS = [
  "IT",
  "HRAdmin",
  "Litigation",
  "Accounting",
  "Corporate",
  "Marketing",
];
const SEX_OPTIONS = ["Male", "Female"];
const STATUSES = ["Active", "Inactive"];

interface EmployeeFormModalProps {
  isOpen: boolean;
  categories: EmployeeCategory[];
  onClose: () => void;
  onCreated: (employee: CreateEmployeeResult["employee"]) => void;
}

const emptyForm = {
  categoryId: "",
  firstName: "",
  middleName: "",
  lastName: "",
  mobileNumber: "",
  age: "",
  sex: "",
  bday: "",
  nationality: "",
  department: "",
  officePosition: "",
  personalEmail: "",
  companyEmail: "",
  startDate: "",
  status: "Active",
};

export function EmployeeFormModal({
  isOpen,
  categories,
  onClose,
  onCreated,
}: EmployeeFormModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateEmployeeResult | null>(null);
  const [copied, setCopied] = useState(false);

  function updateField<K extends keyof typeof form>(
    field: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetAndClose() {
    setForm(emptyForm);
    setError(null);
    setResult(null);
    setCopied(false);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (new Date(form.bday) >= new Date(form.startDate)) {
      setError("Birthdate must be earlier than the start date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await createEmployee({
        categoryId: form.categoryId,
        firstName: form.firstName,
        middleName: form.middleName || undefined,
        lastName: form.lastName,
        mobileNumber: form.mobileNumber,
        age: parseInt(form.age || "0", 10),
        sex: form.sex,
        bday: form.bday,
        nationality: form.nationality,
        department: form.department,
        officePosition: form.officePosition,
        personalEmail: form.personalEmail || undefined,
        companyEmail: form.companyEmail || undefined,
        startDate: form.startDate,
        status: form.status,
      });
      setResult(created);
      onCreated(created.employee);
    } catch {
      setError("Something went wrong adding this employee. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(
      `Username: ${result.employee.username}\nPassword: ${result.generatedPassword}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose}>
      <div className="employee-modal">
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
              <h2 className="gmail-modal-title">Employee Added</h2>
            </div>

            <p className="employee-result-name">
              {result.employee.firstName} {result.employee.lastName}
            </p>

            <div className="credential-box">
              <div className="credential-row">
                <span className="credential-label">Company ID / Username</span>
                <span className="credential-value mono">
                  {result.employee.username}
                </span>
              </div>
              <div className="credential-row">
                <span className="credential-label">Password</span>
                <span className="credential-value mono">
                  {result.generatedPassword}
                </span>
              </div>
            </div>

            <p className="credential-warning">
              This password is shown only once and cannot be retrieved again.
              Copy or share it with the employee now.
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
            <h2 className="gmail-modal-title">Add Employee</h2>
            <form onSubmit={handleSubmit} className="gmail-form">
              <div className="gmail-field">
                <label className="gmail-label">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => updateField("categoryId", e.target.value)}
                  required
                  className="gmail-input"
                >
                  <option value="" disabled>
                    Select category…
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="gmail-grid">
                <div className="gmail-field">
                  <label className="gmail-label">First Name</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    required
                    className="gmail-input"
                  />
                </div>
                <div className="gmail-field">
                  <label className="gmail-label">Middle Name (optional)</label>
                  <input
                    type="text"
                    value={form.middleName}
                    onChange={(e) => updateField("middleName", e.target.value)}
                    className="gmail-input"
                  />
                </div>
                <div className="gmail-field">
                  <label className="gmail-label">Last Name</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    required
                    className="gmail-input"
                  />
                </div>
                <div className="gmail-field">
                  <label className="gmail-label">Mobile Number</label>
                  <input
                    type="tel"
                    value={form.mobileNumber}
                    onChange={(e) =>
                      updateField("mobileNumber", e.target.value)
                    }
                    required
                    className="gmail-input"
                    placeholder="09XXXXXXXXX"
                  />
                </div>
                <div className="gmail-field">
                  <label className="gmail-label">Age</label>
                  <input
                    type="number"
                    min={16}
                    value={form.age}
                    onChange={(e) => updateField("age", e.target.value)}
                    required
                    className="gmail-input"
                  />
                </div>
                <div className="gmail-field">
                  <label className="gmail-label">Sex</label>
                  <select
                    value={form.sex}
                    onChange={(e) => updateField("sex", e.target.value)}
                    required
                    className="gmail-input"
                  >
                    <option value="" disabled>
                      Select…
                    </option>
                    {SEX_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="gmail-field">
                  <label className="gmail-label">Birthdate</label>
                  <input
                    type="date"
                    value={form.bday}
                    onChange={(e) => updateField("bday", e.target.value)}
                    required
                    className="gmail-input"
                  />
                </div>
                <div className="gmail-field">
                  <label className="gmail-label">Nationality</label>
                  <input
                    type="text"
                    value={form.nationality}
                    onChange={(e) => updateField("nationality", e.target.value)}
                    required
                    className="gmail-input"
                  />
                </div>
                <div className="gmail-field">
                  <label className="gmail-label">Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => updateField("department", e.target.value)}
                    required
                    className="gmail-input"
                  >
                    <option value="" disabled>
                      Select department…
                    </option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="gmail-field">
                  <label className="gmail-label">Office Position</label>
                  <input
                    type="text"
                    value={form.officePosition}
                    onChange={(e) =>
                      updateField("officePosition", e.target.value)
                    }
                    required
                    className="gmail-input"
                  />
                </div>
                <div className="gmail-field">
                  <label className="gmail-label">
                    Personal Email (optional)
                  </label>
                  <input
                    type="email"
                    value={form.personalEmail}
                    onChange={(e) =>
                      updateField("personalEmail", e.target.value)
                    }
                    className="gmail-input"
                  />
                </div>
                <div className="gmail-field">
                  <label className="gmail-label">
                    Company Email (optional — assigned by IT)
                  </label>
                  <input
                    type="email"
                    value={form.companyEmail}
                    onChange={(e) =>
                      updateField("companyEmail", e.target.value)
                    }
                    className="gmail-input"
                    placeholder="Leave blank if not yet assigned"
                  />
                </div>
                <div className="gmail-field">
                  <label className="gmail-label">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => updateField("startDate", e.target.value)}
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
                    "Add Employee"
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
