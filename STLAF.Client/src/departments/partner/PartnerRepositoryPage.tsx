import { useEffect, useState } from "react";
import { fetchPartnerRepository, type DocumentRequest } from "../../common/documents/documentApi";
import { Spinner } from "../../common/components/Loader/Loader";
import "../it/gmail/GmailManagementPage.css";

const PAGE_SIZE = 20;

export function PartnerRepositoryPage() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    setIsLoading(true);
    fetchPartnerRepository(page, PAGE_SIZE, search).then((result) => {
      setRequests(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(Math.max(result.totalPages, 1));
      setIsLoading(false);
    });
  }, [page, search]);

  return (
    <div className="gmail-page">
      <div className="gmail-page-header">
        <div>
          <h1 className="page-title">Repository</h1>
          <p className="page-subtitle">{totalCount} approved documents.</p>
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
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="gws-search-input"
        />
      </div>

      {isLoading ? (
        <div className="gmail-page-loading">
          <Spinner size="lg" />
        </div>
      ) : requests.length === 0 ? (
        <div className="gmail-empty gmail-table-empty">
          {search ? "No documents match your search." : "No approved documents yet."}
        </div>
      ) : (
        <>
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
                  {requests.map((r) => (
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

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
            <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
              Page {page} of {totalPages}
            </span>
            <div className="action-icons">
              <button
                className="ls-test-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </button>
              <button
                className="ls-test-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
