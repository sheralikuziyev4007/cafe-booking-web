import { useMemo, type ReactNode } from "react";
import { MenuContext } from "./menuContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { INITIAL_MENU } from "@/data/seedData";
import { parseMenu } from "@/utils/menuStorage";
import { generateId } from "@/utils/id";
import { moveInArray } from "@/utils/array";
import type { MenuItem, MenuItemInput } from "@/types";

// v3: multilingual names/descriptions + availability. Older saved menus (v2) are migrated by parseMenu.
const STORAGE_KEY = "coffee-and-co:menu:v3";
const LEGACY_KEY = "coffee-and-co:menu:v2";

function legacyMenu(): MenuItem[] {
  try {
    const stored = window.localStorage.getItem(LEGACY_KEY);
    return (stored && parseMenu(JSON.parse(stored))) || INITIAL_MENU;
  } catch {
    return INITIAL_MENU;
  }
}

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useLocalStorage<MenuItem[]>(STORAGE_KEY, legacyMenu, parseMenu);

  const value = useMemo(
    () => ({
      menu,
      addItem: (item: MenuItemInput) => setMenu((prev) => [...prev, { ...item, id: generateId() }]),
      updateItem: (id: string, item: MenuItemInput) => setMenu((prev) => prev.map((m) => (m.id === id ? { ...item, id } : m))),
      deleteItem: (id: string) => setMenu((prev) => prev.filter((m) => m.id !== id)),
      toggleAvailability: (id: string) =>
        setMenu((prev) => prev.map((m) => (m.id === id ? { ...m, isAvailable: !m.isAvailable } : m))),
      moveItem: (id: string, direction: -1 | 1) => setMenu((prev) => moveInArray(prev, id, direction)),
    }),
    [menu, setMenu]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}
