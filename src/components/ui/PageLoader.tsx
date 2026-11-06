import { useI18n } from "@/hooks/useI18n";

/** Full-screen placeholder while a page chunk or the saved session is loading */
export function PageLoader() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-page" aria-busy="true">
      <span role="status" className="sr-only">
        {t.states.loading}
      </span>
    </div>
  );
}
