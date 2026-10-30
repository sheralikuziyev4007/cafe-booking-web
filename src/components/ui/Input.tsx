import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { Field, type FieldOwnProps } from "./Field";
import { controlClasses } from "./fieldStyles";

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, FieldOwnProps {
  /** Element placed inside the field on the right (e.g. a calendar button) */
  endAdornment?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hideLabel, error, tone = "light", className = "", endAdornment, ...rest },
  ref
) {
  return (
    <Field label={label} hideLabel={hideLabel} error={error} tone={tone}>
      {(a11y) => {
        const input = (
          <input ref={ref} {...a11y} className={controlClasses(tone, Boolean(error), `${endAdornment ? "pr-11" : ""} ${className}`)} {...rest} />
        );
        if (!endAdornment) return input;
        return (
          <div className="relative">
            {input}
            <div className="absolute inset-y-0 right-1 flex items-center">{endAdornment}</div>
          </div>
        );
      }}
    </Field>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldOwnProps {}

export function Textarea({ label, hideLabel, error, tone = "light", className = "", ...rest }: TextareaProps) {
  return (
    <Field label={label} hideLabel={hideLabel} error={error} tone={tone}>
      {(a11y) => <textarea {...a11y} className={controlClasses(tone, Boolean(error), `resize-none ${className}`)} {...rest} />}
    </Field>
  );
}
