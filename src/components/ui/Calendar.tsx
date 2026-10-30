import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { INTL_LOCALE } from "@/i18n";
import { addDays } from "@/utils/validators";
import type { Lang } from "@/types";

interface CalendarProps {
  /** Selected date, ISO yyyy-mm-dd (or null) */
  value: string | null;
  /** Inclusive range, ISO */
  min: string;
  max: string;
  lang: Lang;
  labels: { prevMonth: string; nextMonth: string };
  onSelect: (iso: string) => void;
  onClose: () => void;
}

const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parts = (iso: string) => iso.split("-").map(Number) as [number, number, number];
const clamp = (iso: string, min: string, max: string) => (iso < min ? min : iso > max ? max : iso);

/** Monday-first 6×7 grid of ISO dates for the month */
function monthGrid(year: number, month: number): string[] {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (first.getUTCDay() + 6) % 7; // Monday = 0
  const start = addDays(toIso(year, month, 1), -offset);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

/**
 * Accessible month calendar (WAI-ARIA date picker dialog pattern):
 * arrows move by day/week, PageUp/PageDown by month, Home/End to week start/end,
 * Enter/Space selects, Escape closes. Dates outside min…max are disabled.
 */
export function Calendar({ value, min, max, lang, labels, onSelect, onClose }: CalendarProps) {
  const [focused, setFocused] = useState(() => clamp(value ?? min, min, max));
  const [fy, fm] = parts(focused);
  const gridRef = useRef<HTMLDivElement>(null);
  const locale = INTL_LOCALE[lang];

  const days = useMemo(() => monthGrid(fy, fm - 1), [fy, fm]);

  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(fy, fm - 1, 1))
  );
  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
    // 2024-01-01 was a Monday
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(Date.UTC(2024, 0, 1 + i))));
  }, [locale]);
  const dayLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", weekday: "long", timeZone: "UTC" }),
    [locale]
  );

  // Move DOM focus to the focused day: on open, and while the user navigates inside the grid
  // (the month buttons keep their own focus, as in the WAI-ARIA pattern)
  const openedRef = useRef(false);
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (!openedRef.current || grid.contains(document.activeElement)) {
      grid.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`)?.focus();
    }
    openedRef.current = true;
  }, [focused]);

  const shiftMonth = (delta: number) => {
    const [y, m, d] = parts(focused);
    const target = new Date(Date.UTC(y, m - 1 + delta, 1));
    const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
    setFocused(clamp(toIso(target.getUTCFullYear(), target.getUTCMonth(), Math.min(d, lastDay)), min, max));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const moves: Record<string, () => void> = {
      ArrowLeft: () => setFocused((f) => clamp(addDays(f, -1), min, max)),
      ArrowRight: () => setFocused((f) => clamp(addDays(f, 1), min, max)),
      ArrowUp: () => setFocused((f) => clamp(addDays(f, -7), min, max)),
      ArrowDown: () => setFocused((f) => clamp(addDays(f, 7), min, max)),
      PageUp: () => shiftMonth(-1),
      PageDown: () => shiftMonth(1),
      Home: () => setFocused((f) => clamp(addDays(f, -((new Date(f).getUTCDay() + 6) % 7)), min, max)),
      End: () => setFocused((f) => clamp(addDays(f, 6 - ((new Date(f).getUTCDay() + 6) % 7)), min, max)),
    };
    if (event.key === "Escape") {
      // Don't let the surrounding modal close as well
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();
      onClose();
      return;
    }
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      move();
    }
  };

  const [minY, minM] = parts(min);
  const [maxY, maxM] = parts(max);
  const canPrev = fy * 12 + fm > minY * 12 + minM;
  const canNext = fy * 12 + fm < maxY * 12 + maxM;

  const navButton =
    "p-1.5 rounded-full text-heading hover:bg-pageAlt disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass";

  return (
    <div className="mt-2 p-3 rounded-md border border-line bg-card shadow-lg animate-fade-in" onKeyDown={handleKeyDown}>
      <div className="flex items-center justify-between mb-2">
        <button type="button" className={navButton} onClick={() => shiftMonth(-1)} disabled={!canPrev} aria-label={labels.prevMonth}>
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <p className="text-sm text-heading font-body font-medium capitalize" aria-live="polite">
          {monthLabel}
        </p>
        <button type="button" className={navButton} onClick={() => shiftMonth(1)} disabled={!canNext} aria-label={labels.nextMonth}>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div ref={gridRef} role="grid" aria-label={monthLabel} className="font-body">
        <div role="row" className="grid grid-cols-7">
          {weekdays.map((w) => (
            <div key={w} role="columnheader" className="py-1 text-center text-[11px] uppercase text-copy/80">
              {w}
            </div>
          ))}
        </div>
        {Array.from({ length: 6 }, (_, row) => (
          <div key={row} role="row" className="grid grid-cols-7">
            {days.slice(row * 7, row * 7 + 7).map((iso) => {
              const [, m, d] = parts(iso);
              const outside = m !== fm;
              const disabled = iso < min || iso > max;
              const selected = iso === value;
              return (
                <div key={iso} role="gridcell" aria-selected={selected} className="p-0.5">
                  <button
                    type="button"
                    data-date={iso}
                    tabIndex={iso === focused ? 0 : -1}
                    disabled={disabled}
                    aria-label={dayLabel.format(new Date(`${iso}T00:00:00Z`))}
                    onClick={() => onSelect(iso)}
                    onFocus={() => setFocused(iso)}
                    className={`w-full aspect-square max-h-10 rounded-full text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
                      selected
                        ? "bg-brass text-espresso font-medium"
                        : outside
                          ? "text-copy/80 hover:bg-pageAlt"
                          : "text-heading hover:bg-pageAlt"
                    }`}
                  >
                    {d}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
