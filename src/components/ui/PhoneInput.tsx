import { MaskedInput, type MaskedInputProps } from "./MaskedInput";
import { formatPhone, onlyDigits, UZ_CODE } from "@/utils/phone";

type PhoneInputProps = Omit<MaskedInputProps, "format" | "type" | "inputMode" | "autoComplete">;

const PREFIX = `+${UZ_CODE} `;

/**
 * Phone field with the Uzbek mask "+998 90 123 45 67".
 * The country code is filled in on focus and removed on blur if nothing else was typed.
 * Other countries: delete the code and type "+" with the country code.
 */
export function PhoneInput({ value, onChange, onFocus, onBlur, ...rest }: PhoneInputProps) {
  return (
    <MaskedInput
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      maxLength={20}
      value={value}
      onChange={onChange}
      format={formatPhone}
      onFocus={(e) => {
        if (!value) onChange(PREFIX);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        if (onlyDigits(value) === UZ_CODE || value.trim() === "+") onChange("");
        onBlur?.(e);
      }}
      {...rest}
    />
  );
}
