import { useMemo, useState } from "react";
import { CalendarDays, Check, Clock, MessageSquare, Phone, Trash2, Users, X } from "lucide-react";
import { useInbox } from "@/hooks/useInbox";
import { useI18n } from "@/hooks/useI18n";
import { formatDate, formatDateTime } from "@/utils/formatters";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "./ConfirmModal";
import type { Booking, BookingStatus } from "@/types";

type Filter = BookingStatus | "all";

const FILTERS: Filter[] = ["all", "new", "confirmed", "cancelled"];

const STATUS_STYLES: Record<BookingStatus, string> = {
  new: "bg-brass text-espresso",
  confirmed: "bg-success/15 text-success",
  cancelled: "bg-line text-copy",
};

/** Upcoming first: by date and time */
const byDateTime = (a: Booking, b: Booking) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);

export function AdminBookingsPage() {
  const { bookings, setBookingStatus, deleteBooking } = useInbox();
  const { t, lang } = useI18n();
  const [filter, setFilter] = useState<Filter>("all");
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);

  const visible = useMemo(
    () => bookings.filter((b) => filter === "all" || b.status === filter).sort(byDateTime),
    [bookings, filter]
  );

  const count = (f: Filter) => (f === "all" ? bookings.length : bookings.filter((b) => b.status === f).length);
  const filterLabel = (f: Filter) => (f === "all" ? t.admin.bookings.all : t.admin.bookings.status[f]);

  return (
    <>
      <h1 className="text-2xl italic text-heading font-display mb-6">{t.admin.bookings.title}</h1>

      <div role="group" aria-label={t.admin.bookings.filter} className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-body border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass ${
              filter === f ? "bg-inverse text-onInverse border-transparent" : "border-line text-copy hover:bg-pageAlt"
            }`}
          >
            {filterLabel(f)} · {count(f)}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-10 text-center text-copy font-body rounded-md border border-dashed border-line">{t.admin.bookings.empty}</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((b) => (
            <li key={b.id} className="p-4 sm:p-5 rounded-md bg-card border border-line">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-heading font-body font-medium">{b.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-body ${STATUS_STYLES[b.status]}`}>
                      {t.admin.bookings.status[b.status]}
                    </span>
                  </div>
                  <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-copy font-body">
                    <li className="flex items-center gap-1.5">
                      <CalendarDays size={14} aria-hidden="true" /> {formatDate(b.date, lang)}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Clock size={14} aria-hidden="true" /> {b.time}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Users size={14} aria-hidden="true" /> {t.admin.bookings.guests(b.guests)}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Phone size={14} aria-hidden="true" />
                      <a href={`tel:${b.phone.replace(/[^\d+]/g, "")}`} className="hover:text-accent underline-offset-2 hover:underline">
                        {b.phone}
                      </a>
                    </li>
                  </ul>
                  {b.comment && (
                    <p className="mt-2 text-sm text-copy font-body flex gap-1.5">
                      <MessageSquare size={14} className="mt-0.5 shrink-0" aria-hidden="true" /> {b.comment}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-copy/80 font-body">{t.admin.bookings.received(formatDateTime(b.createdAt, lang))}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {b.status !== "confirmed" && (
                    <Button onClick={() => setBookingStatus(b.id, "confirmed")} className="!py-1.5 flex items-center gap-1.5">
                      <Check size={14} aria-hidden="true" /> {t.admin.bookings.confirm}
                    </Button>
                  )}
                  {b.status !== "cancelled" && (
                    <Button variant="outline" onClick={() => setBookingStatus(b.id, "cancelled")} className="!py-1.5 flex items-center gap-1.5">
                      <X size={14} aria-hidden="true" /> {t.admin.bookings.cancel}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setDeleteTarget(b)}
                    className="!py-1.5 !text-danger flex items-center gap-1.5"
                    aria-label={`${t.admin.bookings.delete}: ${b.name}`}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {deleteTarget && (
        <ConfirmModal
          text={t.admin.bookings.confirmDelete(deleteTarget.name)}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            deleteBooking(deleteTarget.id);
            setDeleteTarget(null);
          }}
        />
      )}
    </>
  );
}
