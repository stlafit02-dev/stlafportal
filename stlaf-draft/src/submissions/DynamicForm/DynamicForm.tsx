import { useForm } from "react-hook-form";
import type { FormSchema, FormValues } from "../../types/formSchema";
import { buildResolver } from "./validation";
import { visibleFields } from "./conditionalLogic";
import { TextField } from "./fields/TextField";
import { TextAreaField } from "./fields/TextAreaField";
import { SelectField } from "./fields/SelectField";
import { RadioGroupField } from "./fields/RadioGroupField";
import { CheckboxField } from "./fields/CheckboxField";
import { MultiSelectField } from "./fields/MultiSelectField";
import { ListField } from "./fields/ListField";
import type { FieldType } from "../../types/formSchema";
import "./DynamicForm.css";

// These render as multi-row/multi-option controls, so they get the full row width instead
// of sharing a row with another field.
const WIDE_FIELD_TYPES = new Set<FieldType>(["textarea", "radio", "checkbox", "multiselect", "list"]);

// list fields keep a trailing/blank row for editing convenience — strip it before
// the value ever leaves the form (validation, then the submitted payload).
function sanitizeListValues(schema: FormSchema, values: FormValues): FormValues {
  const sanitized = { ...values };
  for (const field of schema.fields) {
    if (field.type !== "list") continue;
    const raw = sanitized[field.key];
    if (Array.isArray(raw)) {
      sanitized[field.key] = raw.filter((item) => typeof item === "string" && item.trim() !== "");
    }
  }
  return sanitized;
}

interface DynamicFormProps {
  schema: FormSchema;
  onSubmit: (values: FormValues) => Promise<void>;
  submitLabel?: string;
  // Re-populates the form when the client comes back to edit a prior submission's answers
  // (DynamicForm remounts fresh each time the wizard step returns to "form", so this only
  // needs to be honored at construction — no reset() plumbing required).
  defaultValues?: FormValues;
}

export function DynamicForm({ schema, onSubmit, submitLabel = "Submit", defaultValues }: DynamicFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: buildResolver(schema.fields),
    defaultValues,
  });

  const currentValues = watch();
  const fieldsToRender = visibleFields(schema.fields, currentValues);

  return (
    <form
      className="dynamic-form"
      onSubmit={handleSubmit((values) => onSubmit(sanitizeListValues(schema, values)))}
      noValidate
    >
      <div className="dynamic-form-grid">
        {fieldsToRender.map((field) => {
          const error = errors[field.key]?.message as string | undefined;
          const props = { field, register, control, error };

          let content;
          switch (field.type) {
            case "textarea":
              content = <TextAreaField {...props} />;
              break;
            case "select":
              content = <SelectField {...props} />;
              break;
            case "radio":
              content = <RadioGroupField {...props} />;
              break;
            case "checkbox":
              content = <CheckboxField {...props} />;
              break;
            case "multiselect":
              content = <MultiSelectField {...props} />;
              break;
            case "list":
              content = <ListField {...props} />;
              break;
            default:
              content = <TextField {...props} />;
          }

          return (
            <div key={field.key} className={WIDE_FIELD_TYPES.has(field.type) ? "df-cell df-cell-wide" : "df-cell"}>
              {content}
            </div>
          );
        })}
      </div>

      <button type="submit" className="dynamic-form-submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : submitLabel}
      </button>
    </form>
  );
}
