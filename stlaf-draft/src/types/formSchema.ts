export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "date"
  | "select"
  | "radio"
  | "checkbox"
  | "multiselect";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldValidationRules {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
}

export interface FieldConditionalRule {
  field: string;
  operator: "eq" | "neq" | "in" | "notEmpty";
  value?: string | number | boolean | string[];
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: FieldOption[];
  validation?: FieldValidationRules;
  conditional?: FieldConditionalRule;
  helpText?: string;
  placeholder?: string;
}

export interface FormSchema {
  id: string;
  serviceId: string;
  version: number;
  fields: FieldDefinition[];
}

export type FormValues = Record<string, string | number | boolean | string[] | undefined>;
