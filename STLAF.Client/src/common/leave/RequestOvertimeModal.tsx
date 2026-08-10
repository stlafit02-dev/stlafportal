import { useState } from "react";
import { Modal } from "../components/Modal/Modal";
import { Spinner } from "../components/Loader/Loader";
import { createOvertimeRequest, type OvertimeRequest } from "./overtimeApi";
import type { EmployeeProfile } from "./leaveApi";
import "../../departments/it/gmail/GmailForms.css";

interface RequestOvertimeModalProps {
  isOpen: boolean;
  profile: EmployeeProfile;
  onClose: () => void;
  onCreated: (request: OvertimeRequest) => void;
}

export function RequestOvertimeModal({ isOpen, profile, onClose, onCreated }: RequestOvertimeModalProps) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetAndClose() {
    setDate("");
    setStartTime("");
    setEndTime("");
    setReason("");
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const request = await createOvertimeRequest({ date, startTime, endTime, reason });
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
        <h2 className="gmail-modal-title">Request Overtime</h2>

        <div className="editing-badge">
          <span className="editing-badge-label">{profile.department} · {profile.officePosition}</span>
          <span className="editing-badge-value">{profile.fullName} ({profile.companyId})</span>
        </div>

        <form onSubmit={handleSubmit} className="gmail-form">
          <div className="gmail-field">
            <label className="gmail-label">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="gmail-input" />
          </div>

          <div className="gmail-grid">
            <div className="gmail-field">
              <label className="gmail-label">Time In</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="gmail-input" />
            </div>
            <div className="gmail-field">
              <label className="gmail-label">Time Out</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className="gmail-input" />
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