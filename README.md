# Coffee&Co — coffee shop website with online booking & admin panel

A production-ready website for a coffee shop or restaurant. Guests browse the menu, book a table and send messages
in **English, Russian or Uzbek**; the owner manages the menu, bookings and messages in a simple admin panel.

**Live demo:** [cafe-booking-web.vercel.app](https://cafe-booking-web.vercel.app/) · **Admin:** [/admin](https://cafe-booking-web.vercel.app/admin) (`admin` / `admin123`)

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tests](https://img.shields.io/badge/tests-145_passing-2ea44f?logo=vitest&logoColor=white)
![Lighthouse](https://img.shields.io/badge/Lighthouse-100%2F100%2F100%2F100-2ea44f?logo=lighthouse&logoColor=white)

![Coffee&Co landing page](./docs/screenshots/landing-hero.webp)

## Why this project

| Business need | Solution |
| --- | --- |
| The owner changes the menu without a developer | Admin panel: add / edit / delete items, photos, prices, stop-list, ordering |
| Tourists and locals speak different languages | Full EN / RU / UZ interface; menu items are translated per language with automatic fallback |
| Fewer phone calls, more bookings | "Book a table" form with date, time slots within opening hours and number of guests |
| Never miss a request | Every booking and message lands in the admin panel with a "new" badge and counters |
| The owner sees requests from any device | Optional **Supabase** backend (Postgres, Auth, Row Level Security): a booking made on a guest's phone appears in the owner's panel. Without keys the site runs as a self-contained demo |
| Found on Google, looks great when shared | Open Graph preview, `CafeOrCoffeeShop` structured data, sitemap, Lighthouse SEO 100 |
| Fast on any phone | ~103 KB gzipped JS for the landing page, admin code is lazy-loaded (and the Supabase SDK is a separate chunk that is downloaded only when a backend is configured), responsive images (`srcset`), Lighthouse Performance 97–98 mobile / 100 desktop |

## Features

**Website**

- Hero, about, menu, reviews, contact, footer — responsive from 375 px to wide desktops
- Menu with category tabs, **search across all languages** and a detail view for every item
- Items on the stop-list stay visible with a "Not available today" badge
- **Online table booking**: date typed as **dd/mm/yyyy** or picked in an accessible calendar (today … +60 days), 30-minute time slots within opening hours, 1–12 guests
- **Phone mask** `+998 90 123 45 67`: letters are ignored, the caret stays in place while editing, incomplete numbers are rejected; other countries in `+<country code>` format
- Contact form with validation and a success message
- Language switcher (remembers the choice, detects the browser language) and **light / dark theme** without a flash on load
- Scroll-reveal animations that respect `prefers-reduced-motion`

**Admin panel (`/admin`)**

- Sign-in, protected routes, sign-out. With a backend: real email + password accounts, and only accounts with the `admin` role get in
- Dashboard counters: menu items, new bookings, unread messages
- Menu: create / edit / delete with confirmation, translations in three tabs, image preview, availability switch, reorder
- Bookings: filter by status, confirm / cancel / delete, click-to-call
- Messages: unread highlighting, mark as read, reply via `mailto:` / `tel:` link
- The whole panel is translated too
- Changes appear instantly; if a request fails, the change is rolled back and a message explains what happened

**Quality**

- TypeScript strict, no `any`; small single-purpose components
- Accessibility: labelled fields, `role="dialog"` with focus trap and focus return, `aria-pressed`, `role="switch"`, contrast ≥ 4.5:1 in both themes
- Every request has **loading** (skeleton cards that match the real layout), **error** (message + retry button) and **empty** states; forms keep what the visitor typed when sending fails
- 145 automated tests (Vitest + Testing Library): validators, phone and date masks, storage migration, the Supabase data layer (against a fake client), loading / error / empty states, rollback of failed changes, and full user flows (booking, calendar, contact form, admin CRUD)
- The database schema and its Row Level Security policies were run on a real PostgreSQL engine (anonymous visitors, signed-in non-admins and admins) with 26 checks (`npm run test:db`)
- GitHub Actions CI: lint → typecheck → tests → database policy tests → build
- `npm audit`: 0 vulnerabilities

### Lighthouse

Measured with Lighthouse 12 on the production build (`npm run build && npm run preview`), median of 3 runs:

| | Performance | Accessibility | Best Practices | SEO |
| --- | --- | --- | --- | --- |
| Desktop | 100 | 100 | 100 | 100 |
| Mobile | 98 | 100 | 100 | 100 |

## Screenshots

| Menu with categories and search | Dark theme, Uzbek |
| --- | --- |
| ![Menu](./docs/screenshots/landing-menu.webp) | ![Dark theme in Uzbek](./docs/screenshots/landing-dark-uz.webp) |

| Table booking | Mobile, Russian |
| --- | --- |
| ![Booking form](./docs/screenshots/booking.webp) | ![Mobile version](./docs/screenshots/mobile-ru.webp) |

| Admin: menu | Admin: bookings |
| --- | --- |
| ![Admin menu](./docs/screenshots/admin-menu.webp) | ![Admin bookings](./docs/screenshots/admin-bookings.webp) |

## Tech stack

- React 18 + TypeScript, React Router 7 (lazy-loaded admin routes)
- Vite 6, Tailwind CSS 3 (theme tokens via CSS variables), lucide-react icons
- TanStack Query for server data (menu, bookings, messages), Context API for i18n, theme, auth
- Supabase (Postgres + Auth + Row Level Security) as an optional backend; without it the data lives in localStorage
- Vitest, Testing Library, jsdom; ESLint; GitHub Actions

## Project structure

```
src/
├── config/site.ts         # ⭐ business details: name, address, phone, hours, booking rules, social links
├── services/              # data layer: interfaces + two implementations
│   ├── local/             #   demo mode: localStorage menu / bookings / messages + demo login
│   └── supabase/          #   Supabase menu / bookings / messages / auth + row mapping
├── lib/                   # TanStack Query client, lazily loaded Supabase client
├── data/seedData.ts       # initial menu and reviews (in 3 languages)
├── i18n/                  # en.ts (source of truth for keys), ru.ts, uz.ts — type-checked to match
├── components/
│   ├── landing/           # Header, Hero, About, MenuSection, MenuCard, MenuItemModal, BookingModal, Reviews, Contact, Footer
│   ├── admin/             # AdminLayout, AdminMenuPage, AdminBookingsPage, AdminMessagesPage, ItemFormModal, …
│   └── ui/                # Button, Input, Select, Modal, Reveal, LanguageSwitcher, ThemeToggle, …
├── context/               # providers: Services, I18n, Theme, Auth
├── hooks/                 # useMenu, useBookings, useMessages, useAuth, useI18n, useTheme, …
├── utils/                 # validators, formatters, storage parsers (with migration of old data)
└── test/                  # integration tests, fake backend and helpers
supabase/
├── schema.sql             # tables, Row Level Security policies, move_menu_item()
└── seed.sql               # starter menu (generated from src/data/seedData.ts)
```

## Getting started

Requires Node.js 22.22+ (Vitest 5 and jsdom 30 need it).

```bash
npm install
npm run dev          # http://localhost:5173
```

```bash
npm run check        # everything before a commit: lint → typecheck → tests → database policy tests → build
npm test             # run tests once (npm run test:watch — watch mode)
npm run lint
npm run typecheck
npm run build        # typecheck + production build
npm run preview      # serve the production build
```

## Using it for another business

1. Edit `src/config/site.ts` — name, address, phone, hours, booking rules, map, social links.
2. Replace the menu and reviews in `src/data/seedData.ts` and the photos in `public/images/`. With a backend, edit the menu in the admin panel or in `supabase/seed.sql` instead.
3. Update texts in `src/i18n/*.ts`; TypeScript reports any key missing in a language.
4. Update the domain in `index.html` (canonical, Open Graph, JSON-LD), `public/robots.txt` and `public/sitemap.xml`.

## Deployment

- **Vercel** (recommended): import the repository — Vite is detected automatically. `vercel.json` adds the SPA fallback,
  long-term caching for hashed assets and security headers.
- **Netlify**: build `npm run build`, publish `dist` (`public/_redirects` provides the SPA fallback).
- With a backend, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the host's environment variables (they are read at build time).

## Connect a backend (optional)

Without any setup the site runs as a demo: data lives in the browser (`localStorage`) and the admin login is `admin` / `admin123`.
To store data on a server, connect a free [Supabase](https://supabase.com) project. The UI does not change.

1. Create a Supabase project.
2. Open **SQL Editor**, run `supabase/schema.sql`, then `supabase/seed.sql` (the starter menu).
3. Open **Authentication → Users → Add user**, create the owner's account (email + password, auto-confirm).
4. Give that account the admin role, in the SQL Editor:
   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'
   where email = 'owner@example.com';
   ```
5. Copy **Project URL** and the **anon public** key (Project Settings → API) into `.env.local` (see `.env.example`):
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
6. Run `npm run dev` and sign in at `/admin` with the owner's email. On Vercel add the same two variables under
   **Settings → Environment Variables** and redeploy.

How it is protected:

- The anon key is public by design. What it can do is decided by Row Level Security in `supabase/schema.sql`:
  everyone can read the menu; visitors can *create* bookings and messages but never read them; only accounts with
  `app_metadata.role = "admin"` can read or change anything else. `app_metadata` cannot be edited by the user.
- Never use the `service_role` key in the frontend.
- Sign-out and expired sessions remove bookings and messages from memory.

## Production notes

- The public forms have no spam protection beyond field limits in the database. Before a real launch add a CAPTCHA
  (e.g. Cloudflare Turnstile) or an Edge Function with rate limiting.
- The admin panel checks for new requests once a minute and when the tab is focused; there is no realtime push and no
  email / Telegram notification yet.
- Menu photos are files in `public/images/` or links; there is no image upload.
- Demo mode is per-browser by design: use the backend for anything real.

## License

[MIT](./LICENSE)
