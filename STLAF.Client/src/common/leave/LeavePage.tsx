import { useEffect, useState } from "react";
import {
  fetchMyProfile, fetchLeaveTypes, fetchMyBalances, fetchMyRequests,
  fetchAmIApprover, fetchPendingApprovals,
  type EmployeeProfile, type LeaveType, type LeaveBalance, type LeaveRequest,
} from "./leaveApi";
import { RequestLeaveModal } from "./RequestLeaveModal";
import { DecideRequestModal } from "./DecideRequestModal";
import { Spinner } from "../components/Loader/Loader";
import { Toast } from "../components/Toast/Toast";
import "../../departments/it/gmail/GmailManagementPage.css";
import "./LeavePage.css";

const STATUS_META: Record<string, string> = {
  Pending: "badge-pending",
  Approved: "badge-active",
  Rejected: "badge-rejected",
};

export function LeavePage() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [isApprover, setIsApprover] = useState(false);
  const [pending, setPending] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [decideTarget, setDecideTarget] = useState<{ request: LeaveRequest; approved: boolean } | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  async function loadAll() {
    setIsLoading(true);
    const [prof, types, bals, reqs, approverFlag] = await Promise.all([
      fetchMyProfile(), fetchLeaveTypes(), fetchMyBalances(), fetchMyRequests(), fetchAmIApprover(),
    ]);
    setProfile(prof);
    setLeaveTypes(types);
    setBalances(bals);
    setMyRequests(reqs);
    setIsApprover(approverFlag);

    if (approverFlag) {
      setPending(await fetchPendingApprovals());
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

  function handleDecided(request: LeaveRequest) {
    setPending((prev) => prev.filter((r) => r.id !== request.id));
    setToastMessage(`${request.employeeName}'s request ${request.status.toLowerCase()}.`);
    setIsToastVisible(true);
  }

  if (isLoading || !profile) {
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
          <h1 className="page-title">Leave</h1>
          <p className="page-subtitle">{profile.fullName} · {profile.department} · {profile.companyId}</p>
        </div>
        <button className="gmail-primary-btn" onClick={() => setIsRequestModalOpen(true)}>
          + Request Leave
        </button>
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
          <h2 className="gmail-section-title">Pending Approvals</h2>
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

      <section className="gmail-section">
        <h2 className="gmail-section-title">My Requests</h2>
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
                </tr>
              </thead>
              <tbody>
                {myRequests.map((r) => (
                  <tr key={r.id}>
                    <td>{r.leaveTypeName}</td>
                    <td>{new Date(r.startDate).toLocaleDateString()} – {new Date(r.endDate).toLocaleDateString()}</td>
                    <td>{r.days}</td>
                    <td>
                      <span className={`status-badge ${STATUS_META[r.status] ?? ""}`}>{r.status}</span>
                    </td>
                    <td>{r.decidedByName || <span className="unassigned-text">—</span>}</td>
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

      <DecideRequestModal
        key={decideTarget?.request.id ?? "decide-empty"}
        request={decideTarget?.request ?? null}
        approved={decideTarget?.approved ?? false}
        onClose={() => setDecideTarget(null)}
        onDecided={handleDecided}
      />

      <Toast message={toastMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
    </div>
  );
}