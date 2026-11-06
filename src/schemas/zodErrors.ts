import type { ZodError } from "zod";
import type { ErrorCode, FormErrors } from "@/utils/validators";

/**
 * Schemas use the error codes of the dictionary (see Dictionary["errors"]) as their messages,
 * so the text can be translated at render time with errorMessage().
 */
export function zodErrors<T>(error: ZodError): FormErrors<T> {
  const errors: Record<string, ErrorCode> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    // The first problem of a field wins, like in the form
    if (field && !(field in errors)) errors[field] = issue.message as ErrorCode;
  }
  return errors as FormErrors<T>;
}

/** The error code react-hook-form holds for a field (the message of the schema issue) */
export function codeOf(error: { message?: string } | undefined): ErrorCode | undefined {
  return error?.message as ErrorCode | undefined;
}
