import { useEffect, useState } from "react";
import { fetchVouchers, generateVoucher } from "./clientPortalAdminApi";
import type { VoucherCode } from "./types";
import { Spinner } from "../components/Loader/Loader";
import "../../departments/it/gmail/GmailManagementPage.css";
import "../../departments/it/gmail/GmailForms.css";

function voucherState(v: VoucherCode): "used" | "expired" | "available" {
  if (v.isUsed) return "used";
  if (v.voucherExpiresAt && new Date(v.voucherExpiresAt) <= new Date()) return "expired";
  return "available";
}

export function VouchersTab() {
  const [vouchers, setVouchers] = useState<VoucherCode[] | null>(null);
  const [durationDays, setDurationDays] = useState("");
  const [voucherExpiresAt, setVoucherExpiresAt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<VoucherCode | null>(null);

  function reload() {
    fetchVouchers().then(setVouchers);
  }

  useEffect(reload, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsGenerating(true);
    try {
      const voucher = await generateVoucher(
        durationDays ? Number(durationDays) : null,
        voucherExpiresAt ? new Date(voucherExpiresAt).toISOString() : null,
      );
      setGenerated(voucher);
      reload();
    } catch {
      setError("Could not generate a voucher code.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="gmail-page">
      <h2 className="gmail-section-title">Generate voucher</h2>

      <form className="gmail-form" onSubmit={handleGenerate} style={{ maxWidth: 480 }}>
        <div className="gmail-field">
          <label className="gmail-label">Premium duration after redemption (days, blank = never expires)</label>
          <input
            type="number"
            min={1}
            className="gmail-input"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
          />
        </div>
        <div className="gmail-field">
          <label className="gmail-label">Code must be redeemed by (blank = no deadline)</label>
          <input
            type="datetime-local"
            className="gmail-input"
            value={voucherExpiresAt}
            onChange={(e) => setVoucherExpiresAt(e.target.value)}
          />
        </div>

        {error && <p className="gmail-error">{error}</p>}

        <div className="gmail-actions" style={{ borderTop: "none", paddingTop: 0, justifyContent: "flex-start" }}>
          <button type="submit" className="gmail-submit-btn" disabled={isGenerating}>
            {isGenerating ? "Generating…" : "Generate code"}
          </button>
        </div>
      </form>

      {generated && (
        <div className="editing-badge" style={{ maxWidth: 480 }}>
          <span className="editing-badge-label">New code</span>
          <span className="editing-badge-value">{generated.code}</span>
        </div>
      )}

      <h2 className="gmail-section-title" style={{ marginTop: 32 }}>Issued vouchers</h2>

      {!vouchers ? (
        <div className="gmail-page-loading"><Spinner size="lg" /></div>
      ) : (
        <div className="gmail-table-wrap" style={{ height: "auto" }}>
          <table className="gmail-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Redeemed</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => {
                const state = voucherState(v);
                return (
                  <tr key={v.id}>
                    <td className="mono-cell">{v.code}</td>
                    <td>{v.durationDays ? `${v.durationDays} days` : "No expiry"}</td>
                    <td>
                      <span className={`status-badge ${state === "used" ? "badge-active" : "badge-inactive"}`}>
                        {state}
                      </span>
                    </td>
                    <td>{v.redeemedAt ? new Date(v.redeemedAt).toLocaleString() : <span className="unassigned-text">—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
