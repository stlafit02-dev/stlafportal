import { FieldWrapper } from "./FieldWrapper";
import type { FieldProps } from "./types";

export function SelectField({ field, register, error }: FieldProps) {
  return (
    <FieldWrapper label={field.label} required={field.required} helpText={field.helpText} error={error}>
      <select defaultValue="" {...register(field.key)}>
        <option value="" disabled>
          Select…
        </option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}
