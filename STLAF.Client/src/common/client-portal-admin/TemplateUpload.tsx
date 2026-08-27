import { Suspense, lazy, useEffect, useState } from "react";
import { fetchDocumentTemplate, saveFormSchema, uploadDocumentTemplate } from "./clientPortalAdminApi";
import type { DocumentTemplate, TemplateFieldConfig, FieldDefinition } from "./types";

const TemplateFieldMatcher = lazy(() =>
  import("./TemplateFieldMatcher").then((m) => ({ default: m.TemplateFieldMatcher })),
);


function humanizeKey(key: string): string {
  return key
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface TemplateUploadProps {
  serviceId: string;
  fields: FieldDefinition[];
  onFieldsGenerated?: (fields: FieldDefinition[]) => void;
}

export function TemplateUpload({ serviceId, fields, onFieldsGenerated }: TemplateUploadProps) {
  const [current, setCurrent] = useState<DocumentTemplate | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fieldConfig, setFieldConfig] = useState<TemplateFieldConfig[]>([]);
  const [detectedNames, setDetectedNames] = useState<string[]>([]);
  const [showRawJson, setShowRawJson] = useState(false);
  const [rawJsonText, setRawJsonText] = useState("");
  const [rawJsonError, setRawJsonError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState(false);

  useEffect(() => {
    fetchDocumentTemplate(serviceId).then((template) => {
      if (template) {
        setCurrent(template);
        setFieldConfig(template.fieldConfig);
      }
    });
  }, [serviceId]);

  function applyRawJson() {
    try {
      const parsed = JSON.parse(rawJsonText);
      setFieldConfig(parsed);
      setRawJsonError(null);
      setShowRawJson(false);
    } catch {
      setRawJsonError("Not valid JSON.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!file) {
      setError("Choose a PDF or Word (.docx) template file.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = await uploadDocumentTemplate(serviceId, file, fieldConfig);
      setCurrent(saved);
      setSuccess(true);
    } catch {
      setError("Could not upload the template.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleGenerateFields() {
    setGenerateError(null);
    setGenerateSuccess(false);
    setIsGenerating(true);
    try {
      const definitions: FieldDefinition[] = detectedNames.map((key) => ({
        key,
        label: humanizeKey(key),
        type: "text",
        required: false,
      }));
      const saved = await saveFormSchema(serviceId, definitions);
      onFieldsGenerated?.(saved.fields);
      setGenerateSuccess(true);
    } catch {
      setGenerateError("Could not generate form fields from this template.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div style={{ marginTop: 32 }}>
      <h2 className="gmail-section-title">Document template</h2>
      <p className="page-subtitle">
        {current ? `Current template key: ${current.templateFileKey.split("/").pop()}` : "No template uploaded yet."}
        {" "}Upload either a real fillable PDF form (field names matching your form field Keys), or a Word .docx
        with {"{{field_key}}"} placeholders typed directly in the document text.
      </p>
      {fields.length === 0 && (
        <p className="page-subtitle">
          No form fields yet — pick a template below, then click "Generate form fields" to create them
          automatically from its detected field names, instead of adding each one by hand.
        </p>
      )}

      <form className="gmail-form" onSubmit={handleSubmit}>
        <div className="gmail-field" style={{ maxWidth: 520 }}>
          <label className="gmail-label">Template file (PDF or Word .docx)</label>
          <input
            type="file"
            accept="application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => {
              const selected = e.target.files?.[0] ?? null;
              setFile(selected);
              setDetectedNames([]);
              setGenerateError(null);
              setGenerateSuccess(false);
              if (selected && current === null) setFieldConfig([]);
            }}
          />
        </div>

        {file && (
          <Suspense fallback={<p className="page-subtitle">Reading template fields…</p>}>
            <TemplateFieldMatcher
              file={file}
              fields={fields}
              fieldConfig={fieldConfig}
              onChange={setFieldConfig}
              onDetected={setDetectedNames}
            />
          </Suspense>
        )}

        {file && detectedNames.length > 0 && (
          <div className="gmail-field" style={{ maxWidth: 520 }}>
            <button type="button" className="gmail-secondary-btn" onClick={handleGenerateFields} disabled={isGenerating}>
              {isGenerating
                ? "Generating…"
                : fields.length > 0
                  ? "Regenerate form fields from this template"
                  : "Generate form fields from this template"}
            </button>
            {fields.length > 0 && (
              <p className="tfm-warning" style={{ marginTop: 6 }}>
                This replaces the current form fields with ones generated from this template's {detectedNames.length}{" "}
                detected field{detectedNames.length === 1 ? "" : "s"}. Any manual labels, types, or options you've
                set will be lost.
              </p>
            )}
            {generateError && <p className="gmail-error">{generateError}</p>}
            {generateSuccess && <p style={{ color: "#4fcb84", fontSize: 13 }}>Form fields generated.</p>}
          </div>
        )}

        <div>
          <button
            type="button"
            className="gmail-secondary-btn"
            onClick={() => {
              setRawJsonText(JSON.stringify(fieldConfig, null, 2));
              setShowRawJson((v) => !v);
            }}
          >
            {showRawJson ? "Hide raw JSON" : "Edit as raw JSON"}
          </button>
        </div>

        {showRawJson && (
          <div className="gmail-field" style={{ maxWidth: 520 }}>
            <label className="gmail-label">Field config JSON ({"[{ fieldKey, blurOnFree }]"})</label>
            <textarea
              className="gmail-input gmail-textarea"
              rows={8}
              value={rawJsonText}
              onChange={(e) => setRawJsonText(e.target.value)}
              style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12 }}
            />
            {rawJsonError && <p className="gmail-error">{rawJsonError}</p>}
            <button type="button" className="gmail-secondary-btn" style={{ marginTop: 8, alignSelf: "flex-start" }} onClick={applyRawJson}>
              Apply JSON
            </button>
          </div>
        )}

        {error && <p className="gmail-error">{error}</p>}
        {success && <p style={{ color: "#4fcb84", fontSize: 13 }}>Template uploaded.</p>}

        <div className="gmail-actions" style={{ borderTop: "none", paddingTop: 0, justifyContent: "flex-start" }}>
          <button type="submit" className="gmail-submit-btn" disabled={isSaving}>
            {isSaving ? "Uploading…" : "Upload template"}
          </button>
        </div>
      </form>
    </div>
  );
}
