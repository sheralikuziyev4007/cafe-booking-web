import { X } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

interface ActionErrorProps {
  onDismiss: () => void;
}

/** Banner above an admin page: a change (save, delete, confirm…) did not go through and was rolled back */
export function ActionError({ onDismiss }: ActionErrorProps) {
  const { t } = useI18n();
  return (
    <div role="alert" className="mb-4 flex items-start justify-between gap-3 px-4 py-3 rounded-md border border-danger text-sm text-danger font-body">
      <p>{t.states.saveFailed}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t.states.dismiss}
        className="shrink-0 p-0.5 rounded-sm hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
