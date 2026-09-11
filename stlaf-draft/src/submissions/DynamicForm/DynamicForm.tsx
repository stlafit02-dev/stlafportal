import { useState } from "react";
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

const WIDE_FIELD_TYPES = new Set<FieldType>(["textarea", "radio", "checkbox", "multiselect", "list"]);

function groupBySection(fields: FormSchema["fields"]): { section?: string; fields: FormSchema["fields"] }[] {
  const groups: { section?: string; fields: FormSchema["fields"] }[] = [];
  for (const field of fields) {
    const section = field.section?.trim() || undefined;
    const current = groups[groups.length - 1];
    if (current && current.section === section) {
      current.fields.push(field);
    } else {
      groups.push({ section, fields: [field] });
    }
  }
  return groups;
}

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
  defaultValues?: FormValues;
}

export function DynamicForm({ schema, onSubmit, submitLabel = "Submit", defaultValues }: DynamicFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: buildResolver(schema.fields),
    defaultValues,
  });
  const [pageIndex, setPageIndex] = useState(0);

  const currentValues = watch();
  const fieldsToRender = visibleFields(schema.fields, currentValues);
  const groups = groupBySection(fieldsToRender);
  const isPaginated = groups.length > 1;
  const currentPage = Math.min(pageIndex, groups.length - 1);
  const group = groups[currentPage];
  const isLastPage = currentPage === groups.length - 1;

  function renderField(field: (typeof fieldsToRender)[number]) {
    const error = errors[field.key]?.message as string | undefined;
    const props = { field, register, control, error };

    switch (field.type) {
      case "textarea":
        return <TextAreaField {...props} />;
      case "select":
        return <SelectField {...props} />;
      case "radio":
        return <RadioGroupField {...props} />;
      case "checkbox":
        return <CheckboxField {...props} />;
      case "multiselect":
        return <MultiSelectField {...props} />;
      case "list":
        return <ListField {...props} />;
      default:
        return <TextField {...props} />;
    }
  }

  async function goNext() {
    const pageIsValid = await trigger(group.fields.map((f) => f.key));
    if (pageIsValid) setPageIndex(currentPage + 1);
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (isPaginated && !isLastPage) {
      e.preventDefault();
      goNext();
      return;
    }
    return handleSubmit((values) => onSubmit(sanitizeListValues(schema, values)))(e);
  }

  return (
    <form className="dynamic-form" onSubmit={handleFormSubmit} noValidate>
      {isPaginated && (
        <div className="df-page-progress">
          <span>Step {currentPage + 1} of {groups.length}</span>
          <div className="df-page-dots">
            {groups.map((_, i) => (
              <span key={i} className={`df-page-dot ${i <= currentPage ? "df-page-dot-active" : ""}`} />
            ))}
          </div>
        </div>
      )}

      <div className="df-section">
        {group.section && (
          <h3 className="df-section-title">
            <span>{group.section}</span>
          </h3>
        )}
        <div className="dynamic-form-grid">
          {group.fields.map((field) => (
            <div key={field.key} className={WIDE_FIELD_TYPES.has(field.type) ? "df-cell df-cell-wide" : "df-cell"}>
              {renderField(field)}
            </div>
          ))}
        </div>
      </div>

      <div className="df-page-actions">
        {isPaginated && currentPage > 0 && (
          <button type="button" className="df-page-back" onClick={() => setPageIndex(currentPage - 1)}>
            ← Back
          </button>
        )}
        <button type="submit" className="dynamic-form-submit" disabled={isSubmitting}>
          {isPaginated && !isLastPage ? "Next →" : isSubmitting ? "Submitting…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
