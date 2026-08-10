import { useEffect, useState } from "react";
import { fetchPendingMedicalVerifications, verifyMedicalCertificate, type MedicalCertificate } from "../../../common/leave/medicalApi";
import { Spinner } from "../../../common/components/Loader/Loader";
import { Toast } from "../../../common/components/Toast/Toast";
import "../../it/gmail/GmailManagementPage.css";

export function MedicalVerificationsPage() {
  const [pending, setPending] = useState<MedicalCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  async function loadAll() {
    setIsLoading(true);
    setPending(await fetchPendingMedicalVerifications());
    setIsLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleDecide(cert: MedicalCertificate, approved: boolean) {
    setDecidingId(cert.id);
    try {
      await verifyMedicalCertificate(cert.id, approved);
      setPending((prev) => prev.filter((c) => c.id !== cert.id));
      setToastMessage(`${cert.employeeName}'s medical certificate ${approved ? "verified" : "rejected"}.`);
      setIsToastVisible(true);
    } finally {
      setDecidingId(null);
    }
  }

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
          <h1 className="page-title">Medical Certificates</h1>
          <p className="page-subtitle">Verify fit-to-work certificates uploaded by employees.</p>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="gmail-empty">No pending medical certificates.</div>
      ) : (
        <div className="gmail-table-wrap email-table-wrap">
          <table className="gmail-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Uploaded</th>
                <th>Document</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((c) => (
                <tr key={c.id}>
                  <td>{c.employeeName}</td>
                  <td>{c.department}</td>
                  <td className="email-date-cell">
                    {c.uploadedAt ? new Date(c.uploadedAt).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    {c.driveFileUrl ? (
                      <a href={c.driveFileUrl} target="_blank" rel="noreferrer" className="ls-test-btn" style={{ textDecoration: "none" }}>
                        View File
                      </a>
                    ) : (
                      <span className="unassigned-text">—</span>
                    )}
                  </td>
                  <td>
                    <div className="action-icons">
                      <button
                        className="leave-approve-btn"
                        onClick={() => handleDecide(c, true)}
                        disabled={decidingId === c.id}
                      >
                        Verify
                      </button>
                      <button
                        className="leave-reject-btn"
                        onClick={() => handleDecide(c, false)}
                        disabled={decidingId === c.id}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Toast message={toastMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
    </div>
  );
}