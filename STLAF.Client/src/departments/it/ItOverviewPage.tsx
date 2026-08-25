import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { useModuleAccessPositions } from "../../common/access/useModuleAccess";
import { Spinner } from "../../common/components/Loader/Loader";
import { fetchSummary, fetchAllTickets, type Ticket, type TicketSummary } from "./ticketing/ticketingApi";
import { TicketVolumeChart } from "./ticketing/TicketVolumeChart";
import { fetchAssets, type Asset } from "./assets/assetApi";
import { fetchEmailAccounts, type EmailAccount } from "./gmail/gmailApi";
import "./ItOverviewPage.css";

const REFRESH_MS = 30000;

const STATUS_CARDS: { key: keyof TicketSummary; label: string; accent: string }[] = [
  { key: "open", label: "Open", accent: "ov-accent-open" },
  { key: "inProgress", label: "In Progress", accent: "ov-accent-progress" },
  { key: "onHold", label: "On Hold", accent: "ov-accent-hold" },
  { key: "resolved", label: "Resolved", accent: "ov-accent-resolved" },
  { key: "closed", label: "Closed", accent: "ov-accent-closed" },
];

function AssetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

export function ItOverviewPage() {
  const { user } = useAuth();
  const { positions, isLoaded } = useModuleAccessPositions();

  const isBypassed = user?.role === "SuperAdmin" || user?.role === "DeptAdmin";
  function hasModule(module: string): boolean {
    return (
      isBypassed ||
      (!!user?.officePosition &&
        positions.some((p) => p.module === module && p.officePosition === user.officePosition))
    );
  }
  const canTicketing = hasModule("it-ticketing");
  const canAssets = hasModule("it-assets");
  const canGmail = hasModule("it-gmail");

  const [ticketSummary, setTicketSummary] = useState<TicketSummary | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetchSummary()
        .then((data) => {
          if (!cancelled) setTicketSummary(data);
        })
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !canTicketing) return;
    let cancelled = false;
    function load() {
      fetchAllTickets()
        .then((data) => {
          if (!cancelled) {
            setTickets(data);
            setIsLoadingTickets(false);
          }
        })
        .catch(() => {
          if (!cancelled) setIsLoadingTickets(false);
        });
    }
    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isLoaded, canTicketing]);

  useEffect(() => {
    if (!isLoaded || !canAssets) return;
    let cancelled = false;
    fetchAssets()
      .then((data) => {
        if (!cancelled) {
          setAssets(data);
          setIsLoadingAssets(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoadingAssets(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoaded, canAssets]);

  useEffect(() => {
    if (!isLoaded || !canGmail) return;
    let cancelled = false;
    fetchEmailAccounts()
      .then((data) => {
        if (!cancelled) {
          setEmailAccounts(data);
          setIsLoadingEmails(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoadingEmails(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoaded, canGmail]);

  const assignedCount = assets.filter((a) => a.status === "Assigned").length;
  const availableCount = assets.filter((a) => a.status === "Available").length;
  const activeEmailCount = emailAccounts.filter((e) => e.status === "Active").length;
  const inactiveEmailCount = emailAccounts.filter((e) => e.status === "Inactive").length;

  const firstName = user?.fullName?.split(" ")[0] ?? "there";
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const showSidePanel = canAssets || canGmail;

  return (
    <div className="gmail-page">
      <div className="gmail-page-header">
        <div>
          <h1 className="page-title">Welcome, {firstName}</h1>
          <p className="page-subtitle">IT Department</p>
        </div>
        <div className="ov-header-date">{todayLabel}</div>
      </div>

      <section className="ov-section">
        <h2 className="ov-section-title">Ticket Status</h2>
        <div className="ov-stat-grid">
          {STATUS_CARDS.map((c) => (
            <div key={c.key} className={`ov-stat-card ${c.accent}`}>
              <span className="ov-stat-value">{ticketSummary ? ticketSummary[c.key] : "–"}</span>
              <span className="ov-stat-label">{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {(canTicketing || showSidePanel) && (
        <section className="ov-columns">
          {canTicketing && (
            <div className="ov-panel ov-panel-wide">
              <h2 className="ov-panel-title">
                <span className="ov-panel-title-bar" />
                Ticket Volume
              </h2>
              {isLoadingTickets ? (
                <div className="ov-panel-loading">
                  <Spinner size="md" />
                </div>
              ) : (
                <TicketVolumeChart tickets={tickets} />
              )}
            </div>
          )}

          {showSidePanel && (
            <div className="ov-panel">
              {canAssets && (
                <div className="ov-subpanel">
                  <h3 className="ov-subpanel-title">
                    <span className="ov-subpanel-icon">
                      <AssetIcon />
                    </span>
                    Asset Management
                  </h3>
                  {isLoadingAssets ? (
                    <div className="ov-panel-loading ov-panel-loading-sm">
                      <Spinner size="sm" />
                    </div>
                  ) : (
                    <div className="ov-stat-rows">
                      <div className="ov-stat-row">
                        <span className="ov-stat-row-label">Assigned</span>
                        <span className="ov-stat-row-value">{assignedCount}</span>
                      </div>
                      <div className="ov-stat-row">
                        <span className="ov-stat-row-label">Available</span>
                        <span className="ov-stat-row-value">{availableCount}</span>
                      </div>
                      <div className="ov-stat-row ov-stat-row-total">
                        <span className="ov-stat-row-label">Total Assets</span>
                        <span className="ov-stat-row-value">{assets.length}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {canGmail && (
                <div className="ov-subpanel">
                  <h3 className="ov-subpanel-title">
                    <span className="ov-subpanel-icon">
                      <MailIcon />
                    </span>
                    Gmail Management
                  </h3>
                  {isLoadingEmails ? (
                    <div className="ov-panel-loading ov-panel-loading-sm">
                      <Spinner size="sm" />
                    </div>
                  ) : (
                    <div className="ov-stat-rows">
                      <div className="ov-stat-row">
                        <span className="ov-stat-row-label">Active</span>
                        <span className="ov-stat-row-value">{activeEmailCount}</span>
                      </div>
                      <div className="ov-stat-row">
                        <span className="ov-stat-row-label">Inactive</span>
                        <span className="ov-stat-row-value">{inactiveEmailCount}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
