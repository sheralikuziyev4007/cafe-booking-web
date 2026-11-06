import { AlertCircle, RotateCw } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "./Button";

interface ErrorStateProps {
  onRetry: () => void;
  /** Disables the button while the retry is running */
  retrying?: boolean;
}

/** Shown instead of a list when it could not be loaded. The retry button runs the request again. */
export function ErrorState({ onRetry, retrying = false }: ErrorStateProps) {
  const { t } = useI18n();
  return (
    <div role="alert" className="py-10 px-6 text-center rounded-md border border-dashed border-line">
      <AlertCircle size={28} className="mx-auto mb-3 text-danger" aria-hidden="true" />
      <p className="text-heading font-body font-medium">{t.states.errorTitle}</p>
      <p className="mt-1 text-sm text-copy font-body">{t.states.errorText}</p>
      <Button variant="outline" onClick={onRetry} disabled={retrying} className="mt-5 inline-flex items-center gap-2">
        <RotateCw size={14} aria-hidden="true" /> {t.states.retry}
      </Button>
    </div>
  );
}
