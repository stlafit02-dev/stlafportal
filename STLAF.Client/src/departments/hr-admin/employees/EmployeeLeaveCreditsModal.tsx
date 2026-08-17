import { useEffect, useState } from "react";
import { Modal } from "../../../common/components/Modal/Modal";
import { Spinner } from "../../../common/components/Loader/Loader";
import {
  fetchEmployeeLeaveCredits,
  setEmployeeLeaveCredit,
  type EmployeeLeaveCredit,
} from "../../../common/leave/leaveApi";
import type { Employee } from "./employeeApi";
import "../../it/gmail/GmailForms.css";

interface EmployeeLeaveCreditsModalProps {
  employee: Employee | null;
  onClose: () => void;
}

export function EmployeeLeaveCreditsModal({
  employee,
  onClose,
}: EmployeeLeaveCreditsModalProps) {
  const [credits, setCredits] = useState<EmployeeLeaveCredit[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!employee) return;
    setIsLoading(true);
    fetchEmployeeLeaveCredits(employee.id).then((data) => {
      setCredits(data);
      setDrafts(
        Object.fromEntries(
          data.map((c) => [c.leaveTypeId, String(c.effectiveCredits)]),
        ),
      );
      setIsLoading(false);
    });
  }, [employee?.id]);

  if (!employee) return null;

  async function handleSave(leaveTypeId: string) {
    const value = drafts[leaveTypeId];
    const parsed = value === "" ? null : parseFloat(value);
    setSavingId(leaveTypeId);
    try {
      const updated = await setEmployeeLeaveCredit(
        employee!.id,
        leaveTypeId,
        parsed,
      );
      setCredits(updated);
      setDrafts(
        Object.fromEntries(
          updated.map((c) => [c.leaveTypeId, String(c.effectiveCredits)]),
        ),
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleReset(leaveTypeId: string) {
    setSavingId(leaveTypeId);
    try {
      const updated = await setEmployeeLeaveCredit(
        employee!.id,
        leaveTypeId,
        null,
      );
      setCredits(updated);
      setDrafts(
        Object.fromEntries(
          updated.map((c) => [c.leaveTypeId, String(c.effectiveCredits)]),
        ),
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <Modal isOpen={!!employee} onClose={onClose}>
      <div className="gmail-modal">
        <h2 className="gmail-modal-title">Leave Credits</h2>
        <div className="editing-badge">
          <span className="editing-badge-label">Employee</span>
          <span className="editing-badge-value">
            {employee.firstName} {employee.lastName} ({employee.companyId})
          </span>
        </div>

        {isLoading ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 24 }}
          >
            <Spinner size="md" />
          </div>
        ) : (
          <div className="gmail-form">
            {credits.map((c) => {
              const draftValue = drafts[c.leaveTypeId] ?? "";
              const isDirty = draftValue !== String(c.effectiveCredits);
              const hasOverride =
                c.overrideCredits !== null && c.overrideCredits !== undefined;

              return (
                <div key={c.leaveTypeId} className="gmail-field">
                  <label className="gmail-label">
                    {c.leaveTypeName}
                    {hasOverride && (
                      <span
                        style={{
                          color: "var(--accent-gold)",
                          marginLeft: 6,
                          fontWeight: 700,
                        }}
                      >
                        · Custom
                      </span>
                    )}
                    {!hasOverride && (
                      <span
                        style={{ color: "var(--text-muted)", marginLeft: 6 }}
                      >
                        · Default {c.defaultCredits}
                      </span>
                    )}
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={draftValue}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [c.leaveTypeId]: e.target.value,
                        }))
                      }
                      className="gmail-input"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="gmail-submit-btn"
                      onClick={() => handleSave(c.leaveTypeId)}
                      disabled={!isDirty || savingId === c.leaveTypeId}
                      style={{ minWidth: 76 }}
                    >
                      {savingId === c.leaveTypeId ? (
                        <Spinner size="sm" />
                      ) : (
                        "Save"
                      )}
                    </button>
                    {hasOverride && (
                      <button
                        type="button"
                        className="gmail-cancel-btn"
                        onClick={() => handleReset(c.leaveTypeId)}
                        disabled={savingId === c.leaveTypeId}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="gmail-actions">
          <button type="button" className="gmail-cancel-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
