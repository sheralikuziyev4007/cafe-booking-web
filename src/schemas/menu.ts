import { z } from "zod";
import { hasAnyText, isValidImageUrl } from "@/utils/validators";

const localizedText = z.object({ en: z.string(), ru: z.string(), uz: z.string() });

/** Menu item form. The price is a string while the owner is typing. Messages are error codes (see zodErrors.ts). */
export const menuSchema = z.object({
  name: localizedText.refine(hasAnyText, { error: "needOneLanguage" }),
  description: localizedText.refine(hasAnyText, { error: "needOneLanguage" }),
  category: z.enum(["coffee", "desserts", "breakfast", "main"]),
  price: z
    .string()
    .trim()
    .regex(/^\d+$/, { error: "invalidPrice", abort: true })
    .refine((value) => Number(value) > 0, { error: "invalidPrice" }),
  imageUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || isValidImageUrl(value), { error: "invalidImageUrl" }),
  isAvailable: z.boolean(),
});
