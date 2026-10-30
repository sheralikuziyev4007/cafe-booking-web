import { Link } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";

export function NotFound() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 bg-espresso text-center">
      <p className="text-brass text-sm font-body">{t.notFound.code}</p>
      <h1 className="text-4xl italic text-cream font-display">{t.notFound.title}</h1>
      <Link
        to="/"
        className="px-4 py-2.5 rounded-sm text-sm font-body bg-brass text-espresso hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream"
      >
        {t.notFound.back}
      </Link>
    </div>
  );
}
