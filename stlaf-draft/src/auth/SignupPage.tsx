import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./useAuth";
import "./AuthPages.css";

interface SignupFormValues {
  fullName: string;
  email: string;
  password: string;
}

export function SignupPage() {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>();

  if (isAuthenticated) {
    return <Navigate to="/portal" replace />;
  }

  async function onSubmit(values: SignupFormValues) {
    setServerError(null);
    try {
      await signup(values.email, values.password, values.fullName);
      navigate("/portal");
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : null;
      setServerError(message ?? "Could not create your account.");
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1 className="page-title">Create your account</h1>
        <p className="page-subtitle">Sign up to submit service requests and get your documents.</p>

        <label className="auth-field">
          <span>Full name</span>
          <input
            type="text"
            autoComplete="name"
            {...register("fullName", { required: "Full name is required" })}
          />
          {errors.fullName && <span className="field-error">{errors.fullName.message}</span>}
        </label>

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
            autoComplete="new-password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" },
            })}
          />
          {errors.password && <span className="field-error">{errors.password.message}</span>}
        </label>

        {serverError && <p className="form-error">{serverError}</p>}

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Sign up"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
