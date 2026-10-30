import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useI18n } from "@/hooks/useI18n";

interface ConfirmModalProps {
  text: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({ text, onCancel, onConfirm }: ConfirmModalProps) {
  const { t } = useI18n();

  return (
    <Modal ariaLabel={t.admin.confirm.title} onClose={onCancel} maxWidth="sm">
      <p className="text-sm mb-6 text-heading font-body">{text}</p>
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          {t.admin.confirm.cancel}
        </Button>
        <Button variant="danger" className="flex-1" onClick={onConfirm}>
          {t.admin.confirm.delete}
        </Button>
      </div>
    </Modal>
  );
}
