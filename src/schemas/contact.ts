import { z } from "zod";
import { isValidEmail } from "@/utils/validators";
import { isValidPhone } from "@/utils/phone";

/** Contact form. Messages are error codes (see zodErrors.ts). */
export const contactSchema = z.object({
  name: z.string().trim().min(1, { error: "required", abort: true }),
  contact: z
    .string()
    .trim()
    .min(1, { error: "required", abort: true })
    // "@" means the visitor is typing an email; otherwise it must be a complete phone number
    .refine((value) => (value.includes("@") ? isValidEmail(value) : isValidPhone(value)), { error: "invalidContact" }),
  message: z.string().trim().min(1, { error: "required", abort: true }),
});
