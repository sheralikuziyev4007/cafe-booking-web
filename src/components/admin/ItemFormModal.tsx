import { useState } from "react";
import { CATEGORIES } from "@/data/seedData";
import { LANGS } from "@/i18n";
import { SITE } from "@/config/site";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MenuImage } from "@/components/ui/MenuImage";
import { useI18n } from "@/hooks/useI18n";
import { errorMessage } from "@/utils/formatters";
import { isValidImageUrl, validateMenuForm, type FormErrors, type MenuFormState } from "@/utils/validators";
import type { Category, Lang, MenuItem, MenuItemInput } from "@/types";

const EMPTY_TEXT = { en: "", ru: "", uz: "" };

const EMPTY_FORM: MenuFormState = {
  name: EMPTY_TEXT,
  category: "coffee",
  price: "",
  description: EMPTY_TEXT,
  imageUrl: "",
  isAvailable: true,
};

interface ItemFormModalProps {
  initial: MenuItem | null;
  onCancel: () => void;
  onSave: (data: MenuItemInput) => void;
}

const trimAll = (text: Record<Lang, string>) => ({ en: text.en.trim(), ru: text.ru.trim(), uz: text.uz.trim() });

export function ItemFormModal({ initial, onCancel, onSave }: ItemFormModalProps) {
  const { t, lang } = useI18n();
  const [editLang, setEditLang] = useState<Lang>(lang);
  const [form, setForm] = useState<MenuFormState>(initial ? { ...initial, price: String(initial.price) } : EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors<MenuFormState>>({});

  const categoryOptions = CATEGORIES.map((c) => ({ value: c, label: t.categories[c] }));
  const image = form.imageUrl.trim();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validateMenuForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    onSave({
      name: trimAll(form.name),
      description: trimAll(form.description),
      category: form.category,
      price: Number(form.price),
      imageUrl: image,
      isAvailable: form.isAvailable,
    });
  };

  return (
    <Modal title={initial ? t.admin.form.editTitle : t.admin.form.addTitle} onClose={onCancel} maxWidth="lg" closeLabel={t.admin.form.cancel}>
      <form onSubmit={handleSubmit} noValidate>
        <fieldset className="rounded-md border border-line p-4 mb-4">
          <legend className="px-1 text-xs text-copy font-body">{t.admin.form.translations}</legend>
          <div role="tablist" aria-label={t.controls.language} className="flex gap-1 mb-4">
            {LANGS.map((l) => {
              const filled = form.name[l.id].trim() !== "" && form.description[l.id].trim() !== "";
              return (
                <button
                  key={l.id}
                  type="button"
                  role="tab"
                  aria-selected={editLang === l.id}
                  onClick={() => setEditLang(l.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-body border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass ${
                    editLang === l.id ? "bg-inverse text-onInverse border-transparent" : "border-line text-copy hover:bg-pageAlt"
                  }`}
                >
                  {l.name} {filled ? "✓" : ""}
                </button>
              );
            })}
          </div>

          <div role="tabpanel" className="space-y-4" lang={editLang}>
            <Input
              label={`${t.admin.form.name} (${editLang.toUpperCase()})`}
              value={form.name[editLang]}
              maxLength={80}
              onChange={(e) => setForm({ ...form, name: { ...form.name, [editLang]: e.target.value } })}
              error={errorMessage(t, errors.name)}
            />
            <Textarea
              label={`${t.admin.form.description} (${editLang.toUpperCase()})`}
              rows={3}
              maxLength={200}
              value={form.description[editLang]}
              onChange={(e) => setForm({ ...form, description: { ...form.description, [editLang]: e.target.value } })}
              error={errorMessage(t, errors.description)}
            />
          </div>
          <p className="mt-3 text-xs text-copy/80 font-body">{t.admin.form.translationsHint}</p>
        </fieldset>

        <div className="grid sm:grid-cols-2 gap-4">
          <Select
            label={t.admin.form.category}
            value={form.category}
            options={categoryOptions}
            onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
          />
          <Input
            label={t.admin.form.price(SITE.currency.label[lang])}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="28000"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            error={errorMessage(t, errors.price)}
          />
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-4 items-start">
          <Input
            label={t.admin.form.imageUrl}
            type="text"
            inputMode="url"
            placeholder="/images/photo.webp · https://…"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            error={errorMessage(t, errors.imageUrl)}
          />
          <div>
            <p className="text-xs mb-1 text-copy font-body">{t.admin.form.preview}</p>
            <MenuImage
              src={image && isValidImageUrl(image) ? image : ""}
              alt=""
              category={form.category}
              className="w-[42px] h-[42px] rounded-sm border border-line"
              sizes="42px"
              iconSize={18}
            />
          </div>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-heading font-body cursor-pointer">
          <input
            type="checkbox"
            checked={form.isAvailable}
            onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
            className="w-4 h-4 accent-[#C9932E]"
          />
          {t.admin.form.available}
        </label>

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            {t.admin.form.cancel}
          </Button>
          <Button type="submit" className="flex-1">
            {t.admin.form.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
