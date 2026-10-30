import type { Localized } from "@/types";

/**
 * Everything that is specific to one business lives here.
 * To launch the template for another cafe, edit this file, src/data/seedData.ts and the images in public/images.
 */
export interface SiteConfig {
  name: string;
  /** Production URL, used for SEO tags (keep in sync with index.html, robots.txt and sitemap.xml) */
  url: string;
  foundedYear: number;
  currency: { code: string; label: Localized };
  contacts: {
    address: Localized;
    phone: string;
    phoneHref: string;
    instagramHandle: string;
  };
  hours: { open: string; close: string };
  booking: {
    /** First and last time slot a table can be booked for (HH:MM) */
    firstSlot: string;
    lastSlot: string;
    slotMinutes: number;
    maxGuests: number;
    maxDaysAhead: number;
  };
  map: { embedUrl: string; linkUrl: string };
  social: { id: "instagram" | "telegram" | "facebook"; label: string; href: string }[];
}

// Demo data — replace with the real business details before going live.
export const SITE: SiteConfig = {
  name: "Coffee&Co",
  url: "https://cafe-booking-web.vercel.app",
  foundedYear: 2016,
  currency: { code: "UZS", label: { en: "UZS", ru: "сум", uz: "soʻm" } },
  contacts: {
    address: {
      en: "45 Amir Temur St, Tashkent",
      ru: "ул. Амира Темура, 45, Ташкент",
      uz: "Amir Temur koʻchasi, 45, Toshkent",
    },
    phone: "+998 71 000 00 00",
    phoneHref: "tel:+998710000000",
    instagramHandle: "@coffeeandco",
  },
  hours: { open: "08:00", close: "22:00" },
  booking: { firstSlot: "08:00", lastSlot: "21:00", slotMinutes: 30, maxGuests: 12, maxDaysAhead: 60 },
  map: {
    embedUrl:
      "https://www.openstreetmap.org/export/embed.html?bbox=69.2697%2C41.3061%2C69.2897%2C41.3161&layer=mapnik&marker=41.3111%2C69.2797",
    linkUrl: "https://www.openstreetmap.org/?mlat=41.3111&mlon=69.2797#map=16/41.3111/69.2797",
  },
  social: [
    { id: "instagram", label: "Instagram", href: "https://instagram.com/coffeeandco" },
    { id: "telegram", label: "Telegram", href: "https://t.me/coffeeandco" },
    { id: "facebook", label: "Facebook", href: "https://facebook.com/coffeeandco" },
  ],
};
