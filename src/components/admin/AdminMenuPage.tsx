import { useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useMenu, useMenuActions } from "@/hooks/useMenu";
import { useI18n } from "@/hooks/useI18n";
import { formatMoney } from "@/utils/formatters";
import { Button } from "@/components/ui/Button";
import { MenuImage } from "@/components/ui/MenuImage";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ActionError } from "./ActionError";
import { ItemFormModal } from "./ItemFormModal";
import { ConfirmModal } from "./ConfirmModal";
import { AvailabilitySwitch } from "./AvailabilitySwitch";
import type { MenuItem, MenuItemInput } from "@/types";

const EMPTY_MENU: MenuItem[] = [];
const SKELETON_ROWS = 5;

const ICON_BUTTON =
  "p-1.5 rounded-sm text-copy hover:text-heading hover:bg-pageAlt disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass";

export function AdminMenuPage() {
  const { data, isError, isFetching, refetch } = useMenu();
  const { addItem, updateItem, deleteItem, toggleAvailability, moveItem } = useMenuActions();
  const menu = data ?? EMPTY_MENU;
  const { t, lang, pick } = useI18n();
  // A quick change (hide, move, delete…) failed and was rolled back
  const [actionFailed, setActionFailed] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  const openForm = (item: MenuItem | null) => {
    addItem.reset();
    updateItem.reset();
    setEditingItem(item);
    setFormOpen(true);
  };
  const openAddForm = () => openForm(null);
  const openEditForm = (item: MenuItem) => openForm(item);

  const closeForm = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  // The form closes only after the request succeeds; on failure it stays open with an error message
  const handleSave = (input: MenuItemInput) => {
    if (editingItem) updateItem.mutate({ id: editingItem.id, item: input }, { onSuccess: closeForm });
    else addItem.mutate(input, { onSuccess: closeForm });
  };

  const confirmDelete = () => {
    if (deleteTarget) deleteItem.mutate(deleteTarget.id, { onError: () => setActionFailed(true) });
    setDeleteTarget(null);
  };

  const quickAction = { onSuccess: () => setActionFailed(false), onError: () => setActionFailed(true) };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl italic text-heading font-display">{t.admin.menu.title(data ? menu.length : 0)}</h1>
        <Button onClick={openAddForm} className="flex items-center gap-2">
          <Plus size={16} aria-hidden="true" /> {t.admin.menu.add}
        </Button>
      </div>

      {actionFailed && <ActionError onDismiss={() => setActionFailed(false)} />}

      {!data && isError ? (
        <ErrorState onRetry={() => void refetch()} retrying={isFetching} />
      ) : (
        <div className="rounded-md border border-line overflow-x-auto bg-card" aria-busy={!data}>
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
                        <AvailabilitySwitch item={item} name={name} onToggle={() => toggleAvailability.mutate({ id: item.id, isAvailable: !item.isAvailable }, quickAction)} />
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-copy">{t.categories[item.category]}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-copy whitespace-nowrap">{formatMoney(item.price, lang)}</td>
                    <td className="hidden sm:table-cell px-4 py-3">
                      <AvailabilitySwitch item={item} name={name} onToggle={() => toggleAvailability.mutate({ id: item.id, isAvailable: !item.isAvailable }, quickAction)} />
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex justify-end items-center gap-0.5 sm:gap-1">
                        <button
                          onClick={() => moveItem.mutate({ id: item.id, direction: -1 }, quickAction)}
                          disabled={index === 0}
                          className={ICON_BUTTON}
                          aria-label={t.admin.menu.moveUp(name)}
                        >
                          <ArrowUp size={15} aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => moveItem.mutate({ id: item.id, direction: 1 }, quickAction)}
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
              {!data &&
                Array.from({ length: SKELETON_ROWS }, (_, i) => (
                  <tr key={i} className="border-t border-line" aria-hidden="true">
                    <td className="px-3 sm:px-4 py-3">
                      <Skeleton className="w-12 h-12" />
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="hidden md:table-cell px-4 py-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="hidden md:table-cell px-4 py-3">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3">
                      <Skeleton className="h-5 w-24" />
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <Skeleton className="h-6 w-24 ml-auto" />
                    </td>
                  </tr>
                ))}
              {data && menu.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-copy">
                    {t.admin.menu.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {!data && (
            <span role="status" className="sr-only">
              {t.states.loading}
            </span>
          )}
        </div>
      )}

      {formOpen && (
        <ItemFormModal
          initial={editingItem}
          onCancel={closeForm}
          onSave={handleSave}
          saving={addItem.isPending || updateItem.isPending}
          saveFailed={addItem.isError || updateItem.isError}
        />
      )}

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
