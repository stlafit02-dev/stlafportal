import { useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { ThemeToggle } from "../components/ThemeToggle/ThemeToggle";
import { PageLoader } from "../components/Loader/Loader";
import "./AuthenticatedLayout.css";

const NAV_ITEMS = [
  { label: "Request a document", to: "/portal" },
  { label: "Redeem voucher", to: "/redeem" },
];

export function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout, isLoggingOut } = useAuth();

  if (isLoggingOut) {
    return <PageLoader label="Signing out…" />;
  }

  return (
    <div className="portal-shell">
      <div className="mobile-topbar">
        <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <Link to="/portal" className="portal-wordmark">
          STLAF Draft
        </Link>
        <span className="mobile-topbar-spacer" />
      </div>

      {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <Link to="/portal" className="portal-wordmark" onClick={() => setIsSidebarOpen(false)}>
            STLAF Draft
          </Link>
          <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)} aria-label="Close menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-theme-row">
            <span className="sidebar-theme-label">Theme</span>
            <ThemeToggle />
          </div>
          <div className="sidebar-user">
            <span className="user-avatar">{(user?.fullName ?? "?").charAt(0).toUpperCase()}</span>
            <span className="user-info">
              <span className="user-name">{user?.fullName ?? user?.email}</span>
              {user?.fullName && <span className="user-email">{user.email}</span>}
            </span>
          </div>
          <button className="portal-logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="portal-main">{children}</main>
    </div>
  );
}
