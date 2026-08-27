import type { Resolver, FieldErrors } from "react-hook-form";
import type { FieldDefinition, FormValues } from "../../types/formSchema";
import { visibleFields } from "./conditionalLogic";

function validateField(field: FieldDefinition, value: unknown): string | null {
  const isEmpty =
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0);

  if (field.required && isEmpty) {
    return `${field.label} is required`;
  }

  if (isEmpty) return null;

  const rules = field.validation;
  if (!rules) return null;

  if (typeof value === "string") {
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      return `${field.label} must be at least ${rules.minLength} characters`;
    }
    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      return `${field.label} must be at most ${rules.maxLength} characters`;
    }
    if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
      return rules.patternMessage ?? `${field.label} is not valid`;
    }
  }

  if (typeof value === "number") {
    if (rules.min !== undefined && value < rules.min) {
      return `${field.label} must be at least ${rules.min}`;
    }
    if (rules.max !== undefined && value > rules.max) {
      return `${field.label} must be at most ${rules.max}`;
    }
  }

  return null;
}

export function buildResolver(fields: FieldDefinition[]): Resolver<FormValues> {
  return (values) => {
    const errors: FieldErrors<FormValues> = {};
    for (const field of visibleFields(fields, values)) {
      const message = validateField(field, values[field.key]);
      if (message) {
        errors[field.key] = { type: "validate", message };
      }
    }
    return Object.keys(errors).length > 0 ? { values: {}, errors } : { values, errors: {} };
  };
}
