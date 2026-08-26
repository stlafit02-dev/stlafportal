import type { ReactNode } from "react";

interface FieldWrapperProps {
  label: string;
  required: boolean;
  helpText?: string;
  error?: string;
  children: ReactNode;
}

export function FieldWrapper({ label, required, helpText, error, children }: FieldWrapperProps) {
  return (
    <label className="df-field">
      <span className="df-field-label">
        {label}
        {required && <span className="df-required">*</span>}
      </span>
      {children}
      {helpText && !error && <span className="df-help">{helpText}</span>}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
