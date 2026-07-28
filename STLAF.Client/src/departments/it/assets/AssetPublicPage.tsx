import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchAssetByTag, type PublicAsset } from "./assetApi";
import { Spinner } from "../../../common/components/Loader/Loader";
import "./AssetPublicPage.css";

const STATUS_META: Record<string, string> = {
  Available: "badge-available",
  Assigned: "badge-assigned",
  "Under Repair": "badge-repair",
};

export function AssetPublicPage() {
  const { assetTag } = useParams<{ assetTag: string }>();
  const [asset, setAsset] = useState<PublicAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!assetTag) return;
    fetchAssetByTag(assetTag)
      .then(setAsset)
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [assetTag]);

  if (isLoading) {
    return (
      <div className="public-asset-page public-asset-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound || !asset) {
    return (
      <div className="public-asset-page public-asset-center">
        <p className="public-not-found">No asset found for this code.</p>
      </div>
    );
  }

  return (
    <div className="public-asset-page">
      <div className="public-asset-card">
        <span className="public-wordmark">STLAF · IT Asset Registry</span>
        <span className="public-asset-tag">{asset.assetTag}</span>
        <h1 className="public-asset-name">{asset.deviceName}</h1>
        <span
          className={`public-status-badge ${STATUS_META[asset.status] ?? ""}`}
        >
          {asset.status}
        </span>

        <div className="public-asset-grid">
          <div className="public-detail-item">
            <span className="public-detail-label">Type</span>
            <span className="public-detail-value">{asset.type}</span>
          </div>
          <div className="public-detail-item">
            <span className="public-detail-label">Brand</span>
            <span className="public-detail-value">{asset.brand}</span>
          </div>
          <div className="public-detail-item">
            <span className="public-detail-label">Model</span>
            <span className="public-detail-value">{asset.model}</span>
          </div>
          <div className="public-detail-item">
            <span className="public-detail-label">Serial Number</span>
            <span className="public-detail-value mono">
              {asset.serialNumber}
            </span>
          </div>
          <div className="public-detail-item">
            <span className="public-detail-label">Condition</span>
            <span className="public-detail-value">{asset.condition}</span>
          </div>
          <div className="public-detail-item">
            <span className="public-detail-label">Department</span>
            <span className="public-detail-value">
              {asset.department || "—"}
            </span>
          </div>
          <div className="public-detail-item">
            <span className="public-detail-label">Assigned To</span>
            <span className="public-detail-value">
              {asset.assignedTo || "—"}
            </span>
          </div>
        </div>

        {(asset.hasMouse || asset.hasKeyboard || asset.hasMonitor) && (
          <div className="public-accessories">
            <span className="public-detail-label">Accessories</span>
            <div className="public-accessory-pills">
              {asset.hasMouse && <span className="public-pill">Mouse</span>}
              {asset.hasKeyboard && (
                <span className="public-pill">Keyboard</span>
              )}
              {asset.hasMonitor && <span className="public-pill">Monitor</span>}
            </div>
          </div>
        )}
        {asset.history.length > 0 && (
          <div className="public-history">
            <span className="public-detail-label">
              Repair / Replacement History
            </span>
            <div className="public-history-list">
              {asset.history.map((h, i) => (
                <div key={i} className="public-history-entry">
                  <div className="public-history-top">
                    <span className="public-history-part">
                      {h.partComponent}
                    </span>
                    <span className="public-history-date">
                      {new Date(h.dateOfReplacement).toLocaleDateString()}
                    </span>
                  </div>
                  {h.notes && <p className="public-history-notes">{h.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="public-footer-note">
          Found this device unattended or need to report an issue? Contact the
          IT department and reference the Asset ID above.
        </p>
      </div>
    </div>
  );
}
