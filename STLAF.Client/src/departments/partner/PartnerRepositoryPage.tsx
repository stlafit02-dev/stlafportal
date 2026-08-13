import { useEffect, useState } from "react";
import { fetchPartnerDashboard, type DocumentRequest } from "../../common/documents/documentApi";
import { Spinner } from "../../common/components/Loader/Loader";
import "../it/gmail/GmailManagementPage.css";

export function PartnerRepositoryPage() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPartnerDashboard().then((data) => {
      setRequests(data.filter((r) => r.status === "Approved"));
      setIsLoading(false);
    });
  }, []);

  const filtered = requests.filter((r) => {
    const query = searchQuery.trim().toLowerCase();
    return (
      query === "" ||
      r.trackingNumber.toLowerCase().includes(query) ||
      r.title.toLowerCase().includes(query) ||
      r.employeeName.toLowerCase().includes(query)
    );
  });

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
          <h1 className="page-title">Repository</h1>
          <p className="page-subtitle">{requests.length} approved documents.</p>
        </div>
      </div>

      <div className="gws-search-box email-search-box" style={{ marginBottom: 20 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search by tracking #, title, or submitter…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="gws-search-input"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="gmail-empty">
          {requests.length === 0 ? "No approved documents yet." : "No documents match your search."}
        </div>
      ) : (
        <div className="gmail-table-panel">
          <div className="gmail-table-wrap">
            <table className="gmail-table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Title</th>
                  <th>Submitted By</th>
                  <th>Approved By</th>
                  <th>Approved On</th>
                  <th>File</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="mono-cell">{r.trackingNumber}</td>
                    <td>{r.title}</td>
                    <td>{r.employeeName} ({r.department})</td>
                    <td>{r.partnerDecidedByName || <span className="unassigned-text">—</span>}</td>
                    <td className="email-date-cell">
                      {r.partnerDecidedAt ? new Date(r.partnerDecidedAt).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      {r.fileUrl ? (
                        <a href={r.fileUrl} target="_blank" rel="noreferrer" className="ls-test-btn" style={{ textDecoration: "none" }}>
                          View File
                        </a>
                      ) : r.documentLink ? (
                        <a href={r.documentLink} target="_blank" rel="noreferrer" className="ls-test-btn" style={{ textDecoration: "none" }}>
                          Open Link
                        </a>
                      ) : (
                        <span className="unassigned-text">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}