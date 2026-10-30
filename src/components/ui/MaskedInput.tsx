import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from "react";
import { Input } from "./Input";
import { onlyDigits } from "@/utils/phone";

type InputProps = React.ComponentProps<typeof Input>;

export interface MaskedInputProps extends Omit<InputProps, "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  /** Turns raw text into the masked text; only digits are significant */
  format: (raw: string) => string;
}

/** Index in `text` right after the n-th digit (0 → before the first digit) */
function caretAfterDigits(text: string, n: number): number {
  if (n <= 0) {
    const first = text.search(/\d/);
    return first === -1 ? text.length : first;
  }
  let seen = 0;
  for (let i = 0; i < text.length; i++) {
    if (/\d/.test(text[i]) && ++seen === n) return i + 1;
  }
  return text.length;
}

/**
 * Text input with a digit mask (phone, date). Keeps the caret in place while the mask
 * inserts separators, and Backspace over a separator deletes the digit before it.
 */
export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(function MaskedInput(
  { value, onChange, format, ...rest },
  forwardedRef
) {
  const ref = useRef<HTMLInputElement>(null);
  const pendingCaret = useRef<number | null>(null);
  useImperativeHandle(forwardedRef, () => ref.current as HTMLInputElement);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && pendingCaret.current !== null && document.activeElement === el) {
      el.setSelectionRange(pendingCaret.current, pendingCaret.current);
    }
    pendingCaret.current = null;
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const caret = event.target.selectionStart ?? raw.length;
    let digitsBefore = onlyDigits(raw.slice(0, caret)).length;
    let source = raw;

    // Backspace/Delete removed only a separator: remove the digit before the caret instead
    if (raw.length < value.length && onlyDigits(raw) === onlyDigits(value) && digitsBefore > 0) {
      const digits = onlyDigits(raw);
      source = (raw.trimStart().startsWith("+") ? "+" : "") + digits.slice(0, digitsBefore - 1) + digits.slice(digitsBefore);
      digitsBefore -= 1;
    }

    const formatted = format(source);
    // The mask may add a prefix (e.g. country code) — shift the caret by the added digits
    const added = onlyDigits(formatted).length - onlyDigits(source).length;
    if (added > 0) digitsBefore += added;

    pendingCaret.current = caretAfterDigits(formatted, Math.min(digitsBefore, onlyDigits(formatted).length));
    onChange(formatted);
  };

  return <Input ref={ref} value={value} onChange={handleChange} {...rest} />;
});
