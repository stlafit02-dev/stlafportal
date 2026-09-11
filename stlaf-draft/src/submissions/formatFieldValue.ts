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

export function formatFieldValue(field: FieldDefinition, value: unknown): string {
  if (isFieldValueEmpty(value)) return "";

  if (field.type === "checkbox") return value ? "Yes" : "No";

  if (field.type === "list" && Array.isArray(value)) {
    const items = value.filter((v): v is string => typeof v === "string" && v.trim() !== "");
    return items.map((item, i) => `${i + 1}. ${item}`).join("\n");
  }

  if (field.type === "multiselect" && Array.isArray(value)) {
    const items = value.filter((v): v is string => typeof v === "string" && v.trim() !== "");
    return items.map((item, i) => `${i + 1}. ${optionLabel(field, item)}`).join("\n");
  }

  if ((field.type === "select" || field.type === "radio") && typeof value === "string") {
    return optionLabel(field, value);
  }

  return String(value);
}
