import { useEffect, useState } from "react";
import { fetchInterns, type InternAccount } from "./internAccountApi";
import { InternFormModal } from "./InternFormModal";
import { InternEditModal } from "./InternEditModal";
import { ModuleAccessModal } from "./ModuleAccessModal";
import { Spinner } from "../../../common/components/Loader/Loader";
import { Toast } from "../../../common/components/Toast/Toast";
import "../../it/gmail/GmailManagementPage.css";
import "../../it/gmail/GwsAccountPage.css";
import "../../hr-admin/employees/EmployeesPage.css";
import "./InternAccountsPage.css";

export function InternAccountsPage() {
  const [interns, setInterns] = useState<InternAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editIntern, setEditIntern] = useState<InternAccount | null>(null);
  const [moduleIntern, setModuleIntern] = useState<InternAccount | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  async function loadAll() {
    setIsLoading(true);
    const internsData = await fetchInterns();
    setInterns(internsData);
    setIsLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function handleCreated(intern: InternAccount) {
    setInterns((prev) => [intern, ...prev]);
  }

  function handleUpdated(intern: InternAccount) {
    setInterns((prev) => prev.map((e) => (e.id === intern.id ? intern : e)));
  }

  const filteredInterns = interns.filter((e) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      e.email.toLowerCase().includes(query) ||
      e.companyId.toLowerCase().includes(query)
    );
  });

  const activeCount = interns.filter((e) => e.status === "Active").length;

  if (isLoading) {
    return (
      <div className="gmail-page-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="gmail-page">
      <div className="gmail-page-header">
        <div>
          <h1 className="page-title">Intern Accounts</h1>
          <p className="page-subtitle">
            Create intern accounts and control which modules each intern can
            access.
          </p>
        </div>
        <div className="gmail-header-actions">
          <button
            className="gmail-primary-btn"
            onClick={() => setIsAddModalOpen(true)}
          >
            + Add Intern
          </button>
        </div>
      </div>

      <div className="intern-stat-cards intern-stat-cards-2">
        <div className="intern-stat-card">
          <span className="intern-stat-value">{interns.length}</span>
          <span className="intern-stat-label">Total Interns</span>
        </div>
        <div className="intern-stat-card">
          <span className="intern-stat-value intern-stat-active">
            {activeCount}
          </span>
          <span className="intern-stat-label">Active</span>
        </div>
      </div>

      <div className="intern-toolbar">
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
            placeholder="Search by email or company ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="gws-search-input"
          />
        </div>
      </div>

      {filteredInterns.length === 0 ? (
        <div className="gmail-empty gmail-table-empty">
          {interns.length === 0
            ? "No interns yet. Click \"Add Intern\" to create the first account."
            : "No interns match your search."}
        </div>
      ) : (
        <div className="gmail-table-wrap email-table-wrap">
          <table className="gmail-table">
            <thead>
              <tr>
                <th>Company ID</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInterns.map((e) => (
                <tr key={e.id} className="asset-row">
                  <td className="mono-cell">{e.companyId}</td>
                  <td className="mono-cell">{e.email}</td>
                  <td>
                    <span
                      className={`status-badge ${e.status === "Active" ? "badge-active" : "badge-inactive"}`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-icons">
                      <button
                        className="gmail-secondary-btn intern-modules-btn"
                        onClick={() => setModuleIntern(e)}
                      >
                        Modules
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => setEditIntern(e)}
                        aria-label="Edit intern"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <InternFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={handleCreated}
      />

      <InternEditModal
        key={editIntern?.id ?? "edit-empty"}
        intern={editIntern}
        onClose={() => setEditIntern(null)}
        onSaved={handleUpdated}
      />

      <ModuleAccessModal
        intern={moduleIntern}
        onClose={() => setModuleIntern(null)}
        onSaved={(_internId, modules) => {
          setToastMessage(
            `Module access updated — ${modules.length} module${modules.length === 1 ? "" : "s"} granted.`,
          );
          setIsToastVisible(true);
        }}
      />

      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
    </div>
  );
}
