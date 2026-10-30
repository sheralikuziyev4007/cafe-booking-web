import { forwardRef, useEffect, useRef, useState } from "react";
import { MapPin, Phone, Clock, Instagram, Send, Check, ExternalLink } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { SITE } from "@/config/site";
import { useI18n } from "@/hooks/useI18n";
import { useInbox } from "@/hooks/useInbox";
import { validateContactForm, type FormErrors } from "@/utils/validators";
import { errorMessage } from "@/utils/formatters";
import { formatPhone, isValidPhone } from "@/utils/phone";
import type { ContactFormData } from "@/types";

const EMPTY_FORM: ContactFormData = { name: "", contact: "", message: "" };

export const Contact = forwardRef<HTMLElement>(function Contact(_props, ref) {
  const { t, pick } = useI18n();
  const { addMessage } = useInbox();
  const [form, setForm] = useState<ContactFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors<ContactFormData>>({});
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<number>();

  // Don't leave a pending timer after unmount
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validateContactForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const contact = form.contact.trim();
    const data = {
      name: form.name.trim(),
      // Phone numbers are stored in one format: +998 90 123 45 67
      contact: contact.includes("@") ? contact : formatPhone(contact),
      message: form.message.trim(),
    };
    addMessage(data);
    setForm(EMPTY_FORM);
    setSubmitted(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setSubmitted(false), 5000);
  };

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
          <form onSubmit={handleSubmit} noValidate className="space-y-4 self-start" aria-label={t.contact.formLabel}>
            <Input
              tone="dark"
              label={t.contact.name}
              placeholder={t.contact.name}
              autoComplete="name"
              maxLength={80}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errorMessage(t, errors.name)}
            />
            <Input
              tone="dark"
              label={t.contact.contact}
              placeholder={t.contact.contact}
              autoComplete="email"
              maxLength={120}
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              onBlur={() => {
                const value = form.contact.trim();
                if (!value.includes("@") && isValidPhone(value)) setForm({ ...form, contact: formatPhone(value) });
              }}
              error={errorMessage(t, errors.contact)}
            />
            <Textarea
              tone="dark"
              label={t.contact.message}
              placeholder={t.contact.message}
              rows={5}
              maxLength={2000}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              error={errorMessage(t, errors.message)}
            />

            <Button type="submit" className="flex items-center gap-2 focus-visible:ring-offset-espresso">
              {t.contact.send} <Send size={14} aria-hidden="true" />
            </Button>

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
