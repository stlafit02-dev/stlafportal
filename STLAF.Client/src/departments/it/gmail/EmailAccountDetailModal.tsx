import { useState } from "react";
import { Modal } from "../../../common/components/Modal/Modal";
import type { EmailAccount } from "./gmailApi";
import "./EmailAccountDetailModal.css";

interface EmailAccountDetailModalProps {
  account: EmailAccount | null;
  onClose: () => void;
}

export function EmailAccountDetailModal({ account, onClose }: EmailAccountDetailModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (!account) return null;

  return (
    <Modal isOpen={!!account} onClose={onClose}>
      <div className="email-detail-modal">
        <div className="email-detail-header">
          <h2 className="email-detail-title">Account Details</h2>
          <button className="email-detail-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="email-detail-grid">
          <div className="email-detail-item">
            <span className="email-detail-label">Full Name</span>
            <span className="email-detail-value">{account.fullName}</span>
          </div>
          <div className="email-detail-item">
            <span className="email-detail-label">GWS Account</span>
            <span className="email-detail-value">{account.gwsAccountName}</span>
          </div>
          <div className="email-detail-item">
            <span className="email-detail-label">Local Gmail</span>
            <span className="email-detail-value mono">{account.localGmail}</span>
          </div>
          <div className="email-detail-item">
            <span className="email-detail-label">STLAF Email (alias)</span>
            <span className="email-detail-value mono">{account.stlafEmail}</span>
          </div>
        </div>

        <div className="email-detail-item email-detail-full">
          <span className="email-detail-label">Password</span>
          <div className="password-reveal-box">
            <span className="mono">{showPassword ? account.password : "•".repeat(Math.min(account.password.length, 16))}</span>
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="email-detail-grid">
          <div className="email-detail-item">
            <span className="email-detail-label">Status</span>
            <span className="email-detail-value">{account.status}</span>
          </div>
          <div className="email-detail-item">
            <span className="email-detail-label">Old User</span>
            <span className="email-detail-value">{account.oldUser || "—"}</span>
          </div>
        </div>

        {account.oldStlafEmail && (
          <div className="email-detail-item email-detail-full">
            <span className="email-detail-label">Old STLAF Email (alias)</span>
            <span className="email-detail-value mono">{account.oldStlafEmail}</span>
          </div>
        )}

        {account.remarks && (
          <div className="email-detail-item email-detail-full">
            <span className="email-detail-label">Remarks</span>
            <p className="remarks-text">{account.remarks}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}