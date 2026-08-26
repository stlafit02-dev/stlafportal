import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { detectDocxTemplateFields } from "./clientPortalAdminApi";
import type { FieldDefinition, TemplateFieldConfig } from "./types";
import "./TemplateFieldMatcher.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

interface TemplateFieldMatcherProps {
  file: File;
  fields: FieldDefinition[];
  fieldConfig: TemplateFieldConfig[];
  onChange: (config: TemplateFieldConfig[]) => void;
}

function isDocx(file: File): boolean {
  return (
    file.name.toLowerCase().endsWith(".docx") ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

function describeDetectionError(err: unknown): string {
  if (isAxiosError(err)) {
    if (!err.response) return "Could not reach the server to scan this document. Check your connection and that the API is running.";
    const status = err.response.status;
    const serverMessage = err.response.data?.message as string | undefined;
    if (status === 401 || status === 403) return "You don't have permission to scan document templates.";
    if (status === 404) return "The document-scanning endpoint isn't available on the server yet — it may need to be restarted with the latest backend code.";
    return serverMessage ?? `Could not read this Word document (server returned ${status}).`;
  }
  return "Could not read this Word document.";
}

// Reads the template's own field names — a PDF's AcroForm field names (via pdf.js, no
// page rendering needed) or a Word doc's {{field_key}} placeholders (via a backend scan,
// since browsers can't easily parse .docx XML) — and lets the admin mark which of them
// should stay blank for free-plan clients. There's no coordinate picking anymore — the
// template's own layout/fonts/alignment are used as-is.
export function TemplateFieldMatcher({ file, fields, fieldConfig, onChange }: TemplateFieldMatcherProps) {
  const [detectedNames, setDetectedNames] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDocx(file)) {
      detectDocxTemplateFields(file).then(
        (names) => {
          setDetectedNames(names);
          setError(names.length === 0 ? "No {{field_key}} placeholders were found in this document." : null);
        },
        (err) => setError(describeDetectionError(err)),
      );
      return;
    }

    file.arrayBuffer().then((buffer) => {
      pdfjsLib.getDocument({ data: buffer }).promise.then(
        async (doc) => {
          const fieldObjects = await doc.getFieldObjects();
          const names = fieldObjects ? Object.keys(fieldObjects) : [];
          setDetectedNames(names);
          setError(names.length === 0 ? "No fillable form fields were found in this PDF." : null);
        },
        () => setError("Could not read this PDF."),
      );
    });
  }, [file]);

  function toggleBlur(fieldKey: string, blurOnFree: boolean) {
    const existing = fieldConfig.find((f) => f.fieldKey === fieldKey);
    if (existing) {
      onChange(fieldConfig.map((f) => (f.fieldKey === fieldKey ? { ...f, blurOnFree } : f)));
    } else {
      onChange([...fieldConfig, { fieldKey, blurOnFree }]);
    }
  }

  if (error) {
    return <p className="gmail-error">{error}</p>;
  }

  if (!detectedNames) {
    return <p className="page-subtitle">Reading template fields…</p>;
  }

  const formKeys = new Set(fields.map((f) => f.key));
  const unmatchedFormFields = fields.filter((f) => !detectedNames.includes(f.key));

  return (
    <div className="tfm-container">
      <table className="gmail-table" style={{ height: "auto" }}>
        <thead>
          <tr>
            <th>Detected field</th>
            <th>Matches a form field?</th>
            <th>Blur on free plan</th>
          </tr>
        </thead>
        <tbody>
          {detectedNames.map((name) => {
            const matched = formKeys.has(name);
            const entry = fieldConfig.find((f) => f.fieldKey === name);
            return (
              <tr key={name}>
                <td className="mono-cell">{name}</td>
                <td>
                  <span className={`status-badge ${matched ? "badge-active" : "badge-inactive"}`}>
                    {matched ? "✓ matched" : "⚠ no match"}
                  </span>
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={entry?.blurOnFree ?? false}
                    disabled={!matched}
                    onChange={(e) => toggleBlur(name, e.target.checked)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {unmatchedFormFields.length > 0 && (
        <p className="tfm-warning">
          These form fields have no matching template field, so they won't be filled in:{" "}
          {unmatchedFormFields.map((f) => f.key).join(", ")}.{" "}
          {isDocx(file)
            ? "Add a matching {{field_key}} placeholder in the Word document, then re-upload."
            : "Rename the corresponding fields in the PDF to match exactly, then re-upload."}
        </p>
      )}
    </div>
  );
}
