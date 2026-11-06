import { forwardRef, type SelectHTMLAttributes } from "react";
import { Field, type FieldOwnProps } from "./Field";
import { controlClasses } from "./fieldStyles";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children">, FieldOwnProps {
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hideLabel, error, tone = "light", options, className = "", ...rest },
  ref
) {
  return (
    <Field label={label} hideLabel={hideLabel} error={error} tone={tone}>
      {(a11y) => (
        <select ref={ref} {...a11y} className={controlClasses(tone, Boolean(error), className)} {...rest}>
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
});
