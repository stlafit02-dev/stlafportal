import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import "./AuthPages.css";

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();

  if (isAuthenticated) {
    return <Navigate to="/portal" replace />;
  }

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      await login(values.email, values.password);
      navigate("/portal");
    } catch {
      setServerError("Invalid email or password.");
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1 className="page-title">Welcome back</h1>
        <p className="page-subtitle">Log in to your STLAF client account.</p>

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && <span className="field-error">{errors.email.message}</span>}
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && <span className="field-error">{errors.password.message}</span>}
        </label>

        {serverError && <p className="form-error">{serverError}</p>}

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
