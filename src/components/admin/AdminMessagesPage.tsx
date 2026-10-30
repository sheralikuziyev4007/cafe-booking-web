import { useState } from "react";
import { CheckCheck, Trash2 } from "lucide-react";
import { useInbox } from "@/hooks/useInbox";
import { useI18n } from "@/hooks/useI18n";
import { formatDateTime } from "@/utils/formatters";
import { isValidEmail } from "@/utils/validators";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "./ConfirmModal";
import type { ContactMessage } from "@/types";

/** mailto: or tel: link for the contact the visitor left */
function contactHref(contact: string): string {
  return isValidEmail(contact) ? `mailto:${contact}` : `tel:${contact.replace(/[^\d+]/g, "")}`;
}

export function AdminMessagesPage() {
  const { messages, markMessageRead, deleteMessage } = useInbox();
  const { t, lang } = useI18n();
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);

  return (
    <>
      <h1 className="text-2xl italic text-heading font-display mb-6">{t.admin.messages.title}</h1>

      {messages.length === 0 ? (
        <p className="py-10 text-center text-copy font-body rounded-md border border-dashed border-line">{t.admin.messages.empty}</p>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id} className={`p-4 sm:p-5 rounded-md bg-card border ${m.read ? "border-line" : "border-brass"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-heading font-body font-medium">{m.name}</p>
                    <a href={contactHref(m.contact)} className="text-sm text-accent hover:underline underline-offset-2 font-body break-all">
                      {m.contact}
                    </a>
                    {!m.read && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-brass text-espresso font-body">{t.admin.messages.new}</span>
                    )}
                  </div>
                  <p className="text-sm text-copy font-body whitespace-pre-line break-words">{m.message}</p>
                  <p className="mt-2 text-xs text-copy/80 font-body">{formatDateTime(m.createdAt, lang)}</p>
                </div>
                <div className="flex gap-2">
                  {!m.read && (
                    <Button variant="outline" onClick={() => markMessageRead(m.id)} className="!py-1.5 flex items-center gap-1.5">
                      <CheckCheck size={14} aria-hidden="true" /> {t.admin.messages.markRead}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setDeleteTarget(m)}
                    className="!py-1.5 !text-danger"
                    aria-label={`${t.admin.messages.delete}: ${m.name}`}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {deleteTarget && (
        <ConfirmModal
          text={t.admin.messages.confirmDelete(deleteTarget.name)}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            deleteMessage(deleteTarget.id);
            setDeleteTarget(null);
          }}
        />
      )}
    </>
  );
}
