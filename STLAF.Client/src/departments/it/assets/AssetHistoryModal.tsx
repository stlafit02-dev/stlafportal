import { useState } from "react";
import { Modal } from "../../../common/components/Modal/Modal";
import { Spinner } from "../../../common/components/Loader/Loader";
import { createAssetHistory, type Asset, type AssetHistoryEntry } from "./assetApi";
import "./AssetHistoryModal.css";

const PARTS = [
  "Battery",
  "Screen / Display",
  "Keyboard",
  "RAM",
  "Storage (SSD/HDD)",
  "Motherboard",
  "Charger / Adapter",
  "Mouse",
  "Trackpad",
  "Fan / Cooling",
  "Other",
];

interface AssetHistoryModalProps {
  isOpen: boolean;
  assets: Asset[];
  onClose: () => void;
  onCreated: (entry: AssetHistoryEntry) => void;
}

const emptyForm = {
  assetId: "",
  partComponent: "",
  serialNumber: "",
  datePurchased: "",
  dateOfReplacement: new Date().toISOString().slice(0, 10),
  notes: "",
};

export function AssetHistoryModal({ isOpen, assets, onClose, onCreated }: AssetHistoryModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetAndClose() {
    setForm(emptyForm);
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const entry = await createAssetHistory({
        assetId: form.assetId,
        partComponent: form.partComponent,
        serialNumber: form.serialNumber || undefined,
        datePurchased: form.datePurchased || undefined,
        dateOfReplacement: form.dateOfReplacement,
        notes: form.notes || undefined,
      });
      onCreated(entry);
      resetAndClose();
    } catch {
      setError("Something went wrong saving this record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose}>
      <div className="history-modal">
        <div className="history-modal-header">
          <h2 className="history-modal-title">New Replacement / Repair Record</h2>
          <button className="history-modal-close" onClick={resetAndClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="history-form">
          <div className="history-field">
            <label className="history-label">
              Issued To (Asset) <span className="required-mark">*</span>
            </label>
            <select
              value={form.assetId}
              onChange={(e) => updateField("assetId", e.target.value)}
              required
              className="history-input"
            >
              <option value="" disabled>Select an asset…</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetTag} — {a.deviceName}
                </option>
              ))}
            </select>
          </div>

          <div className="history-grid">
            <div className="history-field">
              <label className="history-label">
                Part / Component <span className="required-mark">*</span>
              </label>
              <select
                value={form.partComponent}
                onChange={(e) => updateField("partComponent", e.target.value)}
                required
                className="history-input"
              >
                <option value="" disabled>Select part/component</option>
                {PARTS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="history-field">
              <label className="history-label">Serial Number</label>
              <input
                type="text"
                placeholder="New part serial number"
                value={form.serialNumber}
                onChange={(e) => updateField("serialNumber", e.target.value)}
                className="history-input"
              />
            </div>

            <div className="history-field">
              <label className="history-label">Date Purchased</label>
              <input
                type="date"
                value={form.datePurchased}
                onChange={(e) => updateField("datePurchased", e.target.value)}
                className="history-input"
              />
            </div>

            <div className="history-field">
              <label className="history-label">
                Date of Replacement <span className="required-mark">*</span>
              </label>
              <input
                type="date"
                value={form.dateOfReplacement}
                onChange={(e) => updateField("dateOfReplacement", e.target.value)}
                required
                className="history-input"
              />
            </div>
          </div>

          <div className="history-field">
            <label className="history-label">Notes</label>
            <textarea
              placeholder="Reason for replacement, old part condition…"
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={3}
              className="history-input history-textarea"
            />
          </div>

          {error && <p className="history-error">{error}</p>}

          <div className="history-actions">
            <button type="button" className="history-cancel-btn" onClick={resetAndClose}>
              Cancel
            </button>
            <button type="submit" className="history-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="btn-loading"><Spinner size="sm" /> Saving…</span>
              ) : (
                "Add Record"
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}