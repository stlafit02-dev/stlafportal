import {
  useState,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from "react";
import "./FloatingField.css";

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function FloatingInput({ label, value, className, ...props }: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const floated = isFocused || hasValue;

  return (
    <div className={`floating-field ${className ?? ""}`}>
      <input
        {...props}
        value={value}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        className="floating-control"
        placeholder=" "
      />
      <label className={`floating-label ${floated ? "floating-label-up" : ""}`}>
        {label}
      </label>
    </div>
  );
}

interface FloatingSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: ReactNode;
}

export function FloatingSelect({ label, value, className, children, ...props }: FloatingSelectProps) {
  // A <select> always renders visible content (a real option or its
  // placeholder), unlike a text input that's truly blank when empty — so
  // the label stays floated up instead of resting where it would overlap
  // an unselected placeholder option.
  return (
    <div className={`floating-field ${className ?? ""}`}>
      <select
        {...props}
        value={value}
        className="floating-control"
      >
        {children}
      </select>
      <label className="floating-label floating-label-up">
        {label}
      </label>
    </div>
  );
}

interface FloatingTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function FloatingTextarea({ label, value, className, ...props }: FloatingTextareaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const floated = isFocused || hasValue;

  return (
    <div className={`floating-field ${className ?? ""}`}>
      <textarea
        {...props}
        value={value}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        className="floating-control floating-textarea"
        placeholder=" "
      />
      <label className={`floating-label ${floated ? "floating-label-up" : ""}`}>
        {label}
      </label>
    </div>
  );
}