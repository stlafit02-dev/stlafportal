import { useEffect, useState } from "react";
import {
  fetchMyProfile,
  fetchLeaveTypes,
  fetchMyBalances,
  fetchMyRequests,
  fetchAmIApprover,
  fetchPendingApprovals,
  fetchPendingRetractions,
  type EmployeeProfile,
  type LeaveType,
  type LeaveBalance,
  type LeaveRequest,
} from "./leaveApi";
import {
  fetchMyOvertimeRequests,
  createOvertimeRequest as _unused,
  fetchAmIDeptApprover,
  fetchPendingDeptOvertime,
  fetchAmIPartner,
  fetchPendingPartnerOvertime,
  type OvertimeRequest,
} from "./overtimeApi";
import { RequestLeaveModal } from "./RequestLeaveModal";
import { DecideRequestModal } from "./DecideRequestModal";
import { RequestRetractionModal } from "./RequestRetractionModal";
import { DecideRetractionModal } from "./DecideRetractionModal";
import { RequestOvertimeModal } from "./RequestOvertimeModal";
import { DecideOvertimeModal } from "./DecideOvertimeModal";
import { Spinner } from "../components/Loader/Loader";
import { Toast } from "../components/Toast/Toast";
import "../../departments/it/gmail/GmailManagementPage.css";
import "./LeavePage.css";

const STATUS_META: Record<string, string> = {
  Pending: "badge-pending",
  Approved: "badge-active",
  Rejected: "badge-rejected",
  RetractionRequested: "badge-retraction-requested",
  Retracted: "badge-retracted",
  PendingPartnerApproval: "badge-pending",
};

type CombinedPendingItem =
  | { kind: "retraction"; data: LeaveRequest }
  | { kind: "overtime"; data: OvertimeRequest };

export function LeavePage() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [myOvertimeRequests, setMyOvertimeRequests] = useState<OvertimeRequest[]>([]);

  const [isApprover, setIsApprover] = useState(false);
  const [isDeptOvertimeApprover, setIsDeptOvertimeApprover] = useState(false);
  const [isPartner, setIsPartner] = useState(false);

  const [pending, setPending] = useState<LeaveRequest[]>([]);
  const [pendingRetractions, setPendingRetractions] = useState<LeaveRequest[]>([]);
  const [pendingDeptOvertime, setPendingDeptOvertime] = useState<OvertimeRequest[]>([]);
  const [pendingPartnerOvertime, setPendingPartnerOvertime] = useState<OvertimeRequest[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [decideTarget, setDecideTarget] = useState<{ request: LeaveRequest; approved: boolean } | null>(null);
  const [retractTarget, setRetractTarget] = useState<LeaveRequest | null>(null);
  const [decideRetractTarget, setDecideRetractTarget] = useState<{ request: LeaveRequest; approved: boolean } | null>(null);
  const [decideOvertimeTarget, setDecideOvertimeTarget] = useState<{ request: OvertimeRequest; approved: boolean; stage: "dept" | "partner" } | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  async function loadAll() {
    setIsLoading(true);
    const [prof, types, bals, reqs, otReqs, approverFlag, deptOtFlag, partnerFlag] = await Promise.all([
      fetchMyProfile(),
      fetchLeaveTypes(),
      fetchMyBalances(),
      fetchMyRequests(),
      fetchMyOvertimeRequests(),
      fetchAmIApprover(),
      fetchAmIDeptApprover(),
      fetchAmIPartner(),
    ]);
    setProfile(prof);
    setLeaveTypes(types);
    setBalances(bals);
    setMyRequests(reqs);
    setMyOvertimeRequests(otReqs);
    setIsApprover(approverFlag);
    setIsDeptOvertimeApprover(deptOtFlag);
    setIsPartner(partnerFlag);

    if (approverFlag) {
      setPending(await fetchPendingApprovals());
      setPendingRetractions(await fetchPendingRetractions());
    }
    if (deptOtFlag) {
      setPendingDeptOvertime(await fetchPendingDeptOvertime());
    }
    if (partnerFlag) {
      setPendingPartnerOvertime(await fetchPendingPartnerOvertime());
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function handleRequestCreated(request: LeaveRequest) {
    setMyRequests((prev) => [request, ...prev]);
    setToastMessage(`${request.leaveTypeName} request submitted.`);
    setIsToastVisible(true);
    fetchMyBalances().then(setBalances);
  }

  function handleOvertimeCreated(request: OvertimeRequest) {
    setMyOvertimeRequests((prev) => [request, ...prev]);
    setToastMessage("Overtime request submitted.");
    setIsToastVisible(true);
  }

  function handleDecided(request: LeaveRequest) {
    setPending((prev) => prev.filter((r) => r.id !== request.id));
    setToastMessage(`${request.employeeName}'s request ${request.status.toLowerCase()}.`);
    setIsToastVisible(true);
  }

  function handleRetractionDecided(request: LeaveRequest) {
    setPendingRetractions((prev) => prev.filter((r) => r.id !== request.id));
    setMyRequests((prev) => prev.map((r) => (r.id === request.id ? request : r)));
    setToastMessage(
      request.status === "Retracted"
        ? `${request.employeeName}'s leave retracted — credit returned.`
        : `${request.employeeName}'s retraction declined.`,
    );
    setIsToastVisible(true);
    fetchMyBalances().then(setBalances);
  }

  function handleRetractionRequested(request: LeaveRequest) {
    setMyRequests((prev) => prev.map((r) => (r.id === request.id ? request : r)));
    setToastMessage("Retraction request submitted.");
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

  function handlePartnerOvertimeDecided(request: OvertimeRequest) {
    setPendingPartnerOvertime((prev) => prev.filter((r) => r.id !== request.id));
    setToastMessage(`${request.employeeName}'s overtime ${request.status.toLowerCase()} (final).`);
    setIsToastVisible(true);
  }

  if (isLoading || !profile) {
    return (
      <div className="gmail-page-loading">
        <Spinner size="lg" />
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
          <h1 className="page-title">Leave & Overtime</h1>
          <p className="page-subtitle">
            {profile.fullName} · {profile.department} · {profile.companyId}
          </p>
        </div>
        <div className="gmail-header-actions">
          <button className="gmail-secondary-btn" onClick={() => setIsOvertimeModalOpen(true)}>
            + Request Overtime
          </button>
          <button className="gmail-primary-btn" onClick={() => setIsRequestModalOpen(true)}>
            + Request Leave
          </button>
        </div>
      </div>

      <div className="leave-balance-cards">
        {balances.map((b) => (
          <div key={b.leaveTypeId} className="leave-balance-card">
            <span className="leave-balance-name">{b.leaveTypeName}</span>
            <span className="leave-balance-remaining">{b.remainingCredits}</span>
            <span className="leave-balance-sub">of {b.defaultCredits} remaining</span>
          </div>
        ))}
      </div>

      {isApprover && (
        <section className="gmail-section">
          <h2 className="gmail-section-title">Pending Leave Approvals</h2>
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
      )}

      {(isApprover || isDeptOvertimeApprover) && (
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
                            <button className="leave-approve-btn" onClick={() => setDecideOvertimeTarget({ request: item.data, approved: true, stage: "dept" })}>Approve</button>
                            <button className="leave-reject-btn" onClick={() => setDecideOvertimeTarget({ request: item.data, approved: false, stage: "dept" })}>Reject</button>
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
      )}

      {isPartner && (
        <section className="gmail-section">
          <h2 className="gmail-section-title">Overtime — Final Approval</h2>
          {pendingPartnerOvertime.length === 0 ? (
            <div className="gmail-empty">No overtime requests awaiting final approval.</div>
          ) : (
            <div className="gmail-table-wrap email-table-wrap">
              <table className="gmail-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Details</th>
                    <th>Dept Head</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPartnerOvertime.map((r) => (
                    <tr key={r.id}>
                      <td>{r.employeeName}</td>
                      <td>{new Date(r.date).toLocaleDateString()}, {r.startTime}–{r.endTime} ({r.hours}h)</td>
                      <td>{r.deptDecidedByName}</td>
                      <td>{r.reason}</td>
                      <td>
                        <div className="action-icons">
                          <button className="leave-approve-btn" onClick={() => setDecideOvertimeTarget({ request: r, approved: true, stage: "partner" })}>Approve</button>
                          <button className="leave-reject-btn" onClick={() => setDecideOvertimeTarget({ request: r, approved: false, stage: "partner" })}>Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <section className="gmail-section">
        <h2 className="gmail-section-title">My Leave Requests</h2>
        {myRequests.length === 0 ? (
          <div className="gmail-empty">No leave requests yet.</div>
        ) : (
          <div className="gmail-table-wrap email-table-wrap">
            <table className="gmail-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Decided By</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {myRequests.map((r) => (
                  <tr key={r.id}>
                    <td>{r.leaveTypeName}</td>
                    <td>{new Date(r.startDate).toLocaleDateString()} – {new Date(r.endDate).toLocaleDateString()}</td>
                    <td>{r.days}</td>
                    <td>
                      <span className={`status-badge ${STATUS_META[r.status] ?? ""}`}>
                        {r.status === "RetractionRequested" ? "Retraction Pending" : r.status}
                      </span>
                    </td>
                    <td>{r.decidedByName || <span className="unassigned-text">—</span>}</td>
                    <td className="email-date-cell">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      {r.status === "Approved" && (
                        <button className="ls-test-btn" onClick={() => setRetractTarget(r)}>Retract</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="gmail-section">
        <h2 className="gmail-section-title">My Overtime Requests</h2>
        {myOvertimeRequests.length === 0 ? (
          <div className="gmail-empty">No overtime requests yet.</div>
        ) : (
          <div className="gmail-table-wrap email-table-wrap">
            <table className="gmail-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Dept Head</th>
                  <th>Partner</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {myOvertimeRequests.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td>{r.startTime}–{r.endTime}</td>
                    <td>{r.hours}</td>
                    <td>
                      <span className={`status-badge ${STATUS_META[r.status] ?? ""}`}>
                        {r.status === "PendingPartnerApproval" ? "Awaiting Partner" : r.status}
                      </span>
                    </td>
                    <td>{r.deptDecidedByName || <span className="unassigned-text">—</span>}</td>
                    <td>{r.partnerDecidedByName || <span className="unassigned-text">—</span>}</td>
                    <td className="email-date-cell">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <RequestLeaveModal
        isOpen={isRequestModalOpen}
        profile={profile}
        leaveTypes={leaveTypes}
        onClose={() => setIsRequestModalOpen(false)}
        onCreated={handleRequestCreated}
      />

      <RequestOvertimeModal
        isOpen={isOvertimeModalOpen}
        profile={profile}
        onClose={() => setIsOvertimeModalOpen(false)}
        onCreated={handleOvertimeCreated}
      />

      <DecideRequestModal
        key={decideTarget?.request.id ?? "decide-empty"}
        request={decideTarget?.request ?? null}
        approved={decideTarget?.approved ?? false}
        onClose={() => setDecideTarget(null)}
        onDecided={handleDecided}
      />

      <RequestRetractionModal
        key={retractTarget?.id ?? "retract-empty"}
        request={retractTarget}
        onClose={() => setRetractTarget(null)}
        onRequested={handleRetractionRequested}
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
        stage={decideOvertimeTarget?.stage ?? "dept"}
        onClose={() => setDecideOvertimeTarget(null)}
        onDecided={decideOvertimeTarget?.stage === "partner" ? handlePartnerOvertimeDecided : handleDeptOvertimeDecided}
      />

      <Toast message={toastMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
    </div>
  );
}