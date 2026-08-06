import { useEffect, useState } from "react";
import {
  fetchLeaveTypes,
  createLeaveType,
  updateLeaveType,
  fetchApprovers,
  setApprover,
  fetchSmtpSenders,
  createSmtpSender,
  testSmtpSender,
  deleteSmtpSender,
  fetchNotificationSetting,
  setNotificationSetting,
  type LeaveType,
  type LeaveApprover,
  type SmtpSender,
  type NotificationSetting,
} from "../../../common/leave/leaveApi";
import { fetchEmployees, type Employee } from "../employees/employeeApi";
import { Spinner } from "../../../common/components/Loader/Loader";
import { Toast } from "../../../common/components/Toast/Toast";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog/ConfirmDialog";
import "./LeaveSettingsPage.css";
import {
  fetchOvertimePartners,
  setOvertimePartner,
  type OvertimePartner,
} from "../../../common/leave/overtimeApi";
import { testFileStorageConnection } from "../../../common/leave/medicalApi";

const DEPARTMENTS = [
  "IT",
  "HRAdmin",
  "Litigation",
  "Accounting",
  "Corporate",
  "Marketing",
];

export function LeaveSettingsPage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [approvers, setApprovers] = useState<LeaveApprover[]>([]);
  const [smtpSenders, setSmtpSenders] = useState<SmtpSender[]>([]);
  const [notificationSetting, setNotificationSettingState] =
    useState<NotificationSetting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [creditDrafts, setCreditDrafts] = useState<Record<string, string>>({});
  const [medicalDrafts, setMedicalDrafts] = useState<Record<string, string>>(
    {},
  );
  const [isAddTypeOpen, setIsAddTypeOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeCredits, setNewTypeCredits] = useState("");
  const [isAddingType, setIsAddingType] = useState(false);
  const [isAddSenderOpen, setIsAddSenderOpen] = useState(false);
  const [newSenderLabel, setNewSenderLabel] = useState("");
  const [newSenderEmail, setNewSenderEmail] = useState("");
  const [newSenderPassword, setNewSenderPassword] = useState("");
  const [isAddingSender, setIsAddingSender] = useState(false);
  const [testingSenderId, setTestingSenderId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<
    Record<string, "success" | "fail">
  >({});
  const [pendingDeleteSender, setPendingDeleteSender] =
    useState<SmtpSender | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [overtimePartners, setOvertimePartners] = useState<OvertimePartner[]>(
    [],
  );
  const [isTestingDrive, setIsTestingDrive] = useState(false);

  async function loadAll() {
    setIsLoading(true);
    const [types, emps, apprs, senders, notif, partners] = await Promise.all([
      fetchLeaveTypes(),
      fetchEmployees(),
      fetchApprovers(),
      fetchSmtpSenders(),
      fetchNotificationSetting().catch(() => null),
      fetchOvertimePartners(),
    ]);
    setLeaveTypes(types);
    setEmployees(emps);
    setApprovers(apprs);
    setSmtpSenders(senders);
    setNotificationSettingState(notif);
    setOvertimePartners(partners);
    setCreditDrafts(
      Object.fromEntries(types.map((t) => [t.id, String(t.defaultCredits)])),
    );
    setMedicalDrafts(
      Object.fromEntries(
        types.map((t) => [
          t.id,
          t.requiresMedicalAfterDays != null
            ? String(t.requiresMedicalAfterDays)
            : "",
        ]),
      ),
    );
    setIsLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function showToast(message: string) {
    setToastMessage(message);
    setIsToastVisible(true);
  }

  async function handlePartnerChange(department: string, employeeId: string) {
    if (!employeeId) return;
    const updated = await setOvertimePartner(department, employeeId);
    setOvertimePartners((prev) => {
      const exists = prev.some((p) => p.department === department);
      return exists
        ? prev.map((p) => (p.department === department ? updated : p))
        : [...prev, updated];
    });
    showToast(`${department} overtime partner set to ${updated.partnerName}.`);
  }

  async function handleSaveCredits(type: LeaveType) {
    const value = parseInt(creditDrafts[type.id] || "0", 10);
    const medicalRaw = medicalDrafts[type.id];
    const medicalValue =
      medicalRaw === "" || medicalRaw === undefined
        ? null
        : parseInt(medicalRaw, 10);
    const updated = await updateLeaveType(type.id, {
      name: type.name,
      defaultCredits: value,
      requiresMedicalAfterDays: medicalValue,
    });
    setLeaveTypes((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t)),
    );
    showToast(`${updated.name} updated.`);
  }

  async function handleAddType(e: React.FormEvent) {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    setIsAddingType(true);
    try {
      const created = await createLeaveType({
        name: newTypeName,
        defaultCredits: parseInt(newTypeCredits || "0", 10),
      });
      setLeaveTypes((prev) => [...prev, created]);
      setCreditDrafts((prev) => ({
        ...prev,
        [created.id]: String(created.defaultCredits),
      }));
      setMedicalDrafts((prev) => ({
        ...prev,
        [created.id]:
          created.requiresMedicalAfterDays != null
            ? String(created.requiresMedicalAfterDays)
            : "",
      }));
      setNewTypeName("");
      setNewTypeCredits("");
      setIsAddTypeOpen(false);
      showToast(`${created.name} added.`);
    } finally {
      setIsAddingType(false);
    }
  }

  async function handleApproverChange(department: string, employeeId: string) {
    if (!employeeId) return;
    const updated = await setApprover(department, employeeId);
    setApprovers((prev) => {
      const exists = prev.some((a) => a.department === department);
      return exists
        ? prev.map((a) => (a.department === department ? updated : a))
        : [...prev, updated];
    });
    showToast(`${department} approver set to ${updated.approverName}.`);
  }

  async function handleAddSender(e: React.FormEvent) {
    e.preventDefault();
    if (
      !newSenderLabel.trim() ||
      !newSenderEmail.trim() ||
      !newSenderPassword.trim()
    )
      return;
    setIsAddingSender(true);
    try {
      const created = await createSmtpSender({
        label: newSenderLabel,
        email: newSenderEmail,
        appPassword: newSenderPassword,
      });
      setSmtpSenders((prev) => [...prev, created]);
      setNewSenderLabel("");
      setNewSenderEmail("");
      setNewSenderPassword("");
      setIsAddSenderOpen(false);
      showToast(`${created.label} added.`);
    } finally {
      setIsAddingSender(false);
    }
  }

  async function handleTestSender(sender: SmtpSender) {
    setTestingSenderId(sender.id);
    try {
      const result = await testSmtpSender(sender.id);
      setTestResults((prev) => ({
        ...prev,
        [sender.id]: result.success ? "success" : "fail",
      }));
      showToast(
        result.success
          ? `${sender.label} works — test email sent.`
          : `Test failed: ${result.error}`,
      );
    } finally {
      setTestingSenderId(null);
    }
  }

  async function handleNotificationChange(smtpSenderId: string) {
    if (!smtpSenderId) return;
    const updated = await setNotificationSetting(smtpSenderId);
    setNotificationSettingState(updated);
    showToast(`Notifications will now send from ${updated.senderEmail}.`);
  }

  async function confirmDeleteSender() {
    if (!pendingDeleteSender) return;
    const sender = pendingDeleteSender;
    setPendingDeleteSender(null);
    await deleteSmtpSender(sender.id);
    setSmtpSenders((prev) => prev.filter((s) => s.id !== sender.id));
    if (notificationSetting?.smtpSenderId === sender.id) {
      setNotificationSettingState(null);
    }
    showToast(`${sender.label} removed.`);
  }

  async function handleTestDrive() {
    setIsTestingDrive(true);
    try {
      const result = await testFileStorageConnection();
      showToast(
        result.success
          ? "Google Drive connected — test file uploaded successfully."
          : `Drive test failed: ${result.error}`,
      );
    } finally {
      setIsTestingDrive(false);
    }
  }

  if (isLoading) {
    return (
      <div className="ls-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="ls-page">
      <div className="ls-header">
        <h1 className="page-title">Leave Settings</h1>
        <p className="page-subtitle">
          Configure leave types, department approvers, and the notification
          sender.
        </p>
      </div>

      {/* ---------- Leave Types ---------- */}
      <section className="ls-section">
        <div className="ls-section-header">
          <div>
            <h2 className="ls-section-title">Leave Types</h2>
            <p className="ls-section-caption">
              Default credit allowance per year.
            </p>
          </div>
          <button
            className="ls-add-btn"
            onClick={() => setIsAddTypeOpen((v) => !v)}
          >
            {isAddTypeOpen ? "Cancel" : "+ Add Type"}
          </button>
        </div>

        {isAddTypeOpen && (
          <form onSubmit={handleAddType} className="ls-inline-form">
            <input
              type="text"
              placeholder="Leave type name"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              className="ls-input"
              autoFocus
            />
            <input
              type="number"
              min={0}
              placeholder="Credits"
              value={newTypeCredits}
              onChange={(e) => setNewTypeCredits(e.target.value)}
              className="ls-input ls-input-narrow"
            />
            <button
              type="submit"
              className="ls-primary-btn"
              disabled={isAddingType}
            >
              {isAddingType ? <Spinner size="sm" /> : "Save"}
            </button>
          </form>
        )}

        <div className="ls-card-grid">
          {leaveTypes.map((t) => {
            return (
              <div key={t.id} className="ls-type-card">
                <span className="ls-type-name">{t.name}</span>
                <div className="ls-type-credit-row">
                  <input
                    type="number"
                    min={0}
                    className="ls-credit-input"
                    value={creditDrafts[t.id] ?? ""}
                    onChange={(e) =>
                      setCreditDrafts((prev) => ({
                        ...prev,
                        [t.id]: e.target.value,
                      }))
                    }
                  />
                  <span className="ls-credit-label">credits / yr</span>
                </div>
                <div className="ls-type-credit-row">
                  <input
                    type="number"
                    min={0}
                    placeholder="Off"
                    className="ls-credit-input"
                    value={medicalDrafts[t.id] ?? ""}
                    onChange={(e) =>
                      setMedicalDrafts((prev) => ({
                        ...prev,
                        [t.id]: e.target.value,
                      }))
                    }
                  />
                  <span className="ls-credit-label">
                    days → requires medical
                  </span>
                </div>
                <button
                  className={`ls-save-btn ${creditDrafts[t.id] !== String(t.defaultCredits) || medicalDrafts[t.id] !== (t.requiresMedicalAfterDays != null ? String(t.requiresMedicalAfterDays) : "") ? "ls-save-btn-active" : ""}`}
                  onClick={() => handleSaveCredits(t)}
                >
                  Save
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- Department Approvers ---------- */}
      <section className="ls-section">
        <div className="ls-section-header">
          <div>
            <h2 className="ls-section-title">Department Approvers</h2>
            <p className="ls-section-caption">
              One approver per department reviews their leave requests.
            </p>
          </div>
        </div>

        <div className="ls-approver-grid">
          {DEPARTMENTS.map((dept) => {
            const current = approvers.find((a) => a.department === dept);
            const deptEmployees = employees.filter(
              (e) => e.department === dept,
            );
            const initials = current
              ? current.approverName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "?";
            return (
              <div key={dept} className="ls-approver-card">
                <div className="ls-approver-top">
                  <span
                    className={`ls-avatar ${current ? "ls-avatar-set" : "ls-avatar-empty"}`}
                  >
                    {initials}
                  </span>
                  <div className="ls-approver-info">
                    <span className="ls-approver-dept">{dept}</span>
                    <span className="ls-approver-name">
                      {current ? current.approverName : "No approver set"}
                    </span>
                  </div>
                </div>
                <select
                  className="ls-select"
                  value={current?.approverEmployeeId ?? ""}
                  onChange={(e) => handleApproverChange(dept, e.target.value)}
                >
                  <option value="" disabled>
                    {deptEmployees.length === 0
                      ? "No employees in this department"
                      : "Change approver…"}
                  </option>
                  {deptEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.companyId})
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- Overtime Partners ---------- */}
      <section className="gmail-section">
        <div className="ls-section-header">
          <div>
            <h2 className="ls-section-title">Overtime Partners</h2>
            <p className="ls-section-caption">
              Gives the final approval on overtime, after the department head
              signs off.
            </p>
          </div>
        </div>

        <div className="ls-approver-grid">
          {DEPARTMENTS.map((dept) => {
            const current = overtimePartners.find((p) => p.department === dept);
            const deptEmployees = employees.filter(
              (e) => e.department === dept,
            );
            const initials = current
              ? current.partnerName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "?";
            return (
              <div key={dept} className="ls-approver-card">
                <div className="ls-approver-top">
                  <span
                    className={`ls-avatar ${current ? "ls-avatar-set" : "ls-avatar-empty"}`}
                  >
                    {initials}
                  </span>
                  <div className="ls-approver-info">
                    <span className="ls-approver-dept">{dept}</span>
                    <span className="ls-approver-name">
                      {current ? current.partnerName : "No partner set"}
                    </span>
                  </div>
                </div>
                <select
                  className="ls-select"
                  value={current?.partnerEmployeeId ?? ""}
                  onChange={(e) => handlePartnerChange(dept, e.target.value)}
                >
                  <option value="" disabled>
                    {deptEmployees.length === 0
                      ? "No employees in this department"
                      : "Change partner…"}
                  </option>
                  {deptEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.companyId})
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- SMTP Senders ---------- */}
      <section className="ls-section">
        <div className="ls-section-header">
          <div>
            <h2 className="ls-section-title">SMTP Senders</h2>
            <p className="ls-section-caption">
              Gmail accounts used to send leave notification emails.
            </p>
          </div>
          <button
            className="ls-add-btn"
            onClick={() => setIsAddSenderOpen((v) => !v)}
          >
            {isAddSenderOpen ? "Cancel" : "+ Add Sender"}
          </button>
        </div>

        {isAddSenderOpen && (
          <form
            onSubmit={handleAddSender}
            className="ls-inline-form ls-inline-form-wrap"
          >
            <input
              type="text"
              placeholder="Label (e.g. IT Notifications)"
              value={newSenderLabel}
              onChange={(e) => setNewSenderLabel(e.target.value)}
              className="ls-input"
              autoFocus
            />
            <input
              type="email"
              placeholder="Gmail address"
              value={newSenderEmail}
              onChange={(e) => setNewSenderEmail(e.target.value)}
              className="ls-input"
            />
            <input
              type="text"
              placeholder="App password"
              value={newSenderPassword}
              onChange={(e) => setNewSenderPassword(e.target.value)}
              className="ls-input"
            />
            <button
              type="submit"
              className="ls-primary-btn"
              disabled={isAddingSender}
            >
              {isAddingSender ? <Spinner size="sm" /> : "Save"}
            </button>
          </form>
        )}

        {smtpSenders.length === 0 ? (
          <div className="ls-empty">No SMTP senders added yet.</div>
        ) : (
          <div className="ls-sender-list">
            {smtpSenders.map((s) => {
              const isActive = notificationSetting?.smtpSenderId === s.id;
              const testState = testResults[s.id];
              return (
                <div
                  key={s.id}
                  className={`ls-sender-row ${isActive ? "ls-sender-row-active" : ""}`}
                >
                  <div className="ls-sender-main">
                    <span className="ls-sender-label">{s.label}</span>
                    <span className="ls-sender-email">{s.email}</span>
                  </div>
                  <div className="ls-sender-actions">
                    {testState && (
                      <span
                        className={`ls-test-pill ${testState === "success" ? "ls-test-pill-ok" : "ls-test-pill-fail"}`}
                      >
                        {testState === "success" ? "Verified" : "Failed"}
                      </span>
                    )}
                    {isActive && <span className="ls-active-pill">Active</span>}
                    <button
                      className="ls-test-btn"
                      onClick={() => handleTestSender(s)}
                      disabled={testingSenderId === s.id}
                    >
                      {testingSenderId === s.id ? (
                        <Spinner size="sm" />
                      ) : (
                        "Test"
                      )}
                    </button>
                    {!isActive && (
                      <button
                        className="ls-use-btn"
                        onClick={() => handleNotificationChange(s.id)}
                      >
                        Use as sender
                      </button>
                    )}
                    <button
                      className="ls-delete-btn"
                      onClick={() => setPendingDeleteSender(s)}
                      aria-label={`Delete ${s.label}`}
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
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------- Google Drive ---------- */}
      <section className="ls-section">
        <div className="ls-section-header">
          <div>
            <h2 className="ls-section-title">Google Drive</h2>
            <p className="ls-section-caption">
              Used to store uploaded medical certificates.
            </p>
          </div>
          <button
            className="ls-add-btn"
            onClick={handleTestDrive}
            disabled={isTestingDrive}
          >
            {isTestingDrive ? <Spinner size="sm" /> : "Test Connection"}
          </button>
        </div>
      </section>

      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />

      <ConfirmDialog
        isOpen={!!pendingDeleteSender}
        title="Remove SMTP Sender"
        message={
          pendingDeleteSender
            ? `Remove ${pendingDeleteSender.label} (${pendingDeleteSender.email})? If it's the active sender, leave notifications will stop sending until you pick another. This cannot be undone.`
            : ""
        }
        confirmLabel="Remove"
        danger
        onConfirm={confirmDeleteSender}
        onCancel={() => setPendingDeleteSender(null)}
      />
    </div>
  );
}
