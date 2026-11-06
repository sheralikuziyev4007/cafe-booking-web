import type { FieldValues, Resolver } from "react-hook-form";
import type { ZodType } from "zod";

/**
 * react-hook-form resolver that downloads Zod only when a form is submitted for the first time.
 * Zod is bigger than everything else the forms use, and most visitors never send a form,
 * so the landing page does not pay for it (see "Performance" in the README).
 */
export function lazyZodResolver<T extends FieldValues>(loadSchema: () => Promise<ZodType<unknown, FieldValues>>): Resolver<T> {
  return async (values, context, options) => {
    const [{ zodResolver }, schema] = await Promise.all([import("@hookform/resolvers/zod"), loadSchema()]);
    // zodResolver is typed for FieldValues; this resolver is only ever used with the form's own values type T
    const resolve = zodResolver(schema) as unknown as Resolver<T>;
    return resolve(values, context, options);
  };
}
