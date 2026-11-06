import { z } from "zod";
import { addDays, type BookingRules } from "@/utils/validators";
import { isValidPhone } from "@/utils/phone";
import { parseDateText } from "@/utils/date";

/**
 * Booking form. The rules (today, opening slots, current time) are passed in, so the schema stays pure and testable.
 * All checks live in one refinement because the time depends on the date. Messages are error codes (see zodErrors.ts).
 */
export function createBookingSchema(rules: BookingRules) {
  return z
    .object({
      name: z.string(),
      phone: z.string(),
      /** As typed: dd/mm/yyyy */
      date: z.string(),
      time: z.string(),
      guests: z.string(),
      comment: z.string(),
    })
    .superRefine((form, ctx) => {
      const fail = (path: keyof typeof form, message: string) => ctx.addIssue({ code: "custom", path: [path], message });

      if (!form.name.trim()) fail("name", "required");

      // "+998" alone (the pre-filled country code) counts as empty
      if (form.phone.replace(/\D/g, "").length <= 3) fail("phone", "required");
      else if (!isValidPhone(form.phone)) fail("phone", "invalidPhone");

      const isoDate = parseDateText(form.date);
      if (!form.date.trim()) fail("date", "required");
      else if (!isoDate) fail("date", "invalidDate");
      else if (isoDate < rules.today) fail("date", "dateInPast");
      else if (isoDate > addDays(rules.today, rules.maxDaysAhead)) fail("date", "dateTooFar");

      if (!form.time) fail("time", "required");
      else if (!rules.slots.includes(form.time)) fail("time", "timeOutOfHours");
      else if (isoDate === rules.today && rules.nowTime && form.time <= rules.nowTime) fail("time", "timePassed");

      const guests = Number(form.guests);
      if (!Number.isInteger(guests) || guests < 1 || guests > rules.maxGuests) fail("guests", "invalidGuests");
    });
}
