import type { FieldDefinition, FieldType } from "./types";

const FIELD_TYPES: FieldType[] = [
  "text", "textarea", "number", "email", "date", "select", "radio", "checkbox", "multiselect", "list",
];
const OPTION_TYPES: FieldType[] = ["select", "radio", "multiselect"];

interface EditableField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  optionsText: string;
  helpText: string;
  section: string;
}

function toEditable(field: FieldDefinition): EditableField {
  return {
    key: field.key,
    label: field.label,
    type: field.type,
    required: field.required,
    optionsText: (field.options ?? []).map((o) => `${o.value}:${o.label}`).join(", "),
    helpText: field.helpText ?? "",
    section: field.section ?? "",
  };
}

function parseOptions(text: string) {
  return text.split(",").map((p) => p.trim()).filter(Boolean).map((part) => {
    const [value, label] = part.split(":").map((s) => s.trim());
    return { value: value ?? part, label: label ?? value ?? part };
  });
}

function blankField(): EditableField {
  return { key: "", label: "", type: "text", required: false, optionsText: "", helpText: "", section: "" };
}

function toDefinitions(fields: EditableField[]): FieldDefinition[] {
  return fields.map((f) => ({
    key: f.key,
    label: f.label,
    type: f.type,
    required: f.required,
    helpText: f.helpText || undefined,
    options: OPTION_TYPES.includes(f.type) ? parseOptions(f.optionsText) : undefined,
    section: f.section || undefined,
  }));
}

interface FormSchemaEditorProps {
  fields: FieldDefinition[];
  onChange: (fields: FieldDefinition[]) => void;
}

export function FormSchemaEditor({ fields: definitions, onChange }: FormSchemaEditorProps) {
  const fields = definitions.map(toEditable);

  function updateField(index: number, patch: Partial<EditableField>) {
    onChange(toDefinitions(fields.map((f, i) => (i === index ? { ...f, ...patch } : f))));
  }

  function removeField(index: number) {
    onChange(toDefinitions(fields.filter((_, i) => i !== index)));
  }

  return (
    <div style={{ marginTop: 32 }}>
      <h2 className="gmail-section-title">Form fields</h2>
      <p className="page-subtitle">
        These are saved together with the template below — uploading the template saves both as one unit.
        Give consecutive fields the same Section name to put them on their own page (with Next/Back) on the
        client's form — e.g. "Personal Details" for the first few fields, then "Other Details" for the rest.
        Leave Section blank on every field to keep everything on one page, like before.
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
              <label className="gmail-label">Section</label>
              <input
                className="gmail-input"
                placeholder="(none)"
                value={field.section}
                onChange={(e) => updateField(index, { section: e.target.value })}
              />
            </div>
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
        onClick={() => onChange(toDefinitions([...fields, blankField()]))}
      >
        + Add field
      </button>
    </div>
  );
}
