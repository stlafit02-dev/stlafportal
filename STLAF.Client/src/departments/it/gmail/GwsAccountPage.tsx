import { useEffect, useState } from "react";
import { fetchGwsAccounts, type GwsAccount } from "./gmailApi";
import { GwsAccountModal } from "./GwsAccountModal";
import { Spinner } from "../../../common/components/Loader/Loader";
import "./GwsAccountPage.css";

export function GwsAccountPage() {
  const [accounts, setAccounts] = useState<GwsAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<GwsAccount | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  async function loadAccounts() {
    setIsLoading(true);
    const data = await fetchGwsAccounts();
    setAccounts(data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    function handleFocus() {
      loadAccounts();
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  function handleSaved(account: GwsAccount) {
    setAccounts((prev) => {
      const exists = prev.some((a) => a.id === account.id);
      const next = exists
        ? prev.map((a) => (a.id === account.id ? account : a))
        : [...prev, account];
      return next.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  const filtered = accounts.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  const totalCapacity = accounts.reduce((sum, a) => sum + a.maxCapacity, 0);
  const totalActive = accounts.reduce((sum, a) => sum + a.activeCount, 0);
  const totalUsed = accounts.reduce(
    (sum, a) => sum + a.activeCount + a.inactiveCount,
    0,
  );
  const availableSlots = totalCapacity - totalUsed;

  if (isLoading) {
    return (
      <div className="gws-page-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="gws-page">
      <div className="gws-page-header">
        <h1 className="page-title">GWS Accounts</h1>
        <p className="page-subtitle">
          Google Workspace capacity and usage per workspace.
        </p>
      </div>
      <div className="gws-toolbar">
        <span className="gws-summary-line">
          {accounts.length} {accounts.length === 1 ? "workspace" : "workspaces"}{" "}
          · {totalActive} active of {totalCapacity} total capacity
        </span>
        <div className="gws-toolbar-actions">
          <div className="gws-search-box">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search workspaces…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="gws-search-input"
            />
          </div>
          <button
            className="gws-refresh-btn"
            onClick={loadAccounts}
            aria-label="Refresh"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
          <button className="gws-add-btn" onClick={() => setIsModalOpen(true)}>
            + Add GWS
          </button>
        </div>
      </div>

      <div className="gws-stat-cards">
        <div className="gws-stat-card">
          <span className="gws-stat-label">Total Capacity</span>
          <span className="gws-stat-value">{totalCapacity}</span>
        </div>
        <div className="gws-stat-card">
          <span className="gws-stat-label">Total Active Users</span>
          <span className="gws-stat-value gws-stat-active">{totalActive}</span>
        </div>
        <div className="gws-stat-card">
          <span className="gws-stat-label">Available Slots</span>
          <span className="gws-stat-value gws-stat-free">{availableSlots}</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="gws-empty">
          {accounts.length === 0
            ? "No GWS accounts yet."
            : "No workspaces match your search."}
        </div>
      ) : (
        <div className="gws-grid">
          {filtered.map((a) => {
            const total = a.activeCount + a.inactiveCount;
            const free = Math.max(0, a.maxCapacity - total);
            const pct =
              a.maxCapacity > 0
                ? Math.min(100, (total / a.maxCapacity) * 100)
                : 0;
            const isFull = free === 0;

            return (
              <div key={a.id} className="gws-card">
                <div className="gws-card-header">
                  <h3 className="gws-card-name">{a.name}</h3>
                  <div className="gws-card-header-right">
                    <span
                      className={`gws-status-pill ${isFull ? "gws-status-full" : "gws-status-available"}`}
                    >
                      {isFull ? "Full" : "Available"}
                    </span>
                    <button
                      className="gws-edit-btn"
                      onClick={() => setEditingAccount(a)}
                      aria-label={`Edit ${a.name}`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="gws-card-capacity">
                  Max capacity: {a.maxCapacity}
                </p>

                <div className="gws-mini-stats">
                  <div className="gws-mini-stat">
                    <span className="gws-mini-label">Total</span>
                    <span className="gws-mini-value">{total}</span>
                  </div>
                  <div className="gws-mini-stat">
                    <span className="gws-mini-label">Active</span>
                    <span className="gws-mini-value gws-mini-active">
                      {a.activeCount}
                    </span>
                  </div>
                  <div className="gws-mini-stat">
                    <span className="gws-mini-label">Inactive</span>
                    <span className="gws-mini-value gws-mini-inactive">
                      {a.inactiveCount}
                    </span>
                  </div>
                  <div className="gws-mini-stat">
                    <span className="gws-mini-label">Free</span>
                    <span className="gws-mini-value gws-mini-free">{free}</span>
                  </div>
                </div>

                <div className="gws-usage-row">
                  <span className="gws-usage-label">Usage</span>
                  <span className="gws-usage-pct">{Math.round(pct)}%</span>
                </div>
                <div className="gws-usage-bar">
                  <div
                    className="gws-usage-bar-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="gws-usage-caption">
                  {total} of {a.maxCapacity} slots used
                </p>
              </div>
            );
          })}
        </div>
      )}

      <GwsAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
      />

      <GwsAccountModal
        key={editingAccount?.id ?? "edit-empty"}
        isOpen={!!editingAccount}
        account={editingAccount}
        onClose={() => setEditingAccount(null)}
        onSaved={handleSaved}
      />
    </div>
  );
}
