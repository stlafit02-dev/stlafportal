import { FieldWrapper } from "./FieldWrapper";
import type { FieldProps } from "./types";

const INPUT_TYPES: Record<string, string> = {
  text: "text",
  email: "email",
  number: "number",
  date: "date",
};

export function TextField({ field, register, error }: FieldProps) {
  return (
    <FieldWrapper label={field.label} required={field.required} helpText={field.helpText} error={error}>
      <input
        type={INPUT_TYPES[field.type] ?? "text"}
        placeholder={field.placeholder}
        {...register(field.key, {
          valueAsNumber: field.type === "number",
        })}
      />
    </FieldWrapper>
  );
}
