import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Modal } from "../../../common/components/Modal/Modal";
import type { Asset } from "./assetApi";
import "./QRCodeModal.css";

interface QRCodeModalProps {
  asset: Asset | null;
  onClose: () => void;
}

export function QRCodeModal({ asset, onClose }: QRCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!asset) return;
    QRCode.toDataURL(asset.qr, { width: 220, margin: 1 }).then(setQrDataUrl);
  }, [asset]);

  if (!asset) return null;

  return (
    <Modal isOpen={!!asset} onClose={onClose}>
      <div className="qr-view-modal">
        <span className="qr-view-label">QR Code</span>
        <h2 className="qr-view-name">{asset.deviceName}</h2>

        <div className="qr-view-frame">
          {qrDataUrl && <img src={qrDataUrl} alt={"QR code for " + asset.assetTag} />}
        </div>

        <span className="qr-view-tag">{asset.assetTag}</span>

        {/* {qrDataUrl && (
          <a>
            href={qrDataUrl}
            download={asset.assetTag + ".png"}
            className="qr-view-download"
          
            Download QR
          </a>
        )} */}
      </div>
    </Modal>
  );
}