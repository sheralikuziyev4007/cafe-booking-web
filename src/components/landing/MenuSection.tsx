import { forwardRef, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useMenu } from "@/hooks/useMenu";
import { useI18n } from "@/hooks/useI18n";
import { CATEGORIES } from "@/data/seedData";
import { CATEGORY_ICONS } from "@/data/categoryIcons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { MenuCard } from "./MenuCard";
import { CategoryTab } from "./CategoryTab";
import { MenuItemModal } from "./MenuItemModal";
import type { Category, MenuItem } from "@/types";

export const MenuSection = forwardRef<HTMLElement>(function MenuSection(_props, ref) {
  const { menu } = useMenu();
  const { t, pick } = useI18n();
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MenuItem | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      menu.filter((item) => {
        if (activeCategory !== "all" && item.category !== activeCategory) return false;
        if (!normalizedQuery) return true;
        // Search in every language, so "латте" and "latte" both work regardless of the UI language
        const haystack = [...Object.values(item.name), ...Object.values(item.description)].join(" ").toLowerCase();
        return haystack.includes(normalizedQuery);
      }),
    [menu, activeCategory, normalizedQuery]
  );

  return (
    <section ref={ref} className="bg-pageAlt py-20 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <SectionHeading eyebrow={t.menu.eyebrow} title={t.menu.title} />
        </Reveal>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-10">
          <div className="flex flex-wrap gap-2" role="group" aria-label={t.menu.categoriesLabel}>
            <CategoryTab active={activeCategory === "all"} label={t.menu.all} onClick={() => setActiveCategory("all")} />
            {CATEGORIES.map((c) => (
              <CategoryTab
                key={c}
                active={activeCategory === c}
                label={t.categories[c]}
                icon={CATEGORY_ICONS[c]}
                onClick={() => setActiveCategory(c)}
              />
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <label htmlFor="menu-search" className="sr-only">
              {t.menu.searchLabel}
            </label>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-copy/60" aria-hidden="true" />
            <input
              id="menu-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.menu.searchPlaceholder}
              className="w-full pl-9 pr-9 py-2.5 rounded-full text-sm border border-line bg-field text-heading placeholder:text-copy/75 font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={t.menu.clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-copy/80 hover:text-heading"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <div aria-live="polite">
          {filtered.length === 0 ? (
            <p className="text-copy font-body">{normalizedQuery ? t.menu.noResults(query.trim()) : t.menu.empty}</p>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item, index) => (
                <li key={item.id}>
                  <Reveal delay={(index % 3) * 90} className="h-full">
                    <MenuCard item={item} onOpen={() => setSelected(item)} />
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {selected && (
        <MenuItemModal
          item={selected}
          title={pick(selected.name)}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
});
