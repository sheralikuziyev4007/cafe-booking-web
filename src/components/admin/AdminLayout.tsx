import { Link, NavLink, Outlet } from "react-router-dom";
import { CalendarDays, Coffee, ExternalLink, LogOut, Mail, UtensilsCrossed } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useMenu } from "@/hooks/useMenu";
import { useInbox } from "@/hooks/useInbox";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { StatCard } from "./StatCard";

export function AdminLayout() {
  const { logout } = useAuth();
  const { t } = useI18n();
  const { menu } = useMenu();
  const { bookings, messages } = useInbox();

  const availableCount = menu.filter((m) => m.isAvailable).length;
  const newBookings = bookings.filter((b) => b.status === "new").length;
  const unread = messages.filter((m) => !m.read).length;

  const tabs = [
    { to: "/admin", end: true, label: t.admin.tabs.menu, icon: UtensilsCrossed, badge: 0 },
    { to: "/admin/bookings", end: false, label: t.admin.tabs.bookings, icon: CalendarDays, badge: newBookings },
    { to: "/admin/messages", end: false, label: t.admin.tabs.messages, icon: Mail, badge: unread },
  ];

  return (
    <div className="min-h-screen bg-page">
      <header className="bg-espresso">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-cream">
            <Coffee size={20} className="text-brass" aria-hidden="true" />
            <span className="italic font-display">
              Coffee&amp;Co<span className="hidden sm:inline"> — {t.admin.panel}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link to="/" className="hidden sm:flex items-center gap-1 text-xs text-cream/80 hover:text-cream font-body">
              {t.admin.openSite} <ExternalLink size={12} aria-hidden="true" />
            </Link>
            <button onClick={logout} className="text-xs flex items-center gap-1 text-clayLight hover:brightness-110 font-body px-1">
              <LogOut size={14} aria-hidden="true" /> {t.admin.logout}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label={t.admin.stats.items} value={menu.length} hint={t.admin.stats.available(availableCount)} />
          <StatCard label={t.admin.stats.newBookings} value={newBookings} highlight={newBookings > 0} />
          <StatCard label={t.admin.stats.unread} value={unread} highlight={unread > 0} />
        </div>

        <nav aria-label={t.admin.sections} className="flex gap-1 border-b border-line overflow-x-auto">
          {tabs.map(({ to, end, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 -mb-px border-b-2 text-sm font-body whitespace-nowrap transition-colors ${
                  isActive ? "border-brass text-heading" : "border-transparent text-copy hover:text-heading"
                }`
              }
            >
              <Icon size={15} aria-hidden="true" />
              {label}
              {badge > 0 && (
                <span className="min-w-[1.25rem] px-1.5 py-0.5 rounded-full bg-brass text-espresso text-[11px] leading-none text-center">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <Outlet />
        <p className="mt-10 text-xs text-copy/80 font-body">{t.admin.demoNote}</p>
      </main>
    </div>
  );
}
