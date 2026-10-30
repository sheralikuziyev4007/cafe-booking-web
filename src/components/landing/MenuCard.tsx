import { formatMoney } from "@/utils/formatters";
import { useI18n } from "@/hooks/useI18n";
import { MenuImage } from "@/components/ui/MenuImage";
import type { MenuItem } from "@/types";

interface MenuCardProps {
  item: MenuItem;
  onOpen: () => void;
}

export function MenuCard({ item, onOpen }: MenuCardProps) {
  const { t, lang, pick } = useI18n();
  const name = pick(item.name);

  return (
    <article
      className={`group relative h-full rounded-md bg-card border border-line overflow-hidden flex flex-col transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 focus-within:ring-2 focus-within:ring-brass ${
        item.isAvailable ? "" : "opacity-75"
      }`}
    >
      <div className="relative">
        <MenuImage
          src={item.imageUrl}
          alt={name}
          category={item.category}
          className="aspect-[4/3] w-full"
          sizes="(min-width: 1152px) 352px, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
          imgClassName={`transition-transform duration-500 group-hover:scale-105 ${item.isAvailable ? "" : "grayscale"}`}
          iconSize={40}
        />
        {!item.isAvailable && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs bg-espresso/90 text-cream font-body">
            {t.menu.unavailable}
          </span>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-lg italic text-heading font-display">
            {/* Stretched button: the whole card is clickable, while the markup stays valid */}
            <button
              type="button"
              onClick={onOpen}
              aria-label={t.menu.details(name)}
              className="text-left after:absolute after:inset-0 focus-visible:outline-none"
            >
              {name}
            </button>
          </h3>
          <span className="text-sm whitespace-nowrap text-accent font-body font-medium">{formatMoney(item.price, lang)}</span>
        </div>
        <p className="text-sm leading-relaxed text-copy font-body">{pick(item.description)}</p>
        <p className="text-xs mt-auto pt-3 uppercase tracking-wider text-copy/80 font-body">{t.categories[item.category]}</p>
      </div>
    </article>
  );
}
