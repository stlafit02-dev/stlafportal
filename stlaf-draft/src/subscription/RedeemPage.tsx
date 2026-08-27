import { useState } from "react";
import { redeemVoucher } from "./voucherApi";
import "./RedeemPage.css";

export function RedeemPage() {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ expiresAt: string | null } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      const result = await redeemVoucher(code.trim());
      setSuccess({ expiresAt: result.expiresAt });
      setCode("");
    } catch {
      setError("Invalid or expired code.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Redeem a voucher</h1>
      <p className="page-subtitle">Enter the code your STLAF contact gave you to unlock Premium.</p>

      <form className="redeem-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Voucher code"
          className="redeem-input"
          required
        />
        <button type="submit" className="redeem-submit" disabled={isSubmitting || !code.trim()}>
          {isSubmitting ? "Redeeming…" : "Redeem"}
        </button>
      </form>

      {error && <p className="form-error">{error}</p>}
      {success && (
        <p className="redeem-success">
          Premium activated
          {success.expiresAt ? ` until ${new Date(success.expiresAt).toLocaleDateString()}` : ""}.
        </p>
      )}
    </div>
  );
}
