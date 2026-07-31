import { useEffect, useState } from "react";
import {
  fetchMyProfile,
  fetchLeaveTypes,
  fetchMyBalances,
  fetchMyRequests,
  type EmployeeProfile,
  type LeaveType,
  type LeaveBalance,
  type LeaveRequest,
} from "./leaveApi";
import { RequestLeaveModal } from "./RequestLeaveModal";
import { RequestRetractionModal } from "./RequestRetractionModal";
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
};

export function MyLeavePage() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [retractTarget, setRetractTarget] = useState<LeaveRequest | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  async function loadAll() {
    setIsLoading(true);
    const [prof, types, bals, reqs] = await Promise.all([
      fetchMyProfile(),
      fetchLeaveTypes(),
      fetchMyBalances(),
      fetchMyRequests(),
    ]);
    setProfile(prof);
    setLeaveTypes(types);
    setBalances(bals);
    setMyRequests(reqs);
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

  function handleRetractionRequested(request: LeaveRequest) {
    setMyRequests((prev) => prev.map((r) => (r.id === request.id ? request : r)));
    setToastMessage("Retraction request submitted.");
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
          <h1 className="page-title">My Leave</h1>
          <p className="page-subtitle">
            {profile.fullName} · {profile.department} · {profile.companyId}
          </p>
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

      <RequestLeaveModal
        isOpen={isRequestModalOpen}
        profile={profile}
        leaveTypes={leaveTypes}
        onClose={() => setIsRequestModalOpen(false)}
        onCreated={handleRequestCreated}
      />

      <RequestRetractionModal
        key={retractTarget?.id ?? "retract-empty"}
        request={retractTarget}
        onClose={() => setRetractTarget(null)}
        onRequested={handleRetractionRequested}
      />

      <Toast message={toastMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
    </div>
  );
}