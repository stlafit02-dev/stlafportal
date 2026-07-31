import { useState } from "react";
import { Modal } from "../components/Modal/Modal";
import { Spinner } from "../components/Loader/Loader";
import { createLeaveRequest, type EmployeeProfile, type LeaveType, type LeaveRequest } from "./leaveApi";
import "../../departments/it/gmail/GmailForms.css";

interface RequestLeaveModalProps {
  isOpen: boolean;
  profile: EmployeeProfile;
  leaveTypes: LeaveType[];
  onClose: () => void;
  onCreated: (request: LeaveRequest) => void;
}

export function RequestLeaveModal({ isOpen, profile, leaveTypes, onClose, onCreated }: RequestLeaveModalProps) {
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const request = await createLeaveRequest({ leaveTypeId, startDate, endDate, reason });
      onCreated(request);
      resetAndClose();
    } catch {
      setError("Something went wrong submitting your request. Please try again.");
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
          <span className="editing-badge-label">{profile.department} · {profile.officePosition}</span>
          <span className="editing-badge-value">{profile.fullName} ({profile.companyId})</span>
        </div>

        <form onSubmit={handleSubmit} className="gmail-form">
          <div className="gmail-field">
            <label className="gmail-label">Leave Type</label>
            <select value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)} required className="gmail-input">
              <option value="" disabled>Select leave type…</option>
              {leaveTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="gmail-grid">
            <div className="gmail-field">
              <label className="gmail-label">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="gmail-input" />
            </div>
            <div className="gmail-field">
              <label className="gmail-label">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="gmail-input" />
            </div>
          </div>

          <div className="gmail-field">
            <label className="gmail-label">Reason</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} required rows={3} className="gmail-input gmail-textarea" />
          </div>

          {error && <p className="gmail-error">{error}</p>}

          <div className="gmail-actions">
            <button type="button" className="gmail-cancel-btn" onClick={resetAndClose}>Cancel</button>
            <button type="submit" className="gmail-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? <span className="btn-loading"><Spinner size="sm" /> Submitting…</span> : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}