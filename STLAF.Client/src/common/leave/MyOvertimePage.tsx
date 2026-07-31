import { useEffect, useState } from "react";
import { fetchMyProfile, type EmployeeProfile } from "./leaveApi";
import { fetchMyOvertimeRequests, type OvertimeRequest } from "./overtimeApi";
import { RequestOvertimeModal } from "./RequestOvertimeModal";
import { Spinner } from "../components/Loader/Loader";
import { Toast } from "../components/Toast/Toast";
import "../../departments/it/gmail/GmailManagementPage.css";
import "./LeavePage.css";

const STATUS_META: Record<string, string> = {
  Pending: "badge-pending",
  PendingPartnerApproval: "badge-pending",
  Approved: "badge-active",
  Rejected: "badge-rejected",
};

export function MyOvertimePage() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [myOvertimeRequests, setMyOvertimeRequests] = useState<OvertimeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  async function loadAll() {
    setIsLoading(true);
    const [prof, otReqs] = await Promise.all([fetchMyProfile(), fetchMyOvertimeRequests()]);
    setProfile(prof);
    setMyOvertimeRequests(otReqs);
    setIsLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function handleOvertimeCreated(request: OvertimeRequest) {
    setMyOvertimeRequests((prev) => [request, ...prev]);
    setToastMessage("Overtime request submitted.");
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
          <h1 className="page-title">My Overtime</h1>
          <p className="page-subtitle">
            {profile.fullName} · {profile.department} · {profile.companyId}
          </p>
        </div>
        <button className="gmail-primary-btn" onClick={() => setIsOvertimeModalOpen(true)}>
          + Request Overtime
        </button>
      </div>

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

      <RequestOvertimeModal
        isOpen={isOvertimeModalOpen}
        profile={profile}
        onClose={() => setIsOvertimeModalOpen(false)}
        onCreated={handleOvertimeCreated}
      />

      <Toast message={toastMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
    </div>
  );
}