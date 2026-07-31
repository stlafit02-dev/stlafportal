import { Modal } from "../../../common/components/Modal/Modal";
import type { Employee } from "./employeeApi";
import "../../it/gmail/GmailForms.css";

interface EmployeeDetailModalProps {
  employee: Employee | null;
  onClose: () => void;
}

export function EmployeeDetailModal({
  employee,
  onClose,
}: EmployeeDetailModalProps) {
  if (!employee) return null;

  return (
    <Modal isOpen={!!employee} onClose={onClose}>
      <div className="gmail-modal">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
          }}
        >
          <div>
            <h2 className="gmail-modal-title" style={{ marginBottom: 4 }}>
              {employee.firstName}{" "}
              {employee.middleName ? employee.middleName[0] + ". " : ""}
              {employee.lastName}
            </h2>
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: 12.5,
                color: "var(--accent-gold)",
              }}
            >
              {employee.companyId}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="gmail-grid">
          <div className="gmail-field">
            <label className="gmail-label">Category</label>
            <div className="recycle-static-value">{employee.categoryName}</div>
          </div>
          <div className="gmail-field">
            <label className="gmail-label">Status</label>
            <div className="recycle-static-value">{employee.status}</div>
          </div>
          <div className="gmail-field">
            <label className="gmail-label">Mobile Number</label>
            <div className="recycle-static-value mono">
              {employee.mobileNumber || "—"}
            </div>
          </div>
          <div className="gmail-field">
            <label className="gmail-label">Age</label>
            <div className="recycle-static-value">{employee.age}</div>
          </div>
          <div className="gmail-field">
            <label className="gmail-label">Sex</label>
            <div className="recycle-static-value">{employee.sex}</div>
          </div>
          <div className="gmail-field">
            <label className="gmail-label">Birthdate</label>
            <div className="recycle-static-value">
              {new Date(employee.bday).toLocaleDateString()}
            </div>
          </div>
          <div className="gmail-field">
            <label className="gmail-label">Nationality</label>
            <div className="recycle-static-value">{employee.nationality}</div>
          </div>
          <div className="gmail-field">
            <label className="gmail-label">Department</label>
            <div className="recycle-static-value">{employee.department}</div>
          </div>
          <div className="gmail-field">
            <label className="gmail-label">Office Position</label>
            <div className="recycle-static-value">
              {employee.officePosition}
            </div>
          </div>
          <div className="gmail-field">
            <label className="gmail-label">Start Date</label>
            <div className="recycle-static-value">
              {new Date(employee.startDate).toLocaleDateString()}
            </div>
          </div>
          <div className="gmail-field">
            <label className="gmail-label">Username</label>
            <div className="recycle-static-value mono">{employee.username}</div>
          </div>
          <div className="gmail-field">
            <label className="gmail-label">Personal Email</label>
            <div className="recycle-static-value mono">
              {employee.personalEmail || "—"}
            </div>
          </div>
          <div className="gmail-field">
            <label className="gmail-label">Company Email</label>
            <div className="recycle-static-value mono">
              {employee.companyEmail || "Unassigned"}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
