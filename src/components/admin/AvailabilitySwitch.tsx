import { useI18n } from "@/hooks/useI18n";
import type { MenuItem } from "@/types";

interface AvailabilitySwitchProps {
  item: MenuItem;
  name: string;
  onToggle: () => void;
}

/** Switch between "available" and "stop-list" (role="switch" for screen readers) */
export function AvailabilitySwitch({ item, name, onToggle }: AvailabilitySwitchProps) {
  const { t } = useI18n();
  const on = item.isAvailable;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={t.admin.menu.toggle(name)}
      onClick={onToggle}
      className="inline-flex items-center gap-2 text-xs font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass rounded-full"
    >
      <span className={`relative w-9 h-5 rounded-full transition-colors ${on ? "bg-brass" : "bg-line"}`} aria-hidden="true">
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : ""}`}
        />
      </span>
      <span className={on ? "text-heading" : "text-copy"}>{on ? t.admin.menu.available : t.admin.menu.hidden}</span>
    </button>
  );
}
