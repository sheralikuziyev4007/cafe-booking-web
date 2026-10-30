import { LANGS } from "@/i18n";
import { useI18n } from "@/hooks/useI18n";

interface LanguageSwitcherProps {
  /** "dark" for the espresso header, "light" for theme-aware surfaces */
  tone?: "dark" | "light";
}

export function LanguageSwitcher({ tone = "dark" }: LanguageSwitcherProps) {
  const { lang, setLang, t } = useI18n();
  const base = tone === "dark" ? "border-cream/25" : "border-line";

  return (
    <div role="group" aria-label={t.controls.language} className={`inline-flex rounded-full border ${base} p-0.5`}>
      {LANGS.map((l) => {
        const active = l.id === lang;
        const colors = active
          ? "bg-brass text-espresso"
          : tone === "dark"
            ? "text-cream/75 hover:text-cream"
            : "text-copy hover:text-heading";
        return (
          <button
            key={l.id}
            type="button"
            lang={l.id}
            onClick={() => setLang(l.id)}
            aria-pressed={active}
            title={l.name}
            className={`px-2.5 py-1 rounded-full text-xs font-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass ${colors}`}
          >
            <span aria-hidden="true">{l.label}</span>
            <span className="sr-only">{l.name}</span>
          </button>
        );
      })}
    </div>
  );
}
