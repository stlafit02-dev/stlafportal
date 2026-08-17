import { useState, useEffect } from "react";
import { Modal } from "../../../common/components/Modal/Modal";
import { Spinner } from "../../../common/components/Loader/Loader";
import {
  FloatingInput,
  FloatingSelect,
  FloatingTextarea,
} from "../../../common/components/FloatingField/FloatingField";
import { updateAsset, type Asset } from "./assetApi";
import "./AssetDetailModal.css";
import { fetchAssetHistory, type AssetHistoryEntry } from "./assetApi";

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

const STATUS_PILL: Record<string, string> = {
  Available: "status-available",
  Assigned: "status-assigned",
  "Under Repair": "status-repair",
};

function formatPrice(value: number) {
  return `₱${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface AssetDetailModalProps {
  asset: Asset | null;
  startInEditMode?: boolean;
  onClose: () => void;
  onUpdated: (asset: Asset) => void;
}

function buildFormFromAsset(asset: Asset) {
  return {
    deviceName: asset.deviceName,
    brand: asset.brand,
    model: asset.model,
    serialNumber: asset.serialNumber,
    price: String(asset.price),
    type: asset.type,
    condition: asset.condition,
    status: asset.status,
    purchaseDate: asset.purchaseDate ? asset.purchaseDate.slice(0, 10) : "",
    assignedTo: asset.assignedTo ?? "",
    department: asset.department ?? "",
    previousUser: asset.previousUser ?? "",
    hasMouse: asset.hasMouse,
    hasKeyboard: asset.hasKeyboard,
    hasMonitor: asset.hasMonitor,
    mouseSerial: asset.mouseSerial ?? "",
    keyboardSerial: asset.keyboardSerial ?? "",
    monitorSerial: asset.monitorSerial ?? "",
    remarks: asset.remarks ?? "",
  };
}

export function AssetDetailModal({
  asset,
  startInEditMode,
  onClose,
  onUpdated,
}: AssetDetailModalProps) {
  if (!asset) return null;

  const [isEditing, setIsEditing] = useState(!!startInEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(() => buildFormFromAsset(asset));
  const [history, setHistory] = useState<AssetHistoryEntry[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  useEffect(() => {
    setIsHistoryLoading(true);
    fetchAssetHistory(asset.id).then((data) => {
      setHistory(data);
      setIsHistoryLoading(false);
    });
  }, [asset.id]);

  function updateField<K extends keyof typeof form>(
    field: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleStatusChange(newStatus: string) {
    updateField("status", newStatus);
    if (newStatus === "Available") {
      updateField("assignedTo", "");
    }
  }

  async function handleSave() {
    if (!asset) return;
    setError(null);
    setIsSaving(true);

    try {
      const updated = await updateAsset(asset.id, {
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
      });
      onUpdated(updated);
      setIsEditing(false);
    } catch {
      setError("Something went wrong saving changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const hasAccessories =
    asset.hasMouse || asset.hasKeyboard || asset.hasMonitor;

  return (
    <Modal isOpen={!!asset} onClose={onClose}>
      <div className="asset-detail-modal">
        {!isEditing ? (
          <div className="asset-view">
            <div className="asset-view-header">
              <div>
                <h2 className="asset-view-name">{asset.deviceName}</h2>
                <span className="asset-view-tag">{asset.assetTag}</span>
              </div>
              <button
                className="asset-detail-close"
                onClick={onClose}
                aria-label="Close"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <span className={`status-pill ${STATUS_PILL[asset.status] ?? ""}`}>
              {asset.status}
            </span>

            <div className="asset-view-rows">
              <div className="view-row">
                <span className="row-label">Asset ID</span>
                <span className="row-value accent mono">{asset.assetTag}</span>
              </div>
              <div className="view-row">
                <span className="row-label">Serial Number</span>
                <span className="row-value mono">{asset.serialNumber}</span>
              </div>
              <div className="view-row">
                <span className="row-label">Type</span>
                <span className="row-value">{asset.type}</span>
              </div>
              <div className="view-row">
                <span className="row-label">Brand</span>
                <span className="row-value">{asset.brand}</span>
              </div>
              <div className="view-row">
                <span className="row-label">Model</span>
                <span className="row-value">{asset.model}</span>
              </div>
              <div className="view-row">
                <span className="row-label">Price</span>
                <span className="row-value">{formatPrice(asset.price)}</span>
              </div>
              <div className="view-row">
                <span className="row-label">Condition</span>
                <span className="row-value">{asset.condition}</span>
              </div>
              <div className="view-row">
                <span className="row-label">Purchased</span>
                <span className="row-value">
                  {asset.purchaseDate
                    ? new Date(asset.purchaseDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
              <div className="view-row">
                <span className="row-label">Assigned To</span>
                <span className="row-value">
                  {asset.assignedTo || "No data"}
                </span>
              </div>
              <div className="view-row">
                <span className="row-label">Department</span>
                <span className="row-value">{asset.department || "—"}</span>
              </div>
              {asset.condition === "Old" && (
                <div className="view-row">
                  <span className="row-label">Previous Owner</span>
                  <span className="row-value">{asset.previousUser || "—"}</span>
                </div>
              )}
            </div>

            <div className="asset-view-peripherals">
              <span className="peripherals-label">Peripherals</span>
              {hasAccessories ? (
                <div className="accessory-pills">
                  {asset.hasMouse && (
                    <span className="accessory-pill">
                      Mouse {asset.mouseSerial && `· ${asset.mouseSerial}`}
                    </span>
                  )}
                  {asset.hasKeyboard && (
                    <span className="accessory-pill">
                      Keyboard{" "}
                      {asset.keyboardSerial && `· ${asset.keyboardSerial}`}
                    </span>
                  )}
                  {asset.hasMonitor && (
                    <span className="accessory-pill">
                      Monitor{" "}
                      {asset.monitorSerial && `· ${asset.monitorSerial}`}
                    </span>
                  )}
                </div>
              ) : (
                <p className="peripherals-none">None</p>
              )}
            </div>

            {asset.remarks && (
              <div className="asset-detail-remarks">
                <span className="detail-label">Remarks</span>
                <p className="remarks-text">{asset.remarks}</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="asset-detail-header">
              <div>
                <span className="asset-detail-tag">{asset.assetTag}</span>
                <span className="asset-detail-name">{asset.deviceName}</span>
              </div>
              <button
                className="asset-detail-close"
                onClick={onClose}
                aria-label="Close"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="asset-grid">
              <FloatingInput
                label="Asset Name"
                type="text"
                value={form.deviceName}
                onChange={(e) => updateField("deviceName", e.target.value)}
              />
              <FloatingInput
                label="Brand"
                type="text"
                value={form.brand}
                onChange={(e) => updateField("brand", e.target.value)}
              />
              <FloatingInput
                label="Model"
                type="text"
                value={form.model}
                onChange={(e) => updateField("model", e.target.value)}
              />
              <FloatingInput
                label="Serial Number"
                type="text"
                value={form.serialNumber}
                onChange={(e) => updateField("serialNumber", e.target.value)}
              />
              <FloatingInput
                label="Price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
              />
              <FloatingSelect
                label="Type"
                value={form.type}
                onChange={(e) => updateField("type", e.target.value)}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </FloatingSelect>
              <FloatingSelect
                label="Condition"
                value={form.condition}
                onChange={(e) => updateField("condition", e.target.value)}
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </FloatingSelect>
              <FloatingSelect
                label="Status"
                value={form.status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </FloatingSelect>
              <FloatingInput
                label="Purchase Date"
                type="date"
                value={form.purchaseDate}
                onChange={(e) => updateField("purchaseDate", e.target.value)}
              />

              {form.status === "Available" ? (
                <div className="floating-field">
                  <div className="floating-static">No data</div>
                  <label className="floating-label floating-label-up">
                    Assigned To
                  </label>
                </div>
              ) : (
                <FloatingInput
                  label="Assigned To"
                  type="text"
                  value={form.assignedTo}
                  onChange={(e) => updateField("assignedTo", e.target.value)}
                />
              )}

              <FloatingSelect
                label="Department"
                value={form.department}
                onChange={(e) => updateField("department", e.target.value)}
              >
                <option value="" disabled></option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </FloatingSelect>
            </div>

            {form.condition === "Old" && (
              <FloatingInput
                label="Previous Owner"
                type="text"
                value={form.previousUser}
                onChange={(e) => updateField("previousUser", e.target.value)}
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
                <FloatingInput
                  label="Mouse Serial Number"
                  type="text"
                  value={form.mouseSerial}
                  onChange={(e) => updateField("mouseSerial", e.target.value)}
                  className="accessory-input"
                />
              )}

              <label className="accessory-row">
                <input
                  type="checkbox"
                  checked={form.hasKeyboard}
                  onChange={(e) => updateField("hasKeyboard", e.target.checked)}
                />
                Keyboard
              </label>
              {form.hasKeyboard && (
                <FloatingInput
                  label="Keyboard Serial Number"
                  type="text"
                  value={form.keyboardSerial}
                  onChange={(e) =>
                    updateField("keyboardSerial", e.target.value)
                  }
                  className="accessory-input"
                />
              )}

              <label className="accessory-row">
                <input
                  type="checkbox"
                  checked={form.hasMonitor}
                  onChange={(e) => updateField("hasMonitor", e.target.checked)}
                />
                Monitor
              </label>
              {form.hasMonitor && (
                <FloatingInput
                  label="Monitor Serial Number"
                  type="text"
                  value={form.monitorSerial}
                  onChange={(e) => updateField("monitorSerial", e.target.value)}
                  className="accessory-input"
                />
              )}
            </div>
            <div className="asset-view-history">
              <span className="peripherals-label">
                Repair / Replacement History
              </span>
              {isHistoryLoading ? (
                <div className="history-loading">
                  <Spinner size="sm" />
                </div>
              ) : history.length === 0 ? (
                <p className="peripherals-none">No records yet.</p>
              ) : (
                <div className="history-list">
                  {history.map((h) => (
                    <div key={h.id} className="history-entry">
                      <div className="history-entry-top">
                        <span className="history-entry-part">
                          {h.partComponent}
                        </span>
                        <span className="history-entry-date">
                          {new Date(h.dateOfReplacement).toLocaleDateString()}
                        </span>
                      </div>
                      {h.serialNumber && (
                        <span className="history-entry-serial">
                          S/N: {h.serialNumber}
                        </span>
                      )}
                      {h.notes && (
                        <p className="history-entry-notes">{h.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <FloatingTextarea
              label="Remarks (optional)"
              value={form.remarks}
              onChange={(e) => updateField("remarks", e.target.value)}
              rows={3}
            />

            {error && <p className="asset-error">{error}</p>}

            <div className="asset-detail-actions">
              <button
                className="cancel-btn"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="btn-loading">
                    <Spinner size="sm" /> Saving…
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
