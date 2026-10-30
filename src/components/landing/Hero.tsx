import { CalendarDays, Check, ChevronRight } from "lucide-react";
import type { SectionKey } from "@/data/navigation";
import { SITE } from "@/config/site";
import { useI18n } from "@/hooks/useI18n";

interface HeroProps {
  onNavigate: (sectionKey: SectionKey) => void;
  onBook: () => void;
}

const HERO_IMAGE = "/images/latte-art.webp";

// React 18 only passes this attribute through in lowercase (camelCase fetchPriority arrives in React 19)
const HIGH_PRIORITY = { fetchpriority: "high" } as React.ImgHTMLAttributes<HTMLImageElement>;

export function Hero({ onNavigate, onBook }: HeroProps) {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-espresso">
      {/* Background photo under a dark overlay; if it fails to load, the solid background remains */}
      <img
        src={HERO_IMAGE}
        alt=""
        aria-hidden="true"
        {...HIGH_PRIORITY}
        width={800}
        height={449}
        className="absolute inset-0 w-full h-full object-cover opacity-30 motion-safe:animate-[fade-in_1.2s_ease-out]"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-espresso via-espresso/80 to-espresso/30" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28 relative z-10 motion-safe:animate-pop-in">
        <p className="text-sm tracking-[0.3em] uppercase mb-6 text-brass font-body">{t.hero.eyebrow(SITE.foundedYear)}</p>
        <h1 className="text-[2.6rem] sm:text-5xl md:text-7xl leading-[1.05] mb-8 italic text-cream font-display max-w-[16ch]">
          {t.hero.title}
        </h1>
        <p className="text-base md:text-lg mb-10 max-w-md text-cream/80 font-body">{t.hero.subtitle}</p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => onNavigate("menu")}
            className="px-6 py-3 rounded-sm flex items-center gap-2 bg-brass text-espresso font-body hover:brightness-110 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream"
          >
            {t.hero.viewMenu} <ChevronRight size={16} aria-hidden="true" />
          </button>
          <button
            onClick={onBook}
            className="px-6 py-3 rounded-sm flex items-center gap-2 border border-cream/40 hover:border-cream/80 hover:bg-cream/5 text-cream/90 font-body transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            <CalendarDays size={16} aria-hidden="true" /> {t.hero.bookTable}
          </button>
        </div>

        <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-sm text-cream/75 font-body">
          {t.hero.highlights.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check size={14} className="text-brass" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="absolute -right-24 -bottom-24 md:-right-16 md:-bottom-16 pointer-events-none z-[5]" aria-hidden="true">
        <div className="w-[380px] h-[380px] rounded-full border border-white/10" />
        <div className="absolute top-10 left-10 w-[300px] h-[300px] rounded-full border border-white/10" />
        <div className="absolute top-[90px] left-[90px] w-[200px] h-[200px] rounded-full border-2 border-brass opacity-50" />
      </div>
    </section>
  );
}
