import { useMemo, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { DateField } from "@/components/ui/DateField";
import { SITE } from "@/config/site";
import { useI18n } from "@/hooks/useI18n";
import { useInbox } from "@/hooks/useInbox";
import { addDays, toLocalIsoDate, toLocalTime, validateBookingForm, type FormErrors } from "@/utils/validators";
import { buildTimeSlots, errorMessage, formatDate } from "@/utils/formatters";
import { isoToDateText, parseDateText } from "@/utils/date";
import { formatPhone } from "@/utils/phone";
import type { BookingFormData } from "@/types";

const TIME_SLOTS = buildTimeSlots(SITE.booking.firstSlot, SITE.booking.lastSlot, SITE.booking.slotMinutes);

interface BookingModalProps {
  onClose: () => void;
}

export function BookingModal({ onClose }: BookingModalProps) {
  const { t, lang } = useI18n();
  const { addBooking } = useInbox();
  const today = useMemo(() => toLocalIsoDate(new Date()), []);
  const [form, setForm] = useState<BookingFormData>({
    name: "",
    phone: "",
    date: isoToDateText(today),
    time: "",
    guests: "2",
    comment: "",
  });
  const [errors, setErrors] = useState<FormErrors<BookingFormData>>({});
  const [submitted, setSubmitted] = useState(false);

  const guestOptions = useMemo(
    () => Array.from({ length: SITE.booking.maxGuests }, (_, i) => ({ value: String(i + 1), label: t.booking.guestsOption(i + 1) })),
    [t]
  );
  // For today only the slots that haven't started yet are offered
  const isToday = parseDateText(form.date) === today;
  const nowTime = isToday ? toLocalTime(new Date()) : "";
  const timeOptions = useMemo(
    () => [
      { value: "", label: t.booking.selectTime },
      ...TIME_SLOTS.filter((slot) => !nowTime || slot > nowTime).map((slot) => ({ value: slot, label: slot })),
    ],
    [t, nowTime]
  );

  const update = <K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validateBookingForm(form, {
      today,
      maxDaysAhead: SITE.booking.maxDaysAhead,
      slots: TIME_SLOTS,
      maxGuests: SITE.booking.maxGuests,
      // read the clock at submit time: the modal may have been open for a while
      nowTime: toLocalTime(new Date()),
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const booking = {
      name: form.name.trim(),
      phone: formatPhone(form.phone),
      // validated above, so parseDateText returns an ISO date here
      date: parseDateText(form.date) ?? "",
      time: form.time,
      guests: Number(form.guests),
      comment: form.comment.trim(),
    };
    addBooking(booking);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Modal ariaLabel={t.booking.successTitle} onClose={onClose} maxWidth="sm">
        <div className="text-center py-4" role="status">
          <CalendarCheck size={40} className="mx-auto mb-4 text-brass" aria-hidden="true" />
          <h2 className="text-2xl italic text-heading font-display mb-3">{t.booking.successTitle}</h2>
          <p className="text-sm text-copy font-body mb-6">
            {t.booking.successText(formatDate(parseDateText(form.date) ?? "", lang), form.time, t.booking.guestsOption(Number(form.guests)))}
          </p>
          <Button onClick={onClose} className="w-full">
            {t.booking.close}
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={t.booking.title} onClose={onClose} closeLabel={t.booking.close}>
      <p className="-mt-3 mb-5 text-sm text-copy font-body">{t.booking.subtitle(SITE.hours.open, SITE.hours.close)}</p>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label={t.booking.name}
          autoComplete="name"
          maxLength={80}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          error={errorMessage(t, errors.name)}
        />
        <PhoneInput
          label={t.booking.phone}
          placeholder="+998 90 123 45 67"
          value={form.phone}
          onChange={(value) => update("phone", value)}
          error={errorMessage(t, errors.phone)}
        />
        <DateField
          label={t.booking.date}
          value={form.date}
          onChange={(value) => update("date", value)}
          min={today}
          max={addDays(today, SITE.booking.maxDaysAhead)}
          lang={lang}
          placeholder={t.booking.datePlaceholder}
          error={errorMessage(t, errors.date)}
          labels={{ openCalendar: t.booking.openCalendar, prevMonth: t.booking.prevMonth, nextMonth: t.booking.nextMonth }}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label={t.booking.time}
            value={form.time}
            options={timeOptions}
            onChange={(e) => update("time", e.target.value)}
            error={errorMessage(t, errors.time)}
          />
          <Select
            label={t.booking.guests}
            value={form.guests}
            options={guestOptions}
            onChange={(e) => update("guests", e.target.value)}
            error={errorMessage(t, errors.guests)}
          />
        </div>
        <Textarea
          label={t.booking.comment}
          placeholder={t.booking.commentPlaceholder}
          rows={2}
          maxLength={500}
          value={form.comment}
          onChange={(e) => update("comment", e.target.value)}
        />

        <Button type="submit" className="w-full">
          {t.booking.submit}
        </Button>
      </form>
    </Modal>
  );
}
