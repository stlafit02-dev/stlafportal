import { useState } from "react";
import { Modal } from "../../../common/components/Modal/Modal";
import { Spinner } from "../../../common/components/Loader/Loader";
import { updateEmployee, type Employee } from "./employeeApi";
import "../../it/gmail/GmailForms.css";

const DEPARTMENTS = [
  "IT",
  "HRAdmin",
  "Litigation",
  "Accounting",
  "Corporate",
  "Marketing",
  "Partner",
];
const SEX_OPTIONS = ["Male", "Female"];
const STATUSES = ["Active", "Inactive"];

interface EmployeeEditModalProps {
  employee: Employee | null;
  onClose: () => void;
  onSaved: (employee: Employee) => void;
}

export function EmployeeEditModal({
  employee,
  onClose,
  onSaved,
}: EmployeeEditModalProps) {
  if (!employee) return null;
  const current = employee;

  const [firstName, setFirstName] = useState(current.firstName);
  const [middleName, setMiddleName] = useState(current.middleName ?? "");
  const [lastName, setLastName] = useState(current.lastName);
  const [mobileNumber, setMobileNumber] = useState(current.mobileNumber ?? "");
  const [age, setAge] = useState(String(current.age));
  const [sex, setSex] = useState(current.sex);
  const [bday, setBday] = useState(current.bday.slice(0, 10));
  const [nationality, setNationality] = useState(current.nationality);
  const [department, setDepartment] = useState(current.department);
  const [officePosition, setOfficePosition] = useState(current.officePosition);
  const [personalEmail, setPersonalEmail] = useState(
    current.personalEmail ?? "",
  );
  const [companyEmail, setCompanyEmail] = useState(current.companyEmail ?? "");
  const [startDate, setStartDate] = useState(current.startDate.slice(0, 10));
  const [status, setStatus] = useState(current.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const updated = await updateEmployee(current.id, {
        firstName,
        middleName: middleName || undefined,
        lastName,
        mobileNumber: mobileNumber || undefined,
        age: parseInt(age || "0", 10),
        sex,
        bday,
        nationality,
        department,
        officePosition,
        personalEmail: personalEmail || undefined,
        companyEmail: companyEmail || undefined,
        startDate,
        status,
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
    <Modal isOpen={!!employee} onClose={onClose}>
      <div className="gmail-modal" style={{ width: 680 }}>
        <h2 className="gmail-modal-title">Edit Employee</h2>

        <div className="editing-badge">
          <span className="editing-badge-label">Editing</span>
          <span className="editing-badge-value">{current.companyId}</span>
        </div>

        <form onSubmit={handleSubmit} className="gmail-form">
          <div className="gmail-grid">
            <div className="gmail-field">
              <label className="gmail-label">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="gmail-input"
              />
            </div>
            <div className="gmail-field">
              <label className="gmail-label">Middle Name</label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                className="gmail-input"
              />
            </div>
            <div className="gmail-field">
              <label className="gmail-label">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="gmail-input"
              />
            </div>
            <div className="gmail-field">
              <label className="gmail-label">Mobile Number</label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="gmail-input"
              />
            </div>
            <div className="gmail-field">
              <label className="gmail-label">Age</label>
              <input
                type="number"
                min={16}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="gmail-input"
              />
            </div>
            <div className="gmail-field">
              <label className="gmail-label">Sex</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                required
                className="gmail-input"
              >
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
                value={bday}
                onChange={(e) => setBday(e.target.value)}
                required
                className="gmail-input"
              />
            </div>
            <div className="gmail-field">
              <label className="gmail-label">Nationality</label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                required
                className="gmail-input"
              />
            </div>
            <div className="gmail-field">
              <label className="gmail-label">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className="gmail-input"
              >
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
                value={officePosition}
                onChange={(e) => setOfficePosition(e.target.value)}
                required
                className="gmail-input"
              />
            </div>
            <div className="gmail-field">
              <label className="gmail-label">Personal Email</label>
              <input
                type="email"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
                className="gmail-input"
              />
            </div>
            <div className="gmail-field">
              <label className="gmail-label">Company Email</label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="gmail-input"
              />
            </div>
            <div className="gmail-field">
              <label className="gmail-label">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="gmail-input"
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
          </div>

          {error && <p className="gmail-error">{error}</p>}

          <div className="gmail-actions">
            <button
              type="button"
              className="gmail-cancel-btn"
              onClick={onClose}
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
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
