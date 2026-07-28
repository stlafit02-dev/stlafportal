import { useState, type ReactNode } from "react";
import { useAuth } from "../../../auth/useAuth";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { PageLoader } from "../Loader/Loader";
import { NavLink } from "react-router-dom";
import "./DashboardLayout.css";

export interface NavItem {
  label: string;
  to: string;
}

interface DashboardLayoutProps {
  departmentLabel: string;
  navItems: NavItem[];
  children: ReactNode;
}

export function DashboardLayout({
  departmentLabel,
  navItems,
  children,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout, isLoggingOut } = useAuth();

  if (isLoggingOut) {
    return <PageLoader label="Signing out…" />;
  }

  return (
    <div className="dashboard-shell">
      {/* Mobile/tablet top bar */}
      <div className="mobile-topbar">
        <button
          className="hamburger-btn"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open menu"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="mobile-wordmark">STLAF</span>
        <div style={{ width: 22 }} />
      </div>

      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <span className="sidebar-wordmark">STLAF</span>
          <button
            className="sidebar-close-btn"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="sidebar-department">{departmentLabel}</p>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? "nav-item-active" : ""}`
              }
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
            <div className="user-info">
              <span className="user-name">{user?.fullName}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-content">{children}</main>
    </div>
  );
}
