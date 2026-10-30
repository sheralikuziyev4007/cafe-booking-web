import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  title?: string;
  /** Accessible name when there is no visible title */
  ariaLabel?: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg";
  /** Label for the × button; the button is hidden when omitted */
  closeLabel?: string;
  /** Remove the inner padding (e.g. for a full-bleed image) */
  flush?: boolean;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const WIDTH = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl" } as const;

/**
 * Accessible modal: role="dialog", closes on Escape and backdrop click,
 * moves focus inside, traps Tab and restores focus on close. Locks page scroll while open.
 */
export function Modal({ title, ariaLabel, onClose, children, maxWidth = "md", closeLabel, flush = false }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const first = dialog?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? dialog)?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;

      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];

      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4 sm:px-6 z-50 bg-black/60 backdrop-blur-[2px] animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        className={`relative w-full ${WIDTH[maxWidth]} max-h-[90vh] overflow-y-auto rounded-md bg-page shadow-2xl focus:outline-none animate-pop-in ${
          flush ? "" : "p-6"
        }`}
      >
        {closeLabel && (
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-page/80 text-heading hover:bg-pageAlt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
        {title && (
          <h2 id={titleId} className={`text-xl mb-5 italic text-heading font-display ${closeLabel ? "pr-8" : ""}`}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
