import { useEffect, useState } from "react";
import { fetchAmIApprover, fetchPendingApprovals, fetchPendingRetractions, type LeaveRequest } from "./leaveApi";
import { fetchAmIDeptApprover, fetchPendingDeptOvertime, type OvertimeRequest } from "./overtimeApi";
import { DecideRequestModal } from "./DecideRequestModal";
import { DecideRetractionModal } from "./DecideRetractionModal";
import { DecideOvertimeModal } from "./DecideOvertimeModal";
import { Spinner } from "../components/Loader/Loader";
import { Toast } from "../components/Toast/Toast";
import "../../departments/it/gmail/GmailManagementPage.css";
import "./LeavePage.css";

type CombinedPendingItem =
  | { kind: "retraction"; data: LeaveRequest }
  | { kind: "overtime"; data: OvertimeRequest };

export function ApprovalsPage() {
  const [isApprover, setIsApprover] = useState(false);
  const [isDeptOvertimeApprover, setIsDeptOvertimeApprover] = useState(false);
  const [pending, setPending] = useState<LeaveRequest[]>([]);
  const [pendingRetractions, setPendingRetractions] = useState<LeaveRequest[]>([]);
  const [pendingDeptOvertime, setPendingDeptOvertime] = useState<OvertimeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [decideTarget, setDecideTarget] = useState<{ request: LeaveRequest; approved: boolean } | null>(null);
  const [decideRetractTarget, setDecideRetractTarget] = useState<{ request: LeaveRequest; approved: boolean } | null>(null);
  const [decideOvertimeTarget, setDecideOvertimeTarget] = useState<{ request: OvertimeRequest; approved: boolean } | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  async function loadAll() {
    setIsLoading(true);
    const [approverFlag, deptOtFlag] = await Promise.all([fetchAmIApprover(), fetchAmIDeptApprover()]);
    setIsApprover(approverFlag);
    setIsDeptOvertimeApprover(deptOtFlag);

    if (approverFlag) {
      setPending(await fetchPendingApprovals());
      setPendingRetractions(await fetchPendingRetractions());
    }
    if (deptOtFlag) {
      setPendingDeptOvertime(await fetchPendingDeptOvertime());
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function handleDecided(request: LeaveRequest) {
    setPending((prev) => prev.filter((r) => r.id !== request.id));
    setToastMessage(`${request.employeeName}'s request ${request.status.toLowerCase()}.`);
    setIsToastVisible(true);
  }

  function handleRetractionDecided(request: LeaveRequest) {
    setPendingRetractions((prev) => prev.filter((r) => r.id !== request.id));
    setToastMessage(
      request.status === "Retracted"
        ? `${request.employeeName}'s leave retracted — credit returned.`
        : `${request.employeeName}'s retraction declined.`,
    );
    setIsToastVisible(true);
  }

  function handleDeptOvertimeDecided(request: OvertimeRequest) {
    setPendingDeptOvertime((prev) => prev.filter((r) => r.id !== request.id));
    setToastMessage(
      request.status === "PendingPartnerApproval"
        ? `${request.employeeName}'s overtime sent to Partner for final approval.`
        : `${request.employeeName}'s overtime rejected.`,
    );
    setIsToastVisible(true);
  }

  if (isLoading) {
    return (
      <div className="gmail-page-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isApprover && !isDeptOvertimeApprover) {
    return (
      <div className="gmail-page">
        <div className="gmail-page-header">
          <div>
            <h1 className="page-title">Approvals</h1>
            <p className="page-subtitle">You are not assigned as an approver for any department.</p>
          </div>
        </div>
      </div>
    );
  }

  const combined: CombinedPendingItem[] = [
    ...pendingRetractions.map((r): CombinedPendingItem => ({ kind: "retraction", data: r })),
    ...pendingDeptOvertime.map((r): CombinedPendingItem => ({ kind: "overtime", data: r })),
  ];

  return (
    <div className="gmail-page">
      <div className="gmail-page-header">
        <div>
          <h1 className="page-title">Approvals</h1>
          <p className="page-subtitle">Leave requests, retractions, and overtime awaiting your review.</p>
        </div>
      </div>

      <section className="gmail-section">
        <h2 className="gmail-section-title">Pending Leave Requests</h2>
        {pending.length === 0 ? (
          <div className="gmail-empty">No pending requests.</div>
        ) : (
          <div className="gmail-table-wrap email-table-wrap">
            <table className="gmail-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((r) => (
                  <tr key={r.id}>
                    <td>{r.employeeName}</td>
                    <td>{r.leaveTypeName}</td>
                    <td>{new Date(r.startDate).toLocaleDateString()} – {new Date(r.endDate).toLocaleDateString()}</td>
                    <td>{r.days}</td>
                    <td>{r.reason}</td>
                    <td>
                      <div className="action-icons">
                        <button className="leave-approve-btn" onClick={() => setDecideTarget({ request: r, approved: true })}>Approve</button>
                        <button className="leave-reject-btn" onClick={() => setDecideTarget({ request: r, approved: false })}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="gmail-section">
        <h2 className="gmail-section-title">Pending Retractions &amp; Overtime</h2>
        {combined.length === 0 ? (
          <div className="gmail-empty">Nothing pending here.</div>
        ) : (
          <div className="gmail-table-wrap email-table-wrap">
            <table className="gmail-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Employee</th>
                  <th>Details</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {combined.map((item) =>
                  item.kind === "retraction" ? (
                    <tr key={`ret-${item.data.id}`}>
                      <td><span className="category-badge">Retraction</span></td>
                      <td>{item.data.employeeName}</td>
                      <td>{item.data.leaveTypeName}: {new Date(item.data.startDate).toLocaleDateString()} – {new Date(item.data.endDate).toLocaleDateString()}</td>
                      <td>{item.data.retractionReason}</td>
                      <td>
                        <div className="action-icons">
                          <button className="leave-approve-btn" onClick={() => setDecideRetractTarget({ request: item.data, approved: true })}>Approve</button>
                          <button className="leave-reject-btn" onClick={() => setDecideRetractTarget({ request: item.data, approved: false })}>Decline</button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={`ot-${item.data.id}`}>
                      <td><span className="category-badge">Overtime</span></td>
                      <td>{item.data.employeeName}</td>
                      <td>{new Date(item.data.date).toLocaleDateString()}, {item.data.startTime}–{item.data.endTime} ({item.data.hours}h)</td>
                      <td>{item.data.reason}</td>
                      <td>
                        <div className="action-icons">
                          <button className="leave-approve-btn" onClick={() => setDecideOvertimeTarget({ request: item.data, approved: true })}>Approve</button>
                          <button className="leave-reject-btn" onClick={() => setDecideOvertimeTarget({ request: item.data, approved: false })}>Reject</button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <DecideRequestModal
        key={decideTarget?.request.id ?? "decide-empty"}
        request={decideTarget?.request ?? null}
        approved={decideTarget?.approved ?? false}
        onClose={() => setDecideTarget(null)}
        onDecided={handleDecided}
      />

      <DecideRetractionModal
        key={decideRetractTarget?.request.id ?? "decide-retract-empty"}
        request={decideRetractTarget?.request ?? null}
        approved={decideRetractTarget?.approved ?? false}
        onClose={() => setDecideRetractTarget(null)}
        onDecided={handleRetractionDecided}
      />

      <DecideOvertimeModal
        key={decideOvertimeTarget?.request.id ?? "decide-ot-empty"}
        request={decideOvertimeTarget?.request ?? null}
        approved={decideOvertimeTarget?.approved ?? false}
        stage="dept"
        onClose={() => setDecideOvertimeTarget(null)}
        onDecided={handleDeptOvertimeDecided}
      />

      <Toast message={toastMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
    </div>
  );
}