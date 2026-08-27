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
import "./DynamicForm.css";

interface DynamicFormProps {
  schema: FormSchema;
  onSubmit: (values: FormValues) => Promise<void>;
  submitLabel?: string;
}

export function DynamicForm({ schema, onSubmit, submitLabel = "Submit" }: DynamicFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: buildResolver(schema.fields),
  });

  const currentValues = watch();
  const fieldsToRender = visibleFields(schema.fields, currentValues);

  return (
    <form className="dynamic-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {fieldsToRender.map((field) => {
        const error = errors[field.key]?.message as string | undefined;
        const props = { field, register, control, error };

        switch (field.type) {
          case "textarea":
            return <TextAreaField key={field.key} {...props} />;
          case "select":
            return <SelectField key={field.key} {...props} />;
          case "radio":
            return <RadioGroupField key={field.key} {...props} />;
          case "checkbox":
            return <CheckboxField key={field.key} {...props} />;
          case "multiselect":
            return <MultiSelectField key={field.key} {...props} />;
          default:
            return <TextField key={field.key} {...props} />;
        }
      })}

      <button type="submit" className="dynamic-form-submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : submitLabel}
      </button>
    </form>
  );
}
