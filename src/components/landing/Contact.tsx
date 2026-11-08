import { forwardRef, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { MapPin, Phone, Clock, Instagram, Send, Check, ExternalLink } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { SITE } from "@/config/site";
import { useI18n } from "@/hooks/useI18n";
import { useVisitorActions } from "@/hooks/useInbox";
import { lazyZodResolver } from "@/schemas/lazyResolver";
import { codeOf } from "@/schemas/zodErrors";
import { errorMessage } from "@/utils/formatters";
import { formatPhone, isValidPhone } from "@/utils/phone";
import type { ContactFormData } from "@/types";

const EMPTY_FORM: ContactFormData = { name: "", contact: "", message: "" };

export const Contact = forwardRef<HTMLElement>(function Contact(_props, ref) {
  const { t, pick } = useI18n();
  const { createMessage } = useVisitorActions();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactFormData>({ resolver: lazyZodResolver(() => import("@/schemas/contact").then((m) => m.contactSchema)), defaultValues: EMPTY_FORM });
  const contactField = register("contact");
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  // Don't leave a pending timer after unmount
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  // The schema has already validated and trimmed the values
  const onSubmit = handleSubmit((values) => {
    const data = {
      name: values.name,
      // Phone numbers are stored in one format: +998 90 123 45 67
      contact: values.contact.includes("@") ? values.contact : formatPhone(values.contact),
      message: values.message,
    };
    // The form is cleared only after the request succeeds, so nothing typed is lost on failure
    createMessage.mutate(data, {
      onSuccess: () => {
        reset(EMPTY_FORM);
        setSubmitted(true);
        window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => setSubmitted(false), 5000);
      },
    });
  });

  return (
    <section ref={ref} className="bg-espresso py-20 md:py-24">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
        <Reveal>
          <SectionHeading eyebrow={t.contact.eyebrow} title={t.contact.title} tone="dark" className="mb-8" />
          <ul className="space-y-4 text-cream/80 font-body">
            <li className="flex items-center gap-3">
              <MapPin size={18} className="text-brass shrink-0" aria-hidden="true" />
              <span>{pick(SITE.contacts.address)}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-brass shrink-0" aria-hidden="true" />
              <a href={SITE.contacts.phoneHref} className="hover:text-brass transition-colors">
                {SITE.contacts.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Clock size={18} className="text-brass shrink-0" aria-hidden="true" />
              <span>{t.contact.hours(SITE.hours.open, SITE.hours.close)}</span>
            </li>
            <li className="flex items-center gap-3">
              <Instagram size={18} className="text-brass shrink-0" aria-hidden="true" />
              <a
                href={SITE.social.find((s) => s.id === "instagram")?.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brass transition-colors"
              >
                {SITE.contacts.instagramHandle}
              </a>
            </li>
          </ul>

          <div className="mt-8">
            <iframe
              title={t.contact.mapTitle}
              src={SITE.map.embedUrl}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-56 rounded-sm border border-cream/20 bg-espressoDark"
            />
            <a
              href={SITE.map.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-cream/80 hover:text-brass transition-colors font-body"
            >
              {t.contact.openMap} <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <form onSubmit={onSubmit} noValidate className="space-y-4 self-start" aria-label={t.contact.formLabel}>
            <Input
              tone="dark"
              label={t.contact.name}
              placeholder={t.contact.name}
              autoComplete="name"
              maxLength={80}
              {...register("name")}
              error={errorMessage(t, codeOf(errors.name))}
            />
            <Input
              tone="dark"
              label={t.contact.contact}
              placeholder={t.contact.contact}
              autoComplete="email"
              maxLength={120}
              {...contactField}
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (!value.includes("@") && isValidPhone(value)) setValue("contact", formatPhone(value));
                return contactField.onBlur(e);
              }}
              error={errorMessage(t, codeOf(errors.contact))}
            />
            <Textarea
              tone="dark"
              label={t.contact.message}
              placeholder={t.contact.message}
              rows={5}
              maxLength={2000}
              {...register("message")}
              error={errorMessage(t, codeOf(errors.message))}
            />

            <Button type="submit" disabled={createMessage.isPending} className="flex items-center gap-2 focus-visible:ring-offset-espresso">
              {createMessage.isPending ? t.states.sending : t.contact.send} <Send size={14} aria-hidden="true" />
            </Button>

            {createMessage.isError && (
              <p role="alert" className="text-sm text-clayLight font-body">
                {t.states.sendFailed}
              </p>
            )}

            <div role="status" aria-live="polite">
              {submitted && (
                <p className="text-sm flex items-center gap-2 text-green-400 font-body">
                  <Check size={14} aria-hidden="true" /> {t.contact.success}
                </p>
              )}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
});
