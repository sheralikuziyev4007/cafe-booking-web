import { useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useMenu } from "@/hooks/useMenu";
import { useI18n } from "@/hooks/useI18n";
import { formatMoney } from "@/utils/formatters";
import { Button } from "@/components/ui/Button";
import { MenuImage } from "@/components/ui/MenuImage";
import { ItemFormModal } from "./ItemFormModal";
import { ConfirmModal } from "./ConfirmModal";
import { AvailabilitySwitch } from "./AvailabilitySwitch";
import type { MenuItem, MenuItemInput } from "@/types";

const ICON_BUTTON =
  "p-1.5 rounded-sm text-copy hover:text-heading hover:bg-pageAlt disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass";

export function AdminMenuPage() {
  const { menu, addItem, updateItem, deleteItem, toggleAvailability, moveItem } = useMenu();
  const { t, lang, pick } = useI18n();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  const openAddForm = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const openEditForm = (item: MenuItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleSave = (data: MenuItemInput) => {
    if (editingItem) updateItem(editingItem.id, data);
    else addItem(data);
    closeForm();
  };

  const confirmDelete = () => {
    if (deleteTarget) deleteItem(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl italic text-heading font-display">{t.admin.menu.title(menu.length)}</h1>
        <Button onClick={openAddForm} className="flex items-center gap-2">
          <Plus size={16} aria-hidden="true" /> {t.admin.menu.add}
        </Button>
      </div>

      <div className="rounded-md border border-line overflow-x-auto bg-card">
        <table className="w-full text-sm font-body">
          <caption className="sr-only">{t.admin.menu.caption}</caption>
          <thead>
            <tr className="bg-pageAlt text-copy">
              <th scope="col" className="text-left px-3 sm:px-4 py-3 font-normal w-16 sm:w-20">
                {t.admin.menu.photo}
              </th>
              <th scope="col" className="text-left px-3 sm:px-4 py-3 font-normal">
                {t.admin.menu.name}
              </th>
              <th scope="col" className="hidden md:table-cell text-left px-4 py-3 font-normal">
                {t.admin.menu.category}
              </th>
              <th scope="col" className="hidden md:table-cell text-left px-4 py-3 font-normal">
                {t.admin.menu.price}
              </th>
              <th scope="col" className="hidden sm:table-cell text-left px-4 py-3 font-normal">
                {t.admin.menu.status}
              </th>
              <th scope="col" className="text-right px-3 sm:px-4 py-3 font-normal">
                {t.admin.menu.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {menu.map((item, index) => {
              const name = pick(item.name);
              return (
                <tr key={item.id} className="border-t border-line">
                  <td className="px-3 sm:px-4 py-3">
                    <MenuImage
                      src={item.imageUrl}
                      alt=""
                      category={item.category}
                      className="w-12 h-12 rounded-sm"
                      sizes="48px"
                      imgClassName={item.isAvailable ? "" : "grayscale"}
                      iconSize={20}
                    />
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-heading">
                    {name}
                    {/* On small screens category, price and status are shown under the name */}
                    <span className="block md:hidden text-xs text-copy mt-0.5">
                      {t.categories[item.category]} · {formatMoney(item.price, lang)}
                    </span>
                    <span className="sm:hidden mt-2 block">
                      <AvailabilitySwitch item={item} name={name} onToggle={() => toggleAvailability(item.id)} />
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-copy">{t.categories[item.category]}</td>
                  <td className="hidden md:table-cell px-4 py-3 text-copy whitespace-nowrap">{formatMoney(item.price, lang)}</td>
                  <td className="hidden sm:table-cell px-4 py-3">
                    <AvailabilitySwitch item={item} name={name} onToggle={() => toggleAvailability(item.id)} />
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex justify-end items-center gap-0.5 sm:gap-1">
                      <button
                        onClick={() => moveItem(item.id, -1)}
                        disabled={index === 0}
                        className={ICON_BUTTON}
                        aria-label={t.admin.menu.moveUp(name)}
                      >
                        <ArrowUp size={15} aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => moveItem(item.id, 1)}
                        disabled={index === menu.length - 1}
                        className={ICON_BUTTON}
                        aria-label={t.admin.menu.moveDown(name)}
                      >
                        <ArrowDown size={15} aria-hidden="true" />
                      </button>
                      <button onClick={() => openEditForm(item)} className={ICON_BUTTON} aria-label={t.admin.menu.edit(name)}>
                        <Pencil size={15} aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className={`${ICON_BUTTON} !text-danger`}
                        aria-label={t.admin.menu.delete(name)}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {menu.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-copy">
                  {t.admin.menu.empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formOpen && <ItemFormModal initial={editingItem} onCancel={closeForm} onSave={handleSave} />}

      {deleteTarget && (
        <ConfirmModal
          text={t.admin.menu.confirmDelete(pick(deleteTarget.name))}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
