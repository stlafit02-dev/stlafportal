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
  IT: "/it",
  HRAdmin: "/hr-admin",
  Litigation: "/litigation",
  Accounting: "/accounting",
  Corporate: "/corporate",
  Marketing: "/marketing",
  Partner: "/partner",
};

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

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
          <div className="password-input-wrap">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="field-input"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="password-toggle-inset"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
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
