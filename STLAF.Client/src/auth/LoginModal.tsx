import { useState } from "react";
import { Modal } from "../common/components/Modal/Modal";
import { Spinner } from "../common/components/Loader/Loader";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";
import "./LoginModal.css";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEPARTMENT_ROUTES: Record<string, string> = {
  IT: "/dashboard",
  HRAdmin: "/dashboard/hr-admin",
  Litigation: "/dashboard/litigation",
  Accounting: "/dashboard/accounting",
  Corporate: "/dashboard/corporate",
  Marketing: "/dashboard/marketing",
};

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      const storedUser = JSON.parse(localStorage.getItem("stlaf_user") || "{}");
      const route = DEPARTMENT_ROUTES[storedUser.department] || "/";
      onClose();
      navigate(route);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Invalid email or password.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="login-title">Sign in to STLAF</h2>
      <p className="login-subtitle">Enter your firm credentials to continue.</p>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="field-group">
          <label className="field-label">Company ID or Email</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="field-input"
            placeholder="e.g. 26-10001 or you@stlaf.global"
          />
        </div>

        <div className="field-group">
          <label className="field-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="field-input"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="login-error">{error}</p>}

        <button type="submit" disabled={isSubmitting} className="login-submit">
          {isSubmitting ? (
            <span className="btn-loading">
              <Spinner size="sm" />
              Signing in…
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </Modal>
  );
}
