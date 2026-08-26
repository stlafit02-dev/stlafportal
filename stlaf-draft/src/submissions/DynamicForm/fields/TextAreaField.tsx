import { FieldWrapper } from "./FieldWrapper";
import type { FieldProps } from "./types";

export function TextAreaField({ field, register, error }: FieldProps) {
  return (
    <FieldWrapper label={field.label} required={field.required} helpText={field.helpText} error={error}>
      <textarea rows={4} placeholder={field.placeholder} {...register(field.key)} />
    </FieldWrapper>
  );
}
