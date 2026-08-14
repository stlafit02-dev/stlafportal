import { useEffect, useState } from "react";
import {
  fetchCategories,
  fetchEmployees,
  deleteEmployee,
  type EmployeeCategory,
  type Employee,
} from "./employeeApi";
import { EmployeeFormModal } from "./EmployeeFormModal";
import { CategoryModal } from "./CategoryModal";
import { EmployeeEditModal } from "./EmployeeEditModal";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog/ConfirmDialog";
import { Toast } from "../../../common/components/Toast/Toast";
import { Spinner } from "../../../common/components/Loader/Loader";
import "../../it/gmail/GmailManagementPage.css";
import { EmployeeDetailModal } from "./EmployeeDetailModal";
import "./EmployeesPage.css";
import { EmployeeLeaveCreditsModal } from "./EmployeeLeaveCreditsModal";
import { getDepartmentLabel } from "../../../common/departmentLabels";

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [categories, setCategories] = useState<EmployeeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Employee | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [creditsEmployee, setCreditsEmployee] = useState<Employee | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  async function loadAll() {
    setIsLoading(true);
    const [cats, emps] = await Promise.all([
      fetchCategories(),
      fetchEmployees(),
    ]);
    setCategories(cats);
    setEmployees(emps);
    setIsLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function handleCreated(employee: Employee) {
    setEmployees((prev) => [employee, ...prev]);
  }

  function handleUpdated(employee: Employee) {
    setEmployees((prev) =>
      prev.map((e) => (e.id === employee.id ? employee : e)),
    );
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const employee = pendingDelete;
    setPendingDelete(null);

    await deleteEmployee(employee.id);
    setEmployees((prev) => prev.filter((e) => e.id !== employee.id));
    setToastMessage(`${employee.companyId} removed.`);
    setIsToastVisible(true);
  }

  const departments = Array.from(new Set(employees.map((e) => e.department)));

  const filtered = employees.filter((e) => {
    const matchesStatus = statusFilter === "All" || e.status === statusFilter;
    const matchesDept =
      departmentFilter === "All" || e.department === departmentFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(query) ||
      e.companyId.toLowerCase().includes(query) ||
      (e.companyEmail ?? "").toLowerCase().includes(query);
    return matchesStatus && matchesDept && matchesSearch;
  });
  const sorted = [...filtered].sort((a, b) => {
    const cmp = a.companyId.localeCompare(b.companyId, undefined, {
      numeric: true,
    });
    return sortOrder === "asc" ? cmp : -cmp;
  });

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
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{employees.length} records</p>
        </div>
        <div className="gmail-header-actions">
          <button
            className="gmail-secondary-btn"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            + Category
          </button>
          <button
            className="gmail-primary-btn"
            onClick={() => setIsAddModalOpen(true)}
          >
            + Add Employee
          </button>
        </div>
      </div>

      <div className="app-pw-filters">
        <div className="gws-search-box email-search-box">
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
            placeholder="Search by name, company ID, or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="gws-search-input"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="email-gws-filter"
        >
          <option value="All">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {getDepartmentLabel(d)}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="email-gws-filter"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="gmail-empty">
          {employees.length === 0
            ? "No employees yet."
            : "No employees match your search or filters."}
        </div>
      ) : (
        <div className="gmail-table-wrap email-table-wrap">
          <table className="gmail-table">
            <thead>
              <tr>
                <th>
                  <button
                    onClick={() =>
                      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      color: "inherit",
                      font: "inherit",
                    }}
                  >
                    Company ID
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      {sortOrder === "asc" ? (
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      ) : (
                        <path d="M12 5v14M5 12l7 7 7-7" />
                      )}
                    </svg>
                  </button>
                </th>
                <th>Full Name</th>
                <th>Department</th>
                <th>Position</th>
                <th>Company Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((e) => (
                <tr
                  key={e.id}
                  className="asset-row"
                  onClick={() => setViewEmployee(e)}
                >
                  <td className="mono-cell">{e.companyId}</td>
                  <td>
                    {e.firstName} {e.middleName ? e.middleName[0] + ". " : ""}
                    {e.lastName}
                  </td>
                  <td>{getDepartmentLabel(e.department)}</td>
                  <td>{e.officePosition}</td>
                  <td className="mono-cell">
                    {e.companyEmail || (
                      <span className="unassigned-text">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${e.status === "Active" ? "badge-active" : "badge-inactive"}`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td onClick={(evt) => evt.stopPropagation()}>
                    <div className="action-icons">
                      <button
                        className="icon-btn"
                        onClick={() => setEditEmployee(e)}
                        aria-label="Edit employee"
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
                        aria-label="Delete employee"
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
                      <button
                        className="icon-btn"
                        onClick={() => setCreditsEmployee(e)}
                        aria-label="Leave credits"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
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

      <EmployeeFormModal
        isOpen={isAddModalOpen}
        categories={categories}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={handleCreated}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCreated={(c) => setCategories((prev) => [...prev, c])}
      />

      <EmployeeEditModal
        key={editEmployee?.id ?? "edit-empty"}
        employee={editEmployee}
        onClose={() => setEditEmployee(null)}
        onSaved={handleUpdated}
      />

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Remove Employee"
        message={
          pendingDelete
            ? `Remove ${pendingDelete.companyId} — ${pendingDelete.firstName} ${pendingDelete.lastName}? This also deletes their portal account. This cannot be undone.`
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

      <EmployeeDetailModal
        employee={viewEmployee}
        onClose={() => setViewEmployee(null)}
      />
      <EmployeeLeaveCreditsModal
        employee={creditsEmployee}
        onClose={() => setCreditsEmployee(null)}
      />
    </div>
  );
}
