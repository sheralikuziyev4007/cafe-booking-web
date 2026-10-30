import { Modal } from "@/components/ui/Modal";
import { MenuImage } from "@/components/ui/MenuImage";
import { useI18n } from "@/hooks/useI18n";
import { formatMoney } from "@/utils/formatters";
import type { MenuItem } from "@/types";

interface MenuItemModalProps {
  item: MenuItem;
  title: string;
  onClose: () => void;
}

export function MenuItemModal({ item, title, onClose }: MenuItemModalProps) {
  const { t, lang, pick } = useI18n();

  return (
    <Modal ariaLabel={title} onClose={onClose} maxWidth="lg" closeLabel={t.menu.close} flush>
      <MenuImage
        src={item.imageUrl}
        alt={title}
        category={item.category}
        className="aspect-[16/10] w-full"
        sizes="(min-width: 720px) 672px, 92vw"
        imgClassName={item.isAvailable ? "" : "grayscale"}
        iconSize={56}
      />
      <div className="p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-accent font-body mb-2">{t.categories[item.category]}</p>
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
          <h2 className="text-2xl md:text-3xl italic text-heading font-display">{title}</h2>
          <span className="text-lg text-accent font-body font-medium">{formatMoney(item.price, lang)}</span>
        </div>
        <p className="leading-relaxed text-copy font-body">{pick(item.description)}</p>
        {!item.isAvailable && (
          <p className="mt-4 inline-block px-3 py-1 rounded-full text-xs bg-inverse text-onInverse font-body">{t.menu.unavailable}</p>
        )}
      </div>
    </Modal>
  );
}
