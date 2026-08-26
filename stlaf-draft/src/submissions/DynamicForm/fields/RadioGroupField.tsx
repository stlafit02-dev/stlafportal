import { FieldWrapper } from "./FieldWrapper";
import type { FieldProps } from "./types";

export function RadioGroupField({ field, register, error }: FieldProps) {
  return (
    <FieldWrapper label={field.label} required={field.required} helpText={field.helpText} error={error}>
      <div className="df-radio-group">
        {field.options?.map((option) => (
          <label key={option.value} className="df-radio-option">
            <input type="radio" value={option.value} {...register(field.key)} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </FieldWrapper>
  );
}
