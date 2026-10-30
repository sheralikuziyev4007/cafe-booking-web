import { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { MaskedInput } from "./MaskedInput";
import { Calendar } from "./Calendar";
import { formatDateText, isoToDateText, parseDateText } from "@/utils/date";
import type { Lang } from "@/types";

interface DateFieldProps {
  label: string;
  /** Text in the format dd/mm/yyyy */
  value: string;
  onChange: (value: string) => void;
  /** Allowed range for the calendar, ISO */
  min: string;
  max: string;
  lang: Lang;
  placeholder: string;
  error?: string;
  labels: { openCalendar: string; prevMonth: string; nextMonth: string };
}

/** Date typed as dd/mm/yyyy (with auto-inserted slashes) or picked from the calendar */
export function DateField({ label, value, onChange, min, max, lang, placeholder, error, labels }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div ref={wrapperRef}>
      <MaskedInput
        label={label}
        value={value}
        onChange={onChange}
        format={formatDateText}
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        maxLength={10}
        error={error}
        endAdornment={
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={labels.openCalendar}
            aria-expanded={open}
            className="p-2 rounded-sm text-copy hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            <CalendarDays size={18} aria-hidden="true" />
          </button>
        }
      />
      {open && (
        <Calendar
          value={parseDateText(value)}
          min={min}
          max={max}
          lang={lang}
          labels={labels}
          onSelect={(iso) => {
            onChange(isoToDateText(iso));
            close();
          }}
          onClose={close}
        />
      )}
    </div>
  );
}
