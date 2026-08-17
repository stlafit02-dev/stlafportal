import { useEffect, useState } from "react";
import {
  fetchGwsAccounts,
  fetchEmailAccounts,
  deleteEmailAccount,
  type GwsAccount,
  type EmailAccount,
} from "./gmailApi";
import { EmailAccountModal } from "./EmailAccountModal";
import { EmailAccountDetailModal } from "./EmailAccountDetailModal";
import { EmailAccountEditModal } from "./EmailAccountEditModal";
import { RecycleAccountModal } from "./RecycleAccountModal";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog/ConfirmDialog";
import { Toast } from "../../../common/components/Toast/Toast";
import { Spinner } from "../../../common/components/Loader/Loader";
import "./GmailManagementPage.css";
import "./EmailAccountPage.css";

export function EmailAccountPage() {
  const [gwsAccounts, setGwsAccounts] = useState<GwsAccount[]>([]);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [gwsFilter, setGwsFilter] = useState("All");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewAccount, setViewAccount] = useState<EmailAccount | null>(null);
  const [editAccount, setEditAccount] = useState<EmailAccount | null>(null);
  const [recycleAccount, setRecycleAccount] = useState<EmailAccount | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] = useState<EmailAccount | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  async function loadAll() {
    const [gws, emails] = await Promise.all([
      fetchGwsAccounts(),
      fetchEmailAccounts(),
    ]);
    setGwsAccounts(gws);
    setEmailAccounts(emails);
    setIsLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function handleCreated(account: EmailAccount) {
    setEmailAccounts((prev) => [account, ...prev]);
    fetchGwsAccounts().then(setGwsAccounts);
  }

  function handleSaved(account: EmailAccount) {
    setEmailAccounts((prev) =>
      prev.map((e) => (e.id === account.id ? account : e)),
    );
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const account = pendingDelete;
    setPendingDelete(null);

    await deleteEmailAccount(account.id);
    setEmailAccounts((prev) => prev.filter((e) => e.id !== account.id));
    setToastMessage(`${account.stlafEmail} removed.`);
    setIsToastVisible(true);
  }

  function handleRowClick(account: EmailAccount) {
    if (account.status === "Inactive") {
      setRecycleAccount(account);
    } else {
      setViewAccount(account);
    }
  }

  const filtered = emailAccounts.filter((e) => {
    const matchesGws = gwsFilter === "All" || e.gwsAccountId === gwsFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      e.fullName.toLowerCase().includes(query) ||
      e.stlafEmail.toLowerCase().includes(query) ||
      e.localGmail.toLowerCase().includes(query);
    return matchesGws && matchesSearch;
  });

  return (
    <div className="email-page">
      <div className="email-toolbar-header">
        <div>
          <h1 className="page-title">Total Accounts</h1>
          <p className="page-subtitle">
            {emailAccounts.length} records · Click row to view details
          </p>
        </div>
        <button
          className="gmail-primary-btn"
          onClick={() => setIsAddModalOpen(true)}
        >
          + Email Account
        </button>
      </div>

      <div className="email-toolbar">
        <div className="email-search-box">
          <svg
            width="16"
            height="16"
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
            placeholder="Search by name, email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="email-search-input"
          />
        </div>

        <select
          value={gwsFilter}
          onChange={(e) => setGwsFilter(e.target.value)}
          className="email-gws-filter"
        >
          <option value="All">All GWS</option>
          {gwsAccounts.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div className="email-table-panel">
        {isLoading ? (
          <div className="email-loading">
            <Spinner size="md" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="email-empty">
            <p>
              {emailAccounts.length === 0
                ? "No email accounts yet."
                : "No accounts match your search or filter."}
            </p>
          </div>
        ) : (
          <div className="email-table-wrap">
            <table className="email-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Local Gmail</th>
                  <th>STLAF Email (Alias)</th>
                  <th>GWS</th>
                  <th>Status</th>
                  <th>Old User</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr
                    key={e.id}
                    className="email-row"
                    onClick={() => handleRowClick(e)}
                  >
                    <td>{e.fullName}</td>
                    <td className="mono-cell">{e.localGmail}</td>
                    <td className="mono-cell">{e.stlafEmail}</td>
                    <td>{e.gwsAccountName}</td>
                    <td>
                      <span
                        className={`status-badge ${e.status === "Active" ? "badge-active" : "badge-inactive"}`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td>
                      {e.oldUser || <span className="unassigned-text">—</span>}
                    </td>
                    <td className="email-date-cell">
                      {new Date(e.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td onClick={(evt) => evt.stopPropagation()}>
                      <div className="action-icons">
                        <button
                          className="icon-btn"
                          onClick={() => setEditAccount(e)}
                          aria-label="Edit account"
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
                        <button
                          className="icon-btn icon-btn-danger"
                          onClick={() => setPendingDelete(e)}
                          aria-label="Delete account"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EmailAccountModal
        isOpen={isAddModalOpen}
        gwsAccounts={gwsAccounts}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={handleCreated}
      />

      <EmailAccountDetailModal
        account={viewAccount}
        onClose={() => setViewAccount(null)}
      />

      <EmailAccountEditModal
        key={editAccount?.id ?? "edit-empty"}
        account={editAccount}
        onClose={() => setEditAccount(null)}
        onSaved={handleSaved}
      />

      <RecycleAccountModal
        key={recycleAccount?.id ?? "recycle-empty"}
        account={recycleAccount}
        onClose={() => setRecycleAccount(null)}
        onRecycled={handleSaved}
      />

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Remove Email Account"
        message={
          pendingDelete
            ? `Remove ${pendingDelete.stlafEmail} — ${pendingDelete.fullName}? This cannot be undone.`
            : ""
        }
        confirmLabel="Remove"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
    </div>
  );
}
