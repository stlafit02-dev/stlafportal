import { FieldWrapper } from "./FieldWrapper";
import type { FieldProps } from "./types";

export function CheckboxField({ field, register, error }: FieldProps) {
  return (
    <FieldWrapper label="" required={false} error={error}>
      <label className="df-checkbox-option">
        <input type="checkbox" {...register(field.key)} />
        <span>
          {field.label}
          {field.required && <span className="df-required">*</span>}
        </span>
      </label>
      {field.helpText && <span className="df-help">{field.helpText}</span>}
    </FieldWrapper>
  );
}
