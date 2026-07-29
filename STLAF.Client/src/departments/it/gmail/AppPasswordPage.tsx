import { useEffect, useState } from "react";
import { fetchGwsAccounts, fetchAppPasswords, type GwsAccount, type AppPasswordEntry } from "./gmailApi";
import { AppPasswordModal } from "./AppPasswordModal";
import { Spinner } from "../../../common/components/Loader/Loader";
import "./GmailManagementPage.css";
import "./AppPasswordPage.css";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_FILTERS = ["All Status", "Active", "Expired"];

interface PasswordGroup {
  key: string;
  gwsAccountName: string;
  month: number;
  year: number;
  entries: AppPasswordEntry[];
}

function groupEntries(entries: AppPasswordEntry[]): PasswordGroup[] {
  const groups: PasswordGroup[] = [];
  const indexByKey = new Map<string, number>();

  for (const entry of entries) {
    const key = `${entry.gwsAccountId}-${entry.month}-${entry.year}`;
    const existingIndex = indexByKey.get(key);

    if (existingIndex !== undefined) {
      groups[existingIndex].entries.push(entry);
    } else {
      indexByKey.set(key, groups.length);
      groups.push({
        key,
        gwsAccountName: entry.gwsAccountName,
        month: entry.month,
        year: entry.year,
        entries: [entry],
      });
    }
  }

  return groups;
}

export function AppPasswordPage() {
  const [gwsAccounts, setGwsAccounts] = useState<GwsAccount[]>([]);
  const [appPasswords, setAppPasswords] = useState<AppPasswordEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gwsFilter, setGwsFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  async function loadAll() {
    setIsLoading(true);
    const [gws, passwords] = await Promise.all([fetchGwsAccounts(), fetchAppPasswords()]);
    setGwsAccounts(gws);
    setAppPasswords(passwords);
    setIsLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function toggleReveal(id: string) {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const filtered = appPasswords.filter((p) => {
    const matchesGws = gwsFilter === "All" || p.gwsAccountId === gwsFilter;
    const matchesStatus = statusFilter === "All Status" || p.status === statusFilter;
    return matchesGws && matchesStatus;
  });

  const groups = groupEntries(filtered);

  if (isLoading) {
    return (
      <div className="gmail-page-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="gmail-page">
      <div className="gmail-table-panel">
        <div className="gmail-page-header">
          <div>
            <h1 className="page-title">App Passwords</h1>
            <p className="page-subtitle">{appPasswords.length} records</p>
          </div>
          <button className="gmail-primary-btn" onClick={() => setIsModalOpen(true)}>
            + Add Password
          </button>
        </div>

        <div className="app-pw-filters">
          <select value={gwsFilter} onChange={(e) => setGwsFilter(e.target.value)} className="email-gws-filter">
            <option value="All">All GWS</option>
            {gwsAccounts.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="email-gws-filter">
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {groups.length === 0 ? (
          <div className="gmail-empty">
            {appPasswords.length === 0 ? "No app passwords recorded yet." : "No records match your filters."}
          </div>
        ) : (
          <div className="gmail-table-wrap email-table-wrap">
            <table className="gmail-table">
              <thead>
                <tr>
                  <th>GWS Account</th>
                  <th>Month Assigned</th>
                  <th>App Password</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) =>
                  group.entries.map((p, i) => {
                    const isRevealed = revealedIds.has(p.id);
                    return (
                      <tr key={p.id} className={i > 0 ? "app-pw-subrow" : ""}>
                        {i === 0 && (
                          <>
                            <td rowSpan={group.entries.length}>{group.gwsAccountName}</td>
                            <td rowSpan={group.entries.length}>
                              {MONTH_NAMES[group.month - 1]} {group.year}
                            </td>
                          </>
                        )}
                        <td>
                          <div className="app-pw-reveal">
                            <span className="mono-cell">
                              {isRevealed ? p.appPasswordValue : "•••• •••• •••• ••••"}
                            </span>
                            <button
                              type="button"
                              className="password-toggle-btn"
                              onClick={() => toggleReveal(p.id)}
                              aria-label={isRevealed ? "Hide password" : "Show password"}
                            >
                              {isRevealed ? (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                  <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                              ) : (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${p.status === "Active" ? "badge-active" : "badge-expired"}`}>
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                        <td>{p.notes || <span className="unassigned-text">—</span>}</td>
                        <td className="email-date-cell">
                          {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AppPasswordModal
        isOpen={isModalOpen}
        gwsAccounts={gwsAccounts}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => loadAll()}
      />
    </div>
  );
}