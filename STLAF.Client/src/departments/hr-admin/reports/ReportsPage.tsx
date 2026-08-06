import { useState } from "react";
import { downloadLeaveOvertimeReport } from "./reportApi";
import { Spinner } from "../../../common/components/Loader/Loader";
import { Toast } from "../../../common/components/Toast/Toast";
import "../../it/gmail/GmailForms.css";
import "./ReportsPage.css";

const DEPARTMENTS = [
  "All",
  "IT",
  "HRAdmin",
  "Litigation",
  "Accounting",
  "Corporate",
  "Marketing",
];

export function ReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [department, setDepartment] = useState("All");
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  async function handleExport() {
    setIsGenerating(true);
    try {
      await downloadLeaveOvertimeReport({
        from: from || undefined,
        to: to || undefined,
        department,
      });
      setToastMessage("Report downloaded.");
      setIsToastVisible(true);
    } catch {
      setToastMessage("Something went wrong generating the report.");
      setIsToastVisible(true);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="gmail-page">
      <div className="gmail-page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">
            Export Leave &amp; Overtime records to Excel.
          </p>
        </div>
      </div>

      <div className="report-panel">
        <div className="report-grid">
          <div className="gmail-field">
            <label className="gmail-label">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="gmail-input"
            />
          </div>
          <div className="gmail-field">
            <label className="gmail-label">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="gmail-input"
            />
          </div>
          <div className="gmail-field">
            <label className="gmail-label">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="gmail-input"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="report-note">
          Leave blank dates to include all records. The exported file has three
          sheets: Leave Requests, Overtime Requests, and Undertime Requests.
        </p>

        <button
          className="gmail-submit-btn report-export-btn"
          onClick={handleExport}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <span className="btn-loading">
              <Spinner size="sm" /> Generating…
            </span>
          ) : (
            <>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ marginRight: 8 }}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export to Excel
            </>
          )}
        </button>
      </div>

      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
    </div>
  );
}
