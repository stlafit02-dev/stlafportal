import { useEffect, useState } from "react";
import { fetchAssets, deleteAsset, type Asset } from "./assetApi";
import { AssetFormModal } from "./AssetFormModal";
import { AssetDetailModal } from "./AssetDetailModal";
import { QRCodeModal } from "./QRCodeModal";
import { Spinner } from "../../../common/components/Loader/Loader";
import { Toast } from "../../../common/components/Toast/Toast";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog/ConfirmDialog";
import "./AssetManagementPage.css";
import { AssetHistoryModal } from "./AssetHistoryModal";

const TYPE_FILTERS = ["All", "Laptop", "Desktop", "Mobile Phone", "Printer"];

const STATUS_META: Record<string, string> = {
  Available: "badge-available",
  Assigned: "badge-assigned",
  "Under Repair": "badge-repair",
};

export function AssetManagementPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewAssetId, setViewAssetId] = useState<string | null>(null);
  const [editAssetId, setEditAssetId] = useState<string | null>(null);
  const [qrAssetId, setQrAssetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Asset | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  async function loadAssets() {
    setIsLoading(true);
    const data = await fetchAssets();
    setAssets(data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadAssets();
  }, []);

  function handleCreated(asset: Asset) {
    setAssets((prev) => [asset, ...prev]);
  }

  function handleUpdated(updated: Asset) {
    setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  }

  function handleDelete(asset: Asset) {
    setPendingDelete(asset);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const asset = pendingDelete;
    setPendingDelete(null);

    await deleteAsset(asset.id);
    setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    setToastMessage(`${asset.assetTag} deleted.`);
    setIsToastVisible(true);
  }

  const filtered = assets.filter((a) => {
    const matchesType = typeFilter === "All" || a.type === typeFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      a.assetTag.toLowerCase().includes(query) ||
      a.deviceName.toLowerCase().includes(query) ||
      a.serialNumber.toLowerCase().includes(query) ||
      (a.assignedTo ?? "").toLowerCase().includes(query);
    return matchesType && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    const cmp = a.assetTag.localeCompare(b.assetTag, undefined, {
      numeric: true,
    });
    return sortOrder === "asc" ? cmp : -cmp;
  });

  const viewAsset = assets.find((a) => a.id === viewAssetId) ?? null;
  const editAsset = assets.find((a) => a.id === editAssetId) ?? null;
  const qrAsset = assets.find((a) => a.id === qrAssetId) ?? null;

  return (
    <div className="asset-page">
      <div className="asset-page-header">
        <div>
          <h1 className="page-title">Asset Management</h1>
          <p className="page-subtitle">
            Track devices, ownership, and accessories.
          </p>
        </div>
        <div className="header-btn-group">
          <button
            className="new-record-btn"
            onClick={() => setIsHistoryModalOpen(true)}
          >
            + New Record
          </button>
          <button className="add-asset-btn" onClick={() => setIsFormOpen(true)}>
            + Add Asset
          </button>
        </div>
      </div>

      <div className="asset-toolbar">
        <div className="search-box">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by asset ID, name, serial, or assignee…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-chips">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              className={`filter-chip ${typeFilter === t ? "filter-chip-active" : ""}`}
              onClick={() => setTypeFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="asset-table-panel">
        {isLoading ? (
          <div className="asset-loading">
            <Spinner size="md" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="asset-empty">
            <p>
              {assets.length === 0
                ? "No assets yet."
                : "No assets match your search or filter."}
            </p>
          </div>
        ) : (
          <div className="asset-table-wrap">
            <table className="asset-table">
              <thead>
                <tr>
                  <th>
                    <button
                      onClick={() =>
                        setSortOrder((prev) =>
                          prev === "desc" ? "asc" : "desc",
                        )
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        color: "inherit",
                        font: "inherit",
                      }}
                    >
                      Asset ID
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        {sortOrder === "desc" ? (
                          <path d="M12 5v14M5 12l7 7 7-7" />
                        ) : (
                          <path d="M12 19V5M5 12l7-7 7 7" />
                        )}
                      </svg>
                    </button>
                  </th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Brand / Model</th>
                  <th>Serial #</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Department</th>
                  <th>QR</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((a) => (
                  <tr
                    key={a.id}
                    className="asset-row"
                    onClick={() => setViewAssetId(a.id)}
                  >
                    <td>
                      <span className="asset-tag">{a.assetTag}</span>
                    </td>
                    <td>{a.deviceName}</td>
                    <td>{a.type}</td>
                    <td>
                      <div className="brand-model-cell">
                        <span className="brand-text">{a.brand}</span>
                        <span className="model-text">{a.model}</span>
                      </div>
                    </td>
                    <td className="mono-cell">{a.serialNumber}</td>
                    <td>
                      <span
                        className={`status-badge ${STATUS_META[a.status] ?? ""}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td>
                      {a.assignedTo || (
                        <span className="unassigned-text">—</span>
                      )}
                    </td>
                    <td>
                      {a.department || (
                        <span className="unassigned-text">—</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="icon-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQrAssetId(a.id);
                        }}
                        aria-label="View QR code"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="3" width="7" height="7" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                          <line x1="14" y1="14" x2="14" y2="21" />
                          <line x1="21" y1="14" x2="21" y2="21" />
                          <line x1="14" y1="17.5" x2="21" y2="17.5" />
                        </svg>
                      </button>
                    </td>
                    <td>
                      <div className="action-icons">
                        <button
                          className="icon-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditAssetId(a.id);
                          }}
                          aria-label="Edit asset"
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          </svg>
                        </button>
                        <button
                          className="icon-btn icon-btn-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(a);
                          }}
                          aria-label="Delete asset"
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AssetFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onCreated={handleCreated}
      />

      <AssetDetailModal
        key={viewAsset?.id ?? "view-empty"}
        asset={viewAsset}
        onClose={() => setViewAssetId(null)}
        onUpdated={handleUpdated}
      />

      <AssetDetailModal
        key={editAsset?.id ?? "edit-empty"}
        asset={editAsset}
        startInEditMode
        onClose={() => {
          setEditAssetId(null);
        }}
        onUpdated={(updated) => {
          handleUpdated(updated);
          setEditAssetId(null);
        }}
      />

      <QRCodeModal asset={qrAsset} onClose={() => setQrAssetId(null)} />

      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Delete Asset"
        message={
          pendingDelete
            ? `Delete ${pendingDelete.assetTag} — ${pendingDelete.deviceName}? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
      <AssetHistoryModal
        isOpen={isHistoryModalOpen}
        assets={assets}
        onClose={() => setIsHistoryModalOpen(false)}
        onCreated={() => {
          setToastMessage("Record added.");
          setIsToastVisible(true);
        }}
      />
    </div>
  );
}
