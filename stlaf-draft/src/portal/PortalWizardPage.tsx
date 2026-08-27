import { useEffect, useState } from "react";
import { fetchServices } from "../services-catalog/servicesApi";
import { fetchLatestFormSchema, createSubmission, retryGeneration } from "../submissions/submissionsApi";
import { fetchMyDocuments, fetchDocumentForSubmission, downloadDocument, triggerDownload } from "../dashboard/documentsApi";
import { DynamicForm } from "../submissions/DynamicForm/DynamicForm";
import { SubscriptionStatusBadge } from "../subscription/SubscriptionStatusBadge";
import { Spinner, PageLoader } from "../common/components/Loader/Loader";
import type { Service, Submission, MyDocument } from "../types/domain";
import type { FormSchema, FormValues } from "../types/formSchema";
import "./PortalWizardPage.css";

type Step = "select" | "form" | "generating" | "done" | "failed";

const STEP_LABELS: { key: Step; label: string }[] = [
  { key: "select", label: "Select service" },
  { key: "form", label: "Fill form" },
  { key: "generating", label: "Generate PDF" },
  { key: "done", label: "Download" },
];

function stepIndex(step: Step): number {
  if (step === "failed") return 2;
  return STEP_LABELS.findIndex((s) => s.key === step);
}

export function PortalWizardPage() {
  const [step, setStep] = useState<Step>("select");
  const [services, setServices] = useState<Service[] | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [schema, setSchema] = useState<FormSchema | null | undefined>(undefined);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [document, setDocument] = useState<MyDocument | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<MyDocument[] | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  async function selectService(service: Service) {
    setSelectedService(service);
    setError(null);
    setSchema(undefined);
    setStep("form");
    const result = await fetchLatestFormSchema(service.id).catch(() => null);
    setSchema(result);
  }

  async function handleFormSubmit(values: FormValues) {
    if (!selectedService || !schema) return;
    setError(null);
    setStep("generating");

    try {
      const created = await createSubmission(selectedService.id, schema.version, values);
      setSubmission(created);

      if (created.status === "completed") {
        const doc = await fetchDocumentForSubmission(created.id);
        setDocument(doc);
        setStep(doc ? "done" : "failed");
      } else {
        setStep("failed");
      }
    } catch {
      setError("Could not submit your request. Please try again.");
      setStep("form");
    }
  }

  async function handleRetry() {
    if (!submission) return;
    setStep("generating");
    try {
      await retryGeneration(submission.id);
      const doc = await fetchDocumentForSubmission(submission.id);
      setDocument(doc);
      setStep(doc ? "done" : "failed");
    } catch {
      setStep("failed");
    }
  }

  function startOver() {
    setStep("select");
    setSelectedService(null);
    setSchema(undefined);
    setSubmission(null);
    setDocument(null);
    setError(null);
    loadRecentDocuments();
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
          <h2 className="wizard-section-title">{selectedService.name}</h2>
          {selectedService.description && <p className="page-subtitle">{selectedService.description}</p>}

          {schema === undefined && <PageLoader label="Loading form…" />}
          {schema === null && (
            <p className="empty-state">This service doesn't have a form configured yet.</p>
          )}
          {schema && <DynamicForm schema={schema} onSubmit={handleFormSubmit} submitLabel="Generate PDF" />}

          {error && <p className="form-error">{error}</p>}

          <button className="wizard-back-btn" onClick={startOver}>
            ← Choose a different service
          </button>
        </div>
      )}

      {step === "generating" && (
        <div className="wizard-generating">
          <Spinner size="lg" />
          <p className="page-subtitle">Generating your document…</p>
        </div>
      )}

      {step === "done" && document && (
        <div className="wizard-done">
          <p className="wizard-done-message">Your request has been saved, and your document is ready. Review it below before downloading.</p>

          <iframe src={document.downloadUrl} className="pdf-preview-frame" title="Document preview" />

          <button className="landing-cta-primary" onClick={() => handleDownload(document)} disabled={!!isDownloading}>
            {isDownloading ? "Downloading…" : "Download document"}
          </button>
          <button className="wizard-back-btn" onClick={startOver}>
            Start another request
          </button>
        </div>
      )}

      {step === "failed" && (
        <div className="wizard-done">
          <p className="form-error">
            Your request was saved, but document generation hasn't finished yet. You can retry now.
          </p>
          <button className="landing-cta-primary" onClick={handleRetry}>
            Retry generation
          </button>
          <button className="wizard-back-btn" onClick={startOver}>
            Start another request
          </button>
        </div>
      )}
    </div>
  );
}
