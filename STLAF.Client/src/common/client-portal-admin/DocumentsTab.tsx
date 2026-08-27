import { useEffect, useState } from "react";
import { deleteGeneratedDocument, fetchAllGeneratedDocuments } from "./clientPortalAdminApi";
import type { AdminGeneratedDocument } from "./types";
import { Spinner } from "../components/Loader/Loader";
import { ConfirmDialog } from "../components/ConfirmDialog/ConfirmDialog";
import "../../departments/it/gmail/GmailManagementPage.css";
import "../../departments/it/gmail/GmailForms.css";

export function DocumentsTab() {
  const [documents, setDocuments] = useState<AdminGeneratedDocument[] | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminGeneratedDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function reload() {
    fetchAllGeneratedDocuments().then(setDocuments);
  }

  useEffect(reload, []);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    const success = await deleteGeneratedDocument(pendingDelete.id);
    setIsDeleting(false);
    if (!success) {
      setDeleteError("Could not delete this document.");
      return;
    }
    setPendingDelete(null);
    reload();
  }

  return (
    <div className="gmail-page">
      <div className="gmail-page-header">
        <div>
          <h2 className="gmail-section-title" style={{ marginBottom: 4 }}>Generated documents</h2>
          <p className="page-subtitle">Every document clients have generated, across all services.</p>
        </div>
      </div>

      {!documents ? (
        <div className="gmail-page-loading"><Spinner size="lg" /></div>
      ) : documents.length === 0 ? (
        <p className="empty-state">No documents have been generated yet.</p>
      ) : (
        <div className="gmail-table-wrap" style={{ height: "auto" }}>
          <table className="gmail-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Service</th>
                <th>Generated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    {doc.clientFullName}
                    <div className="page-subtitle" style={{ margin: 0 }}>{doc.clientEmail}</div>
                  </td>
                  <td>{doc.serviceName}</td>
                  <td>{new Date(doc.generatedAt).toLocaleString()}</td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <a className="gmail-secondary-btn" href={doc.downloadUrl} target="_blank" rel="noreferrer">
                      Download
                    </a>
                    <button
                      className="gmail-cancel-btn"
                      onClick={() => {
                        setDeleteError(null);
                        setPendingDelete(doc);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Delete document"
        message={
          pendingDelete
            ? `Delete the document generated for ${pendingDelete.clientFullName} (${pendingDelete.serviceName})? ` +
              `This permanently removes the file and the client's underlying submission record, and can't be undone.`
            : ""
        }
        confirmLabel={isDeleting ? "Deleting…" : "Delete"}
        danger
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
      {deleteError && <p className="gmail-error" style={{ marginTop: 12 }}>{deleteError}</p>}
    </div>
  );
}
