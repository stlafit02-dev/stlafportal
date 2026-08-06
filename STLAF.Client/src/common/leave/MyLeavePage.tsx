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
import {
  fetchMedicalBlockStatus,
  fetchMyMedicalCertificates,
  uploadMedicalCertificate,
  type MedicalCertificate,
} from "./medicalApi";
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

  const [isBlocked, setIsBlocked] = useState(false);
  const [medicalCerts, setMedicalCerts] = useState<MedicalCertificate[]>([]);
  const [uploadingCertId, setUploadingCertId] = useState<string | null>(null);

  async function loadAll() {
    setIsLoading(true);
    const [prof, types, bals, reqs, blocked, certs] = await Promise.all([
      fetchMyProfile(),
      fetchLeaveTypes(),
      fetchMyBalances(),
      fetchMyRequests(),
      fetchMedicalBlockStatus(),
      fetchMyMedicalCertificates(),
    ]);
    setProfile(prof);
    setLeaveTypes(types);
    setBalances(bals);
    setMyRequests(reqs);
    setIsBlocked(blocked);
    setMedicalCerts(certs);
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
    setMyRequests((prev) =>
      prev.map((r) => (r.id === request.id ? request : r)),
    );
    setToastMessage("Retraction request submitted.");
    setIsToastVisible(true);
  }

  async function handleUploadMedical(certId: string, file: File) {
    setUploadingCertId(certId);
    try {
      await uploadMedicalCertificate(certId, file);
      setToastMessage(
        "Medical certificate uploaded — awaiting HR verification.",
      );
      setIsToastVisible(true);
      const [blocked, certs] = await Promise.all([
        fetchMedicalBlockStatus(),
        fetchMyMedicalCertificates(),
      ]);
      setIsBlocked(blocked);
      setMedicalCerts(certs);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Upload failed. Please try again.";
      setToastMessage(message);
      setIsToastVisible(true);
    } finally {
      setUploadingCertId(null);
    }
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
        <button
          className="gmail-primary-btn"
          onClick={() => setIsRequestModalOpen(true)}
        >
          + Request Leave
        </button>
      </div>

      {isBlocked && (
        <div className="medical-block-banner">
          <div className="medical-block-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            </svg>
          </div>
          <div>
            <p className="medical-block-title">Leave submission is on hold</p>
            <p className="medical-block-text">
              You have a fit-to-work medical certificate that needs to be
              uploaded (PDF only, max 3.5 MB) and verified by HR before you can
              submit new leave requests.
            </p>
            {medicalCerts
              .filter((c) => c.status !== "Verified")
              .map((c) => (
                <div key={c.id} className="medical-cert-row">
                  <span
                    className={`status-badge ${c.status === "PendingUpload" ? "badge-pending" : c.status === "Rejected" ? "badge-rejected" : "badge-progress"}`}
                  >
                    {c.status === "PendingUpload"
                      ? "Awaiting Upload"
                      : c.status === "PendingVerification"
                        ? "Awaiting HR Verification"
                        : "Rejected — re-upload required"}
                  </span>
                  {(c.status === "PendingUpload" ||
                    c.status === "Rejected") && (
                    <label className="medical-upload-btn">
                      {uploadingCertId === c.id ? (
                        <Spinner size="sm" />
                      ) : (
                        "Upload PDF"
                      )}
                      <input
                        type="file"
                        accept="application/pdf"
                        hidden
                        disabled={uploadingCertId === c.id}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          if (file.type !== "application/pdf") {
                            setToastMessage("Only PDF files are accepted.");
                            setIsToastVisible(true);
                            e.target.value = "";
                            return;
                          }

                          if (file.size > 3.5 * 1024 * 1024) {
                            setToastMessage(
                              "File is too large. Maximum size is 3.5 MB.",
                            );
                            setIsToastVisible(true);
                            e.target.value = "";
                            return;
                          }

                          handleUploadMedical(c.id, file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="leave-balance-cards">
        {balances.map((b) => (
          <div key={b.leaveTypeId} className="leave-balance-card">
            <span className="leave-balance-name">{b.leaveTypeName}</span>
            <span className="leave-balance-remaining">
              {b.remainingCredits}
            </span>
            <span className="leave-balance-sub">
              of {b.defaultCredits} remaining
            </span>
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
                    <td>
                      {new Date(r.startDate).toLocaleDateString()} –{" "}
                      {new Date(r.endDate).toLocaleDateString()}
                    </td>
                    <td>{r.days}</td>
                    <td>
                      <span
                        className={`status-badge ${STATUS_META[r.status] ?? ""}`}
                      >
                        {r.status === "RetractionRequested"
                          ? "Retraction Pending"
                          : r.status}
                      </span>
                    </td>
                    <td>
                      {r.decidedByName || (
                        <span className="unassigned-text">—</span>
                      )}
                    </td>
                    <td className="email-date-cell">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      {r.status === "Approved" && (
                        <button
                          className="ls-test-btn"
                          onClick={() => setRetractTarget(r)}
                        >
                          Retract
                        </button>
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

      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
    </div>
  );
}
