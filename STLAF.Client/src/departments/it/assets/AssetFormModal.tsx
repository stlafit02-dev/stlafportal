import { useState } from "react";
import QRCode from "qrcode";
import { Modal } from "../../../common/components/Modal/Modal";
import { Spinner } from "../../../common/components/Loader/Loader";
import { createAsset, type Asset } from "./assetApi";
import "./AssetFormModal.css";

const TYPES = ["Laptop", "Desktop", "Mobile Phone", "Printer"];
const CONDITIONS = ["Brand New", "Refurbished", "Old"];
const STATUSES = ["Available", "Assigned", "Under Repair"];
const DEPARTMENTS = [
  "IT",
  "HRAdmin",
  "Litigation",
  "Accounting",
  "Corporate",
  "Marketing",
  "Partner",
];
interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (asset: Asset) => void;
}

const emptyForm = {
  deviceName: "",
  brand: "",
  model: "",
  serialNumber: "",
  price: "",
  type: "",
  condition: "",
  status: "Available",
  purchaseDate: "",
  assignedTo: "",
  department: "",
  previousUser: "",
  hasMouse: false,
  hasKeyboard: false,
  hasMonitor: false,
  mouseSerial: "",
  keyboardSerial: "",
  monitorSerial: "",
  remarks: "",
};

export function AssetFormModal({
  isOpen,
  onClose,
  onCreated,
}: AssetFormModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [hasExistingId, setHasExistingId] = useState(false);
  const [manualAssetTag, setManualAssetTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    asset: Asset;
    qrDataUrl: string;
  } | null>(null);

  function updateField<K extends keyof typeof form>(
    field: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetAndClose() {
    setForm(emptyForm);
    setHasExistingId(false);
    setManualAssetTag("");
    setError(null);
    setResult(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        deviceName: form.deviceName,
        brand: form.brand,
        model: form.model,
        serialNumber: form.serialNumber,
        price: parseFloat(form.price || "0"),
        type: form.type,
        condition: form.condition,
        status: form.status,
        purchaseDate: form.purchaseDate || undefined,
        assignedTo: form.status === "Available" ? undefined : form.assignedTo,
        department: form.department || undefined,
        previousUser: form.condition === "Old" ? form.previousUser : undefined,
        hasMouse: form.hasMouse,
        hasKeyboard: form.hasKeyboard,
        hasMonitor: form.hasMonitor,
        mouseSerial: form.hasMouse ? form.mouseSerial : undefined,
        keyboardSerial: form.hasKeyboard ? form.keyboardSerial : undefined,
        monitorSerial: form.hasMonitor ? form.monitorSerial : undefined,
        remarks: form.remarks || undefined,
        manualAssetTag: hasExistingId ? manualAssetTag : undefined,
      };

      const asset = await createAsset(payload);
      const qrDataUrl = await QRCode.toDataURL(asset.qr, {
        width: 220,
        margin: 1,
      });

      setResult({ asset, qrDataUrl });
      onCreated(asset);
    } catch {
      setError(
        "Something went wrong creating the asset. Please check the fields and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose}>
      <div className="asset-modal">
        {result ? (
          <div className="asset-result">
            <div className="asset-result-header">
              <span className="success-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <h2 className="asset-modal-title">Asset Added</h2>
            </div>

            <p className="asset-result-tag">{result.asset.assetTag}</p>
            <p className="asset-result-name">{result.asset.deviceName}</p>

            <div className="qr-frame">
              <img
                src={result.qrDataUrl}
                alt={"QR code for " + result.asset.assetTag}
              />
            </div>
            <div className="asset-result-actions">
              <a>
                href={result.qrDataUrl}
                download={result.asset.assetTag + ".png"}
                className="download-btn" Download QR
              </a>
              <button
                type="button"
                className="done-btn"
                onClick={resetAndClose}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="asset-modal-title">Add New Asset</h2>

            <form onSubmit={handleSubmit} className="asset-form">
              <label className="existing-id-toggle">
                <input
                  type="checkbox"
                  checked={hasExistingId}
                  onChange={(e) => setHasExistingId(e.target.checked)}
                />
                This asset already has an Asset ID
              </label>

              {hasExistingId && (
                <input
                  type="text"
                  placeholder="Existing Asset ID (e.g. STLAF-LP-2025-014)"
                  value={manualAssetTag}
                  onChange={(e) => setManualAssetTag(e.target.value)}
                  required
                  className="asset-input"
                />
              )}

              <div className="asset-grid">
                <input
                  type="text"
                  placeholder="Asset Name"
                  value={form.deviceName}
                  onChange={(e) => updateField("deviceName", e.target.value)}
                  required
                  className="asset-input"
                />
                <input
                  type="text"
                  placeholder="Brand"
                  value={form.brand}
                  onChange={(e) => updateField("brand", e.target.value)}
                  required
                  className="asset-input"
                />
                <input
                  type="text"
                  placeholder="Model"
                  value={form.model}
                  onChange={(e) => updateField("model", e.target.value)}
                  required
                  className="asset-input"
                />
                <input
                  type="text"
                  placeholder="Serial Number"
                  value={form.serialNumber}
                  onChange={(e) => updateField("serialNumber", e.target.value)}
                  required
                  className="asset-input"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  required
                  className="asset-input"
                />
                <select
                  value={form.type}
                  onChange={(e) => updateField("type", e.target.value)}
                  required
                  className="asset-input"
                >
                  <option value="" disabled>
                    Type
                  </option>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <select
                  value={form.condition}
                  onChange={(e) => updateField("condition", e.target.value)}
                  required
                  className="asset-input"
                >
                  <option value="" disabled>
                    Condition
                  </option>
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                  required
                  className="asset-input"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => updateField("purchaseDate", e.target.value)}
                  className="asset-input"
                />
                <input
                  type="text"
                  placeholder={
                    form.status === "Available"
                      ? "Assigned To (optional)"
                      : "Assigned To"
                  }
                  value={form.assignedTo}
                  onChange={(e) => updateField("assignedTo", e.target.value)}
                  required={form.status !== "Available"}
                  className="asset-input"
                />
                <select
                  value={form.department}
                  onChange={(e) => updateField("department", e.target.value)}
                  className="asset-input"
                >
                  <option value="" disabled>
                    Department
                  </option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {form.condition === "Old" && (
                <input
                  type="text"
                  placeholder="Previous Owner"
                  value={form.previousUser}
                  onChange={(e) => updateField("previousUser", e.target.value)}
                  className="asset-input"
                />
              )}

              <div className="accessory-section">
                <span className="accessory-label">Included Accessories</span>

                <label className="accessory-row">
                  <input
                    type="checkbox"
                    checked={form.hasMouse}
                    onChange={(e) => updateField("hasMouse", e.target.checked)}
                  />
                  Mouse
                </label>
                {form.hasMouse && (
                  <input
                    type="text"
                    placeholder="Mouse Serial Number"
                    value={form.mouseSerial}
                    onChange={(e) => updateField("mouseSerial", e.target.value)}
                    className="asset-input accessory-input"
                  />
                )}

                <label className="accessory-row">
                  <input
                    type="checkbox"
                    checked={form.hasKeyboard}
                    onChange={(e) =>
                      updateField("hasKeyboard", e.target.checked)
                    }
                  />
                  Keyboard
                </label>
                {form.hasKeyboard && (
                  <input
                    type="text"
                    placeholder="Keyboard Serial Number"
                    value={form.keyboardSerial}
                    onChange={(e) =>
                      updateField("keyboardSerial", e.target.value)
                    }
                    className="asset-input accessory-input"
                  />
                )}

                <label className="accessory-row">
                  <input
                    type="checkbox"
                    checked={form.hasMonitor}
                    onChange={(e) =>
                      updateField("hasMonitor", e.target.checked)
                    }
                  />
                  Monitor
                </label>
                {form.hasMonitor && (
                  <input
                    type="text"
                    placeholder="Monitor Serial Number"
                    value={form.monitorSerial}
                    onChange={(e) =>
                      updateField("monitorSerial", e.target.value)
                    }
                    className="asset-input accessory-input"
                  />
                )}
              </div>

              <textarea
                placeholder="Remarks (optional)"
                value={form.remarks}
                onChange={(e) => updateField("remarks", e.target.value)}
                rows={3}
                className="asset-input asset-textarea"
              />

              {error && <p className="asset-error">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="asset-submit-btn"
              >
                {isSubmitting ? (
                  <span className="btn-loading">
                    <Spinner size="sm" /> Saving…
                  </span>
                ) : (
                  "Add Asset"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </Modal>
  );
}
