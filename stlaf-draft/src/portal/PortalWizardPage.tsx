import { useEffect, useState } from "react";
import { fetchServices } from "../services-catalog/servicesApi";
import { fetchLatestFormSchema, createSubmission, fetchSubmission, retryGeneration } from "../submissions/submissionsApi";
import { fetchMyDocuments, fetchDocumentForSubmission, downloadDocument, triggerDownload } from "../dashboard/documentsApi";
import { DynamicForm } from "../submissions/DynamicForm/DynamicForm";
import { DraftPreview } from "../submissions/DraftPreview";
import { SubscriptionStatusBadge } from "../subscription/SubscriptionStatusBadge";
import { Spinner, PageLoader } from "../common/components/Loader/Loader";
import type { Service, Submission, MyDocument } from "../types/domain";
import type { FormSchema, FormValues } from "../types/formSchema";
import "./PortalWizardPage.css";

type Step = "select" | "form" | "draft" | "done" | "failed";

const STEP_LABELS: { key: Step; label: string }[] = [
  { key: "select", label: "Select service" },
  { key: "form", label: "Fill form" },
  { key: "draft", label: "Preview" },
  { key: "done", label: "Download" },
];

const POLL_INTERVAL_MS = 1800;

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
  const [formValues, setFormValues] = useState<FormValues | null>(null);
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

  // The real document renders in the background (docx templates go through a slow
  // LibreOffice conversion server-side) — while on the "draft" step, poll until it's ready
  // or generation fails, instead of blocking the whole UI on one long request.
  useEffect(() => {
    if (step !== "draft" || !submission) return;

    let cancelled = false;
    let timeoutId: number;

    async function poll() {
      try {
        const latest = await fetchSubmission(submission!.id);
        if (cancelled) return;

        if (latest.status === "completed") {
          const doc = await fetchDocumentForSubmission(latest.id);
          if (cancelled) return;
          if (doc) {
            setDocument(doc);
            setStep("done");
            return;
          }
        } else if (latest.status === "failed") {
          setStep("failed");
          return;
        }
      } catch {
        // transient network hiccup — keep polling
      }

      if (!cancelled) timeoutId = window.setTimeout(poll, POLL_INTERVAL_MS);
    }

    timeoutId = window.setTimeout(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [step, submission]);

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
    if (!selectedService || !schema) return;
    setError(null);
    setFormValues(values);

    try {
      const created = await createSubmission(selectedService.id, schema.version, values);
      setDocument(null);
      setSubmission(created);
      setStep("draft");
    } catch {
      setError("Could not submit your request. Please try again.");
      setStep("form");
    }
  }

  async function handleRetry() {
    if (!submission) return;
    try {
      await retryGeneration(submission.id);
      setDocument(null);
      setStep("draft");
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
    setFormValues(null);
    setError(null);
    loadRecentDocuments();
  }

  // Keeps the selected service/schema and the answers already typed in, so the client can
  // tweak them against the document they just previewed instead of starting from scratch.
  function editAnswers() {
    setStep("form");
    setSubmission(null);
    setDocument(null);
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
                submitLabel="Generate PDF"
                defaultValues={formValues ?? undefined}
              />
            )}

            {error && <p className="form-error">{error}</p>}
          </div>
        </div>
      )}

      {step === "draft" && selectedService && (
        <div>
          <div className="wizard-draft-header">
            <h2 className="wizard-section-title">{selectedService.name}</h2>
            <span className="wizard-draft-status">
              <Spinner size="sm" /> Preparing your document…
            </span>
          </div>
          <p className="page-subtitle">
            Here's what you entered. The formatted document will appear automatically when it's ready.
          </p>

          <div className="form-card">
            {schema && <DraftPreview schema={schema} values={formValues ?? {}} />}
          </div>

          <button className="wizard-back-btn" onClick={editAnswers}>
            ← Edit answers
          </button>
        </div>
      )}

      {step === "done" && document && (
        <div className="wizard-done">
          <p className="wizard-done-message">Your request has been saved, and your document is ready. Review it below before downloading.</p>

          <iframe src={document.downloadUrl} className="pdf-preview-frame" title="Document preview" />

          <div className="wizard-done-actions">
            <button className="wizard-cta-primary" onClick={() => handleDownload(document)} disabled={!!isDownloading}>
              {isDownloading ? "Downloading…" : "Download document"}
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

      {step === "failed" && (
        <div className="wizard-done">
          <p className="form-error">
            Your request was saved, but document generation hasn't finished yet. You can retry now.
          </p>
          <div className="wizard-done-actions">
            <button className="wizard-cta-primary" onClick={handleRetry}>
              Retry generation
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
