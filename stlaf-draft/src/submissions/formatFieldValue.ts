import type { FieldDefinition } from "../types/formSchema";

function optionLabel(field: FieldDefinition, value: string): string {
  return field.options?.find((o) => o.value === value)?.label ?? value;
}

export function isFieldValueEmpty(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.every((v) => typeof v !== "string" || v.trim() === ""))
  );
}

// Renders a field's raw form value as plain text the same way it will appear in the
// generated document — shared by the draft summary, the live docx preview, and the live
// fillable-PDF preview so all three stay in sync with each other and with the backend's own
// "1. ...\n2. ..." numbering (DocxTemplateProcessor.FormatValue).
export function formatFieldValue(field: FieldDefinition, value: unknown): string {
  if (isFieldValueEmpty(value)) return "";

  if (field.type === "checkbox") return value ? "Yes" : "No";

  if (field.type === "list" && Array.isArray(value)) {
    const items = value.filter((v): v is string => typeof v === "string" && v.trim() !== "");
    return items.map((item, i) => `${i + 1}. ${item}`).join("\n");
  }

  if (field.type === "multiselect" && Array.isArray(value)) {
    return value.map((v) => optionLabel(field, String(v))).join(", ");
  }

  if ((field.type === "select" || field.type === "radio") && typeof value === "string") {
    return optionLabel(field, value);
  }

  return String(value);
}
