import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-brass text-espresso hover:brightness-110",
  outline: "border border-line text-copy hover:bg-pageAlt",
  danger: "bg-danger text-page hover:opacity-90",
};

export function Button({ variant = "primary", className = "", children, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={`px-4 py-2.5 rounded-sm text-sm font-body transition disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
