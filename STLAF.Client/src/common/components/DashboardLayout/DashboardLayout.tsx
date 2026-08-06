import { useState, type ReactNode } from "react";
import { useAuth } from "../../../auth/useAuth";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { PageLoader } from "../Loader/Loader";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../../../theme/useTheme";
import { useTicketModal } from "../../tickets/useTicketModal";
import logoDark from "../../../assets/dark.png";
import logoLight from "../../../assets/light.png";
import { ChangePasswordModal } from "../../../auth/ChangePasswordModal";
import "./DashboardLayout.css";

export interface NavItem {
  label: string;
  to?: string;
  action?: "submitTicket";
  children?: { label: string; to: string }[];
}

interface DashboardLayoutProps {
  departmentLabel: string;
  navItems: NavItem[];
  children: ReactNode;
}

function NavGroup({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate: () => void;
}) {
  const location = useLocation();
  const isChildActive = item.children!.some((c) =>
    location.pathname.startsWith(c.to),
  );
  const [isOpen, setIsOpen] = useState(isChildActive);

  return (
    <div className="nav-group">
      <button
        className={`nav-item nav-group-toggle ${isChildActive ? "nav-item-active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{item.label}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`nav-chevron ${isOpen ? "nav-chevron-open" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && (
        <div className="nav-subitems">
          {item.children!.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              className={({ isActive }) =>
                `nav-subitem ${isActive ? "nav-subitem-active" : ""}`
              }
              onClick={onNavigate}
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function TicketNavButton({
  label,
  onNavigate,
}: {
  label: string;
  onNavigate: () => void;
}) {
  const { open } = useTicketModal();
  return (
    <button
      className="nav-item"
      onClick={() => {
        open();
        onNavigate();
      }}
    >
      {label}
    </button>
  );
}

export function DashboardLayout({
  departmentLabel,
  navItems,
  children,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, isLoggingOut } = useAuth();
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? logoDark : logoLight;

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
        <span className="mobile-topbar-spacer" />
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
          <img src={logoSrc} alt="STLAF" className="sidebar-logo" />
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
          {navItems.map((item) => {
            if (item.action === "submitTicket") {
              return (
                <TicketNavButton
                  key={item.label}
                  label={item.label}
                  onNavigate={() => setIsSidebarOpen(false)}
                />
              );
            }
            return item.children ? (
              <NavGroup
                key={item.label}
                item={item}
                onNavigate={() => setIsSidebarOpen(false)}
              />
            ) : (
              <NavLink
                key={item.to}
                to={item.to!}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "nav-item-active" : ""}`
                }
                onClick={() => setIsSidebarOpen(false)}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-menu">
            <button
              className="user-menu-trigger"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
            >
              <span className="user-avatar">
                {(user?.fullName ?? "?").charAt(0).toUpperCase()}
              </span>
              <span className="user-menu-info">
                <span className="user-name">{user?.fullName}</span>
                <span className="user-role">{user?.role}</span>
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`user-menu-chevron ${isUserMenuOpen ? "user-menu-chevron-open" : ""}`}
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>

            {isUserMenuOpen && (
              <div className="user-menu-panel">
                <div className="user-menu-theme-row">
                  <span className="sidebar-theme-label">Theme</span>
                  <ThemeToggle />
                </div>

                <button
                  className="user-menu-item"
                  onClick={() => {
                    setIsChangePasswordOpen(true);
                    setIsUserMenuOpen(false);
                  }}
                >
                  Change Password
                </button>

                <button
                  className="user-menu-item user-menu-item-danger"
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-content">{children}</main>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}