import { useEffect, useState } from "react";
import { fetchMyProfile, type EmployeeProfile } from "./leaveApi";
import { fetchMyUndertimeRequests, type UndertimeRequest } from "./undertimeApi";
import { RequestUndertimeModal } from "./RequestUndertimeModal";
import { Spinner } from "../components/Loader/Loader";
import { Toast } from "../components/Toast/Toast";
import "../../departments/it/gmail/GmailManagementPage.css";
import "./LeavePage.css";

const STATUS_META: Record<string, string> = {
  Pending: "badge-pending",
  Approved: "badge-active",
  Rejected: "badge-rejected",
};

export function MyUndertimePage() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [myRequests, setMyRequests] = useState<UndertimeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  async function loadAll() {
    setIsLoading(true);
    const [prof, reqs] = await Promise.all([fetchMyProfile(), fetchMyUndertimeRequests()]);
    setProfile(prof);
    setMyRequests(reqs);
    setIsLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function handleCreated(request: UndertimeRequest) {
    setMyRequests((prev) => [request, ...prev]);
    setToastMessage("Undertime request submitted.");
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
          <h1 className="page-title">My Undertime</h1>
          <p className="page-subtitle">
            {profile.fullName} · {profile.department} · {profile.companyId}
          </p>
        </div>
        <button className="gmail-primary-btn" onClick={() => setIsModalOpen(true)}>
          + Request Undertime
        </button>
      </div>

      <section className="gmail-section">
        <h2 className="gmail-section-title">My Undertime Requests</h2>
        {myRequests.length === 0 ? (
          <div className="gmail-empty">No undertime requests yet.</div>
        ) : (
          <div className="gmail-table-wrap email-table-wrap">
            <table className="gmail-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Decided By</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {myRequests.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td>{r.startTime}–{r.endTime}</td>
                    <td>{r.hours}</td>
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

      <RequestUndertimeModal
        isOpen={isModalOpen}
        profile={profile}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleCreated}
      />

      <Toast message={toastMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
    </div>
  );
}