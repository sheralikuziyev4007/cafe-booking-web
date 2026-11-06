import { useMemo, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { CalendarCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { DateField } from "@/components/ui/DateField";
import { SITE } from "@/config/site";
import { useI18n } from "@/hooks/useI18n";
import { useAvailability, useVisitorActions } from "@/hooks/useInbox";
import { SlotFullError } from "@/services/errors";
import { addDays, toLocalIsoDate, toLocalTime } from "@/utils/validators";
import { lazyZodResolver } from "@/schemas/lazyResolver";
import { codeOf } from "@/schemas/zodErrors";
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
  const { createBooking } = useVisitorActions();
  const today = useMemo(() => toLocalIsoDate(new Date()), []);
  // The clock is read at submit time (the modal may have been open for a while), so the schema is built per validation
  const resolver = useMemo<Resolver<BookingFormData>>(
    () =>
      lazyZodResolver(() =>
        import("@/schemas/booking").then((m) =>
          m.createBookingSchema({
            today,
            maxDaysAhead: SITE.booking.maxDaysAhead,
            slots: TIME_SLOTS,
            maxGuests: SITE.booking.maxGuests,
            nowTime: toLocalTime(new Date()),
          })
        )
      ),
    [today]
  );
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver,
    defaultValues: { name: "", phone: "", date: isoToDateText(today), time: "", guests: "2", comment: "" },
  });
  const [booked, setBooked] = useState<BookingFormData | null>(null);
  const date = watch("date");

  const guestOptions = useMemo(
    () => Array.from({ length: SITE.booking.maxGuests }, (_, i) => ({ value: String(i + 1), label: t.booking.guestsOption(i + 1) })),
    [t]
  );
  // For today only the slots that haven't started yet are offered
  const isToday = parseDateText(date) === today;
  const nowTime = isToday ? toLocalTime(new Date()) : "";
  const isoDate = parseDateText(date);
  const availability = useAvailability(isoDate);
  const timeOptions = useMemo(
    () => [
      { value: "", label: t.booking.selectTime },
      ...TIME_SLOTS.filter((slot) => !nowTime || slot > nowTime).map((slot) => {
        const full = availability.data !== undefined && (availability.data.booked[slot] ?? 0) >= availability.data.capacity;
        return { value: slot, label: full ? `${slot} · ${t.booking.slotFull}` : slot, disabled: full };
      }),
    ],
    [t, nowTime, availability.data]
  );

  const onSubmit = handleSubmit((values) => {
    const booking = {
      name: values.name.trim(),
      phone: formatPhone(values.phone),
      // validated by the schema, so parseDateText returns an ISO date here
      date: parseDateText(values.date) ?? "",
      time: values.time,
      guests: Number(values.guests),
      comment: values.comment.trim(),
    };
    createBooking.mutate(booking, {
      onSuccess: () => setBooked(values),
      // Someone took the last table a moment ago: the refreshed list greys the time out, so the visitor picks another one
      onError: (error) => {
        if (error instanceof SlotFullError) setValue("time", "");
      },
    });
  });

  if (booked) {
    return (
      <Modal ariaLabel={t.booking.successTitle} onClose={onClose} maxWidth="sm">
        <div className="text-center py-4" role="status">
          <CalendarCheck size={40} className="mx-auto mb-4 text-brass" aria-hidden="true" />
          <h2 className="text-2xl italic text-heading font-display mb-3">{t.booking.successTitle}</h2>
          <p className="text-sm text-copy font-body mb-6">
            {t.booking.successText(formatDate(parseDateText(booked.date) ?? "", lang), booked.time, t.booking.guestsOption(Number(booked.guests)))}
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
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Input
          label={t.booking.name}
          autoComplete="name"
          maxLength={80}
          {...register("name")}
          error={errorMessage(t, codeOf(errors.name))}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <PhoneInput
              label={t.booking.phone}
              placeholder="+998 90 123 45 67"
              name={field.name}
              ref={field.ref}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errorMessage(t, codeOf(errors.phone))}
            />
          )}
        />
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <DateField
              label={t.booking.date}
              value={field.value}
              onChange={field.onChange}
              min={today}
              max={addDays(today, SITE.booking.maxDaysAhead)}
              lang={lang}
              placeholder={t.booking.datePlaceholder}
              error={errorMessage(t, codeOf(errors.date))}
              labels={{ openCalendar: t.booking.openCalendar, prevMonth: t.booking.prevMonth, nextMonth: t.booking.nextMonth }}
            />
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label={t.booking.time}
            options={timeOptions}
            {...register("time")}
            error={errorMessage(t, codeOf(errors.time))}
          />
          <Select
            label={t.booking.guests}
            options={guestOptions}
            {...register("guests")}
            error={errorMessage(t, codeOf(errors.guests))}
          />
        </div>
        <Textarea
          label={t.booking.comment}
          placeholder={t.booking.commentPlaceholder}
          rows={2}
          maxLength={500}
          {...register("comment")}
        />

        {createBooking.isError && (
          <p role="alert" className="text-sm text-danger font-body">
            {createBooking.error instanceof SlotFullError ? t.booking.slotTaken : t.states.sendFailed}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={createBooking.isPending}>
          {createBooking.isPending ? t.states.sending : t.booking.submit}
        </Button>
      </form>
    </Modal>
  );
}
