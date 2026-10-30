import { useEffect, useState } from "react";
import { Coffee, Menu as MenuIcon, X } from "lucide-react";
import { NAV_KEYS, type SectionKey } from "@/data/navigation";
import { useI18n } from "@/hooks/useI18n";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface HeaderProps {
  onNavigate: (sectionKey: SectionKey) => void;
  onBook: () => void;
}

export function Header({ onNavigate, onBook }: HeaderProps) {
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (key: SectionKey) => {
    setMobileOpen(false);
    onNavigate(key);
  };

  const handleBook = () => {
    setMobileOpen(false);
    onBook();
  };

  return (
    <header
      className={`sticky top-0 z-40 bg-espresso/95 backdrop-blur transition-shadow ${scrolled ? "shadow-lg shadow-black/20" : ""}`}
    >
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
        <button onClick={() => handleNav("home")} className="flex items-center gap-2 text-cream shrink-0" aria-label={t.nav.toHome}>
          <Coffee size={22} className="text-brass" aria-hidden="true" />
          <span className="text-xl italic font-display">Coffee&amp;Co</span>
        </button>

        <nav aria-label={t.nav.mainNav} className="hidden lg:flex items-center gap-7">
          {NAV_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => handleNav(key)}
              className="text-sm text-cream/80 hover:text-brass transition-colors font-body"
            >
              {t.nav[key]}
            </button>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            onClick={handleBook}
            className="px-4 py-2 rounded-sm text-sm bg-brass text-espresso font-body hover:brightness-110 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream"
          >
            {t.nav.book}
          </button>
        </div>

        <div className="flex lg:hidden items-center gap-1">
          <ThemeToggle />
          <button
            className="p-2 text-cream"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? <X size={24} aria-hidden="true" /> : <MenuIcon size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav id="mobile-nav" aria-label={t.nav.mobileNav} className="lg:hidden px-6 pb-5 flex flex-col gap-3 bg-espresso animate-fade-in">
          {NAV_KEYS.map((key) => (
            <button key={key} onClick={() => handleNav(key)} className="text-left text-sm py-1 text-cream/80 font-body">
              {t.nav[key]}
            </button>
          ))}
          <div className="pt-1">
            <LanguageSwitcher />
          </div>
          <button onClick={handleBook} className="mt-1 px-4 py-2.5 rounded-sm text-sm bg-brass text-espresso font-body">
            {t.nav.book}
          </button>
        </nav>
      )}
    </header>
  );
}
