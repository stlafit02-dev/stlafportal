import { useEffect, useState } from "react";
import { fetchAmIPartner, fetchPendingPartnerOvertime, type OvertimeRequest } from "./overtimeApi";
import { DecideOvertimeModal } from "./DecideOvertimeModal";
import { Spinner } from "../components/Loader/Loader";
import { Toast } from "../components/Toast/Toast";
import "../../departments/it/gmail/GmailManagementPage.css";
import "./LeavePage.css";

export function FinalApprovalsPage() {
  const [isPartner, setIsPartner] = useState(false);
  const [pendingPartnerOvertime, setPendingPartnerOvertime] = useState<OvertimeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [decideTarget, setDecideTarget] = useState<{ request: OvertimeRequest; approved: boolean } | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  async function loadAll() {
    setIsLoading(true);
    const partnerFlag = await fetchAmIPartner();
    setIsPartner(partnerFlag);
    if (partnerFlag) {
      setPendingPartnerOvertime(await fetchPendingPartnerOvertime());
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function handleDecided(request: OvertimeRequest) {
    setPendingPartnerOvertime((prev) => prev.filter((r) => r.id !== request.id));
    setToastMessage(`${request.employeeName}'s overtime ${request.status.toLowerCase()} (final).`);
    setIsToastVisible(true);
  }

  if (isLoading) {
    return (
      <div className="gmail-page-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isPartner) {
    return (
      <div className="gmail-page">
        <div className="gmail-page-header">
          <div>
            <h1 className="page-title">Final Approvals</h1>
            <p className="page-subtitle">You are not assigned as a Partner for any department.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gmail-page">
      <div className="gmail-page-header">
        <div>
          <h1 className="page-title">Final Approvals</h1>
          <p className="page-subtitle">Overtime requests awaiting your final decision.</p>
        </div>
      </div>

      <section className="gmail-section">
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

      <DecideOvertimeModal
        key={decideTarget?.request.id ?? "decide-empty"}
        request={decideTarget?.request ?? null}
        approved={decideTarget?.approved ?? false}
        stage="partner"
        onClose={() => setDecideTarget(null)}
        onDecided={handleDecided}
      />

      <Toast message={toastMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
    </div>
  );
}