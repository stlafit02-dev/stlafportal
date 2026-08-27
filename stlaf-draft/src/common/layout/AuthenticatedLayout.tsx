import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { ThemeToggle } from "../components/ThemeToggle/ThemeToggle";
import { PageLoader } from "../components/Loader/Loader";
import "./AuthenticatedLayout.css";

export function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { user, logout, isLoggingOut } = useAuth();

  if (isLoggingOut) {
    return <PageLoader label="Signing out…" />;
  }

  return (
    <div className="portal-shell">
      <header className="portal-header">
        <Link to="/portal" className="portal-wordmark">
          STLAF Draft
        </Link>
        <div className="portal-header-actions">
          <ThemeToggle />
          <span className="portal-user">{user?.fullName ?? user?.email}</span>
          <button className="portal-logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>
      <main className="portal-main">{children}</main>
    </div>
  );
}
