import { useEffect, useState } from "react";
import { fetchLatestFormSchema, saveFormSchema } from "./clientPortalAdminApi";
import type { FieldDefinition, FieldType } from "./types";

const FIELD_TYPES: FieldType[] = [
  "text", "textarea", "number", "email", "date", "select", "radio", "checkbox", "multiselect",
];
const OPTION_TYPES: FieldType[] = ["select", "radio", "multiselect"];

interface EditableField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  optionsText: string;
  helpText: string;
}

function toEditable(field: FieldDefinition): EditableField {
  return {
    key: field.key,
    label: field.label,
    type: field.type,
    required: field.required,
    optionsText: (field.options ?? []).map((o) => `${o.value}:${o.label}`).join(", "),
    helpText: field.helpText ?? "",
  };
}

function parseOptions(text: string) {
  return text.split(",").map((p) => p.trim()).filter(Boolean).map((part) => {
    const [value, label] = part.split(":").map((s) => s.trim());
    return { value: value ?? part, label: label ?? value ?? part };
  });
}

function blankField(): EditableField {
  return { key: "", label: "", type: "text", required: false, optionsText: "", helpText: "" };
}

interface FormSchemaEditorProps {
  serviceId: string;
  onSaved?: (fields: FieldDefinition[]) => void;
  // Bumped by TemplateUpload after it auto-generates a schema from a template, so this
  // editor re-fetches and shows the generated fields instead of going stale.
  refreshKey?: number;
}

export function FormSchemaEditor({ serviceId, onSaved, refreshKey }: FormSchemaEditorProps) {
  const [fields, setFields] = useState<EditableField[]>([]);
  const [version, setVersion] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchLatestFormSchema(serviceId).then((schema) => {
      if (schema) {
        setVersion(schema.version);
        setFields(schema.fields.map(toEditable));
        onSaved?.(schema.fields);
      } else {
        setVersion(null);
        setFields([]);
        onSaved?.([]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, refreshKey]);

  function updateField(index: number, patch: Partial<EditableField>) {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const definitions: FieldDefinition[] = fields.map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        required: f.required,
        helpText: f.helpText || undefined,
        options: OPTION_TYPES.includes(f.type) ? parseOptions(f.optionsText) : undefined,
      }));
      const saved = await saveFormSchema(serviceId, definitions);
      setVersion(saved.version);
      setSuccess(true);
      onSaved?.(saved.fields);
    } catch {
      setError("Could not save the form schema.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div style={{ marginTop: 32 }}>
      <h2 className="gmail-section-title">
        Form fields {version !== null && <span className="page-subtitle">(v{version})</span>}
      </h2>
      <p className="page-subtitle">
        Saving always creates a new version — existing submissions keep referencing the version they
        were filled against.
      </p>

      {fields.map((field, index) => (
        <div key={index} className="editing-badge" style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span className="editing-badge-label">Field {index + 1}</span>
            <button type="button" className="gmail-cancel-btn" style={{ padding: "4px 10px" }} onClick={() => removeField(index)}>
              Remove
            </button>
          </div>
          <div className="gmail-grid">
            <div className="gmail-field">
              <label className="gmail-label">Key</label>
              <input className="gmail-input" value={field.key} onChange={(e) => updateField(index, { key: e.target.value })} />
            </div>
            <div className="gmail-field">
              <label className="gmail-label">Label</label>
              <input className="gmail-input" value={field.label} onChange={(e) => updateField(index, { label: e.target.value })} />
            </div>
            <div className="gmail-field">
              <label className="gmail-label">Type</label>
              <select
                className="gmail-input"
                value={field.type}
                onChange={(e) => updateField(index, { type: e.target.value as FieldType })}
              >
                {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {OPTION_TYPES.includes(field.type) && (
              <div className="gmail-field">
                <label className="gmail-label">Options (value:label, ...)</label>
                <input className="gmail-input" value={field.optionsText} onChange={(e) => updateField(index, { optionsText: e.target.value })} />
              </div>
            )}
            <div className="gmail-field">
              <label className="gmail-label">Help text</label>
              <input className="gmail-input" value={field.helpText} onChange={(e) => updateField(index, { helpText: e.target.value })} />
            </div>
          </div>
          <label className="gmail-checkbox-label" style={{ marginTop: 10 }}>
            <input type="checkbox" checked={field.required} onChange={(e) => updateField(index, { required: e.target.checked })} />
            Required
          </label>
        </div>
      ))}

      <button
        type="button"
        className="gmail-secondary-btn"
        style={{ marginTop: 16 }}
        onClick={() => setFields((prev) => [...prev, blankField()])}
      >
        + Add field
      </button>

      {error && <p className="gmail-error">{error}</p>}
      {success && <p style={{ color: "#4fcb84", fontSize: 13 }}>Saved.</p>}

      <div style={{ marginTop: 16 }}>
        <button type="button" className="gmail-submit-btn" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save as new version"}
        </button>
      </div>
    </div>
  );
}
