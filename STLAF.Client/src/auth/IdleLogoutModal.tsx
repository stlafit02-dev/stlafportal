import { Modal } from "../common/components/Modal/Modal";
import "./IdleLogoutModal.css";

interface IdleLogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IdleLogoutModal({ isOpen, onClose }: IdleLogoutModalProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="idle-modal">
        <div className="idle-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h2 className="idle-title">Session Ended</h2>
        <p className="idle-message">
          You were signed out automatically after 15 minutes of inactivity, to keep your account secure.
        </p>
        <button className="idle-ok-btn" onClick={onClose}>
          Return to Sign In
        </button>
      </div>
    </Modal>
  );
}