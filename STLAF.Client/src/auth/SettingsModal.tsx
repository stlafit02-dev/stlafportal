import { useEffect, useState } from "react";
import { Modal } from "../common/components/Modal/Modal";
import { Spinner } from "../common/components/Loader/Loader";
import { useAuth } from "./useAuth";
import { changePassword } from "./accountApi";
import { fetchMyTicketProfile } from "../departments/it/ticketing/ticketingApi";
import "../departments/it/gmail/GmailForms.css";
import "./SettingsModal.css";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatDepartment(department: string | undefined): string | undefined {
  if (department === "HRAdmin") return "HR Admin";
  return department;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user } = useAuth();

  // hr_employees.company_email — falls back to the login identity's email if this
  // account has no linked employee record.
  const [companyEmail, setCompanyEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetchMyTicketProfile().then(
      (profile) => setCompanyEmail(profile.companyEmail),
      () => setCompanyEmail(null),
    );
  }, [isOpen]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function resetAndClose() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccessMessage(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await changePassword({ currentPassword, newPassword });
      setSuccessMessage(result.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose}>
      <div className="gmail-modal settings-modal">
        <h2 className="gmail-modal-title">Settings</h2>

        <section>
          <h3 className="settings-section-title">Your Information</h3>
          <div className="settings-info-grid">
            <div className="settings-info-item">
              <span className="settings-info-label">Full Name</span>
              <span className="settings-info-value">{user?.fullName}</span>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-label">Email</span>
              <span className="settings-info-value">{companyEmail ?? user?.email}</span>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-label">Department</span>
              <span className="settings-info-value">{formatDepartment(user?.department)}</span>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-label">Position</span>
              <span className="settings-info-value">{user?.officePosition || user?.role}</span>
            </div>
          </div>
        </section>

        <section className="settings-section-divider">
          <h3 className="settings-section-title">Change Password</h3>
          <form onSubmit={handleSubmit} className="gmail-form">
            <div className="gmail-field">
              <label className="gmail-label">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="gmail-input"
              />
            </div>

            <div className="gmail-field">
              <label className="gmail-label">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="gmail-input"
                placeholder="At least 6 characters"
              />
            </div>

            <div className="gmail-field">
              <label className="gmail-label">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="gmail-input"
              />
            </div>

            {error && <p className="gmail-error">{error}</p>}
            {successMessage && (
              <p style={{ fontSize: 13, color: "#4FCB84", margin: 0 }}>{successMessage}</p>
            )}

            <div className="gmail-actions">
              <button type="button" className="gmail-cancel-btn" onClick={resetAndClose}>
                Close
              </button>
              <button type="submit" className="gmail-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? <span className="btn-loading"><Spinner size="sm" /> Updating…</span> : "Update Password"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </Modal>
  );
}
