import { Controller } from "react-hook-form";
import { FieldWrapper } from "./FieldWrapper";
import type { FieldProps } from "./types";

export function MultiSelectField({ field, control, error }: FieldProps) {
  return (
    <FieldWrapper label={field.label} required={field.required} helpText={field.helpText} error={error}>
      <Controller
        name={field.key}
        control={control}
        defaultValue={[]}
        render={({ field: { value, onChange } }) => {
          const selected = Array.isArray(value) ? value : [];
          return (
            <div className="df-radio-group">
              {field.options?.map((option) => {
                const checked = selected.includes(option.value);
                return (
                  <label key={option.value} className="df-checkbox-option">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        onChange(
                          e.target.checked
                            ? [...selected, option.value]
                            : selected.filter((v) => v !== option.value),
                        );
                      }}
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          );
        }}
      />
    </FieldWrapper>
  );
}
