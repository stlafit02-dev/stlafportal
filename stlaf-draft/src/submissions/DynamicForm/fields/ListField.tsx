import { Controller } from "react-hook-form";
import { FieldWrapper } from "./FieldWrapper";
import type { FieldProps } from "./types";

export function ListField({ field, control, error }: FieldProps) {
  return (
    <FieldWrapper label={field.label} required={field.required} helpText={field.helpText} error={error}>
      <Controller
        name={field.key}
        control={control}
        defaultValue={[""]}
        render={({ field: { value, onChange } }) => {
          const items = Array.isArray(value) && value.length > 0 ? (value as string[]) : [""];
          return (
            <div className="df-list-field">
              {items.map((item, index) => (
                <div key={index} className="df-list-row">
                  <input
                    type="text"
                    value={item}
                    placeholder={field.placeholder}
                    onChange={(e) => {
                      const next = [...items];
                      next[index] = e.target.value;
                      onChange(next);
                    }}
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      className="df-list-remove"
                      aria-label={`Remove item ${index + 1}`}
                      onClick={() => onChange(items.filter((_, i) => i !== index))}
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="df-list-add" onClick={() => onChange([...items, ""])}>
                + Add another
              </button>
            </div>
          );
        }}
      />
    </FieldWrapper>
  );
}
