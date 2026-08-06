import { useState } from "react";
import { Modal } from "../components/Modal/Modal";
import { Spinner } from "../components/Loader/Loader";
import {
  createLeaveRequest,
  type EmployeeProfile,
  type LeaveType,
  type LeaveRequest,
} from "./leaveApi";
import "../../departments/it/gmail/GmailForms.css";

interface RequestLeaveModalProps {
  isOpen: boolean;
  profile: EmployeeProfile;
  leaveTypes: LeaveType[];
  onClose: () => void;
  onCreated: (request: LeaveRequest) => void;
}

export function RequestLeaveModal({
  isOpen,
  profile,
  leaveTypes,
  onClose,
  onCreated,
}: RequestLeaveModalProps) {
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMedicalBlockModal, setShowMedicalBlockModal] = useState(false);

  function resetAndClose() {
    setLeaveTypeId("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be before the start date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const request = await createLeaveRequest({
        leaveTypeId,
        startDate,
        endDate,
        reason,
      });
      onCreated(request);
      resetAndClose();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        "Something went wrong submitting your request. Please try again.";

      if (message.includes("pending medical certificate")) {
        setShowMedicalBlockModal(true);
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose}>
      <div className="gmail-modal">
        <h2 className="gmail-modal-title">Request Leave</h2>

        <div className="editing-badge">
          <span className="editing-badge-label">
            {profile.department} · {profile.officePosition}
          </span>
          <span className="editing-badge-value">
            {profile.fullName} ({profile.companyId})
          </span>
        </div>

        <form onSubmit={handleSubmit} className="gmail-form">
          <div className="gmail-field">
            <label className="gmail-label">Leave Type</label>
            <select
              value={leaveTypeId}
              onChange={(e) => setLeaveTypeId(e.target.value)}
              required
              className="gmail-input"
            >
              <option value="" disabled>
                Select leave type…
              </option>
              {leaveTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="gmail-grid">
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
              <label className="gmail-label">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="gmail-input"
              />
            </div>
          </div>

          <div className="gmail-field">
            <label className="gmail-label">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
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
                  <Spinner size="sm" /> Submitting…
                </span>
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </form>
      </div>

      {showMedicalBlockModal && (
        <Modal isOpen={showMedicalBlockModal} onClose={() => setShowMedicalBlockModal(false)}>
          <div className="gmail-modal" style={{ width: 420, textAlign: "center" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "rgba(230, 150, 60, 0.15)",
                color: "#E8A44C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              </svg>
            </div>
            <h2 className="gmail-modal-title" style={{ marginBottom: 10 }}>Leave Submission On Hold</h2>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 24 }}>
              You have a pending medical certificate that must be uploaded and verified by HR before you can submit a new leave request.
            </p>
            <button
              className="gmail-submit-btn"
              onClick={() => {
                setShowMedicalBlockModal(false);
                resetAndClose();
              }}
            >
              Got It
            </button>
          </div>
        </Modal>
      )}
    </Modal>
  );
}