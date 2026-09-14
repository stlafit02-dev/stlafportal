import { useEffect, useState } from "react";
import { fetchServices } from "../services-catalog/servicesApi";
import { fetchLatestFormSchema, previewSubmission, createSubmission } from "../submissions/submissionsApi";
import { fetchMyDocuments, downloadDocument, triggerDownload } from "../dashboard/documentsApi";
import { DynamicForm } from "../submissions/DynamicForm/DynamicForm";
import { DraftPreview } from "../submissions/DraftPreview";
import { SubscriptionStatusBadge } from "../subscription/SubscriptionStatusBadge";
import { PageLoader } from "../common/components/Loader/Loader";
import type { Service, MyDocument } from "../types/domain";
import type { FormSchema, FormValues } from "../types/formSchema";
import "./PortalWizardPage.css";

type Step = "select" | "form" | "draft" | "done";

const STEP_LABELS: { key: Step; label: string }[] = [
  { key: "select", label: "Select service" },
  { key: "form", label: "Fill form" },
  { key: "draft", label: "Preview" },
  { key: "done", label: "Download" },
];

function stepIndex(step: Step): number {
  return STEP_LABELS.findIndex((s) => s.key === step);
}

export function PortalWizardPage() {
  const [step, setStep] = useState<Step>("select");
  const [services, setServices] = useState<Service[] | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [schema, setSchema] = useState<FormSchema | null | undefined>(undefined);
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<MyDocument[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  function loadRecentDocuments() {
    fetchMyDocuments()
      .then(setRecentDocuments)
      .catch(() => setRecentDocuments([]));
  }

  useEffect(() => {
    fetchServices()
      .then(setServices)
      .catch(() => setServices([]));
    loadRecentDocuments();
  }, []);

  function setPreview(blob: Blob | null) {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return blob ? URL.createObjectURL(blob) : null;
    });
    setPreviewBlob(blob);
  }

  async function selectService(service: Service) {
    setSelectedService(service);
    setError(null);
    setSchema(undefined);
    setFormValues(null);
    setStep("form");
    const result = await fetchLatestFormSchema(service.id).catch(() => null);
    setSchema(result);
  }

  async function handleFormSubmit(values: FormValues) {
    setError(null);
    setFormValues(values);
    setStep("draft");
  }

  async function handleGeneratePreview() {
    if (!selectedService || !formValues) return;
    setError(null);
    setIsPreviewing(true);
    setHasSaved(false);

    try {
      const blob = await previewSubmission(selectedService.id, formValues);
      setPreview(blob);
      setStep("done");
    } catch {
      setError("Could not render a preview of this document. Please try again.");
    } finally {
      setIsPreviewing(false);
    }
  }

  async function handleDownloadPreview() {
    if (!previewBlob) return;
    triggerDownload(previewBlob, `${selectedService?.name ?? "document"}.pdf`.replace(/\s+/g, "-").toLowerCase());

    if (hasSaved || !selectedService || !schema || !formValues) return;
    try {
      await createSubmission(selectedService.id, schema.version, formValues);
      setHasSaved(true);
      loadRecentDocuments();
    } catch {
      setError("Your document downloaded, but we couldn't save this request to your account. You can try downloading again.");
    }
  }

  function startOver() {
    setStep("select");
    setSelectedService(null);
    setSchema(undefined);
    setFormValues(null);
    setPreview(null);
    setHasSaved(false);
    setError(null);
    loadRecentDocuments();
  }

  function editAnswers() {
    setStep("form");
    setPreview(null);
    setHasSaved(false);
    setError(null);
  }

  async function handleDownload(doc: MyDocument) {
    setIsDownloading(doc.id);
    try {
      const blob = await downloadDocument(doc.downloadUrl);
      triggerDownload(blob, `document-${doc.submissionId}.pdf`);
    } catch {
      setError("Could not download this document.");
    } finally {
      setIsDownloading(null);
    }
  }

  return (
    <div>
      <h1 className="page-title">Request a document</h1>
      <p className="page-subtitle">Select a service, fill out its form, and download your document.</p>

      <div className="wizard-steps">
        {STEP_LABELS.map((s, index) => (
          <div key={s.key} className={`wizard-step ${index <= stepIndex(step) ? "wizard-step-active" : ""}`}>
            <span className="wizard-step-number">{index + 1}</span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {step === "select" && (
        <>
          <SubscriptionStatusBadge />

          {!services ? (
            <PageLoader label="Loading services…" />
          ) : services.length === 0 ? (
            <p className="empty-state">No services are available right now.</p>
          ) : (
            <div className="services-grid">
              {services.map((service) => (
                <button key={service.id} className="service-card" onClick={() => selectService(service)}>
                  <span className="service-category">{service.category ?? "General"}</span>
                  <h2 className="service-name">{service.name}</h2>
                  {service.description && <p className="service-description">{service.description}</p>}
                </button>
              ))}
            </div>
          )}

          {recentDocuments && recentDocuments.length > 0 && (
            <div className="recent-documents">
              <h2 className="wizard-section-title">Your recent documents</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Generated</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentDocuments.map((doc) => (
                    <tr key={doc.id}>
                      <td>{new Date(doc.generatedAt).toLocaleString()}</td>
                      <td>
                        <button
                          className="table-action-btn"
                          onClick={() => handleDownload(doc)}
                          disabled={isDownloading === doc.id}
                        >
                          {isDownloading === doc.id ? "Downloading…" : "Download"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {step === "form" && selectedService && (
        <div>
          <button className="wizard-back-btn wizard-back-btn-top" onClick={startOver}>
            ← Choose a different service
          </button>

          <h2 className="wizard-section-title">{selectedService.name}</h2>
          {selectedService.description && <p className="page-subtitle">{selectedService.description}</p>}

          <div className="form-card">
            {schema === undefined && <PageLoader label="Loading form…" />}
            {schema === null && (
              <p className="empty-state">This service doesn't have a form configured yet.</p>
            )}
            {schema && (
              <DynamicForm
                schema={schema}
                onSubmit={handleFormSubmit}
                submitLabel="Review answers"
                defaultValues={formValues ?? undefined}
              />
            )}

            {error && <p className="form-error">{error}</p>}
          </div>
        </div>
      )}

      {step === "draft" && selectedService && (
        <div>
          <h2 className="wizard-section-title">{selectedService.name}</h2>
          <p className="page-subtitle">
            Here's what you entered. Nothing is saved yet — generate a preview of the actual document, then
            download it when you're ready.
          </p>

          <div className="form-card">
            {schema && <DraftPreview schema={schema} values={formValues ?? {}} />}
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="wizard-done-actions" style={{ marginTop: 20 }}>
            <button className="wizard-cta-primary" onClick={handleGeneratePreview} disabled={isPreviewing}>
              {isPreviewing ? "Rendering…" : "Generate PDF preview"}
            </button>
          </div>

          <button className="wizard-back-btn" onClick={editAnswers}>
            ← Edit answers
          </button>
        </div>
      )}

      {step === "done" && selectedService && previewUrl && (
        <div className="wizard-done">
          <p className="wizard-done-message">
            {hasSaved
              ? "Saved to your account. You can download it again below."
              : "This is the actual document — nothing is saved yet. Download it to save this request."}
          </p>

          <iframe src={previewUrl} className="pdf-preview-frame" title="Document preview" />

          {error && <p className="form-error">{error}</p>}

          <div className="wizard-done-actions">
            <button className="wizard-cta-primary" onClick={handleDownloadPreview}>
              Download document
            </button>
            <button className="wizard-secondary-btn" onClick={editAnswers}>
              ← Edit answers
            </button>
          </div>
          <button className="wizard-back-btn" onClick={startOver}>
            Start another request
          </button>
        </div>
      )}
    </div>
  );
}
