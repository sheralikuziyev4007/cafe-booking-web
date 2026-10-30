import { Clock, Coffee, Facebook, Instagram, MapPin, Phone, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { NAV_KEYS, type SectionKey } from "@/data/navigation";
import { SITE } from "@/config/site";
import { useI18n } from "@/hooks/useI18n";

interface FooterProps {
  onNavigate: (sectionKey: SectionKey) => void;
}

const SOCIAL_ICONS = {
  instagram: Instagram,
  telegram: Send,
  facebook: Facebook,
} as const;

export function Footer({ onNavigate }: FooterProps) {
  const { t, pick } = useI18n();

  return (
    <footer className="bg-espressoDark pt-14 pb-8">
      <div className="max-w-6xl mx-auto px-6 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2 max-w-sm">
          <div className="flex items-center gap-2 text-cream mb-4">
            <Coffee size={20} className="text-brass" aria-hidden="true" />
            <span className="text-lg italic font-display">Coffee&amp;Co</span>
          </div>
          <p className="text-sm text-cream/70 font-body leading-relaxed mb-5">{t.footer.tagline}</p>
          <ul className="flex gap-3" aria-label={t.footer.social}>
            {SITE.social.map((social) => {
              const Icon = SOCIAL_ICONS[social.id];
              return (
                <li key={social.id}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex items-center justify-center w-9 h-9 rounded-full border border-cream/20 text-cream/75 hover:text-brass hover:border-brass transition-colors"
                  >
                    <Icon size={16} aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <nav aria-label={t.nav.footerNav}>
          <p className="text-xs tracking-[0.2em] uppercase text-brass font-body mb-4">{t.footer.navigation}</p>
          <ul className="space-y-2">
            {NAV_KEYS.map((key) => (
              <li key={key}>
                <button onClick={() => onNavigate(key)} className="text-sm text-cream/75 hover:text-brass transition-colors font-body">
                  {t.nav[key]}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-brass font-body mb-4">{t.footer.contacts}</p>
          <ul className="space-y-3 text-sm text-cream/75 font-body">
            <li className="flex gap-2">
              <MapPin size={16} className="shrink-0 mt-0.5 text-cream/50" aria-hidden="true" />
              {pick(SITE.contacts.address)}
            </li>
            <li className="flex gap-2">
              <Phone size={16} className="shrink-0 mt-0.5 text-cream/50" aria-hidden="true" />
              <a href={SITE.contacts.phoneHref} className="hover:text-brass transition-colors">
                {SITE.contacts.phone}
              </a>
            </li>
            <li className="flex gap-2">
              <Clock size={16} className="shrink-0 mt-0.5 text-cream/50" aria-hidden="true" />
              {t.contact.hours(SITE.hours.open, SITE.hours.close)}
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12 pt-6 border-t border-cream/10 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-xs text-cream/60 font-body">{t.footer.rights(new Date().getFullYear())}</p>
        <Link to="/admin" className="text-xs text-cream/60 hover:text-brass transition-colors font-body">
          {t.footer.admin}
        </Link>
      </div>
    </footer>
  );
}
