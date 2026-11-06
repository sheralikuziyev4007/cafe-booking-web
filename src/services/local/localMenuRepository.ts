import { INITIAL_MENU } from "@/data/seedData";
import { moveInArray } from "@/utils/array";
import { generateId } from "@/utils/id";
import { parseMenu } from "@/utils/menuStorage";
import type { MenuItem } from "@/types";
import type { MenuRepository } from "../types";
import { createJsonStore } from "./jsonStore";

// v3: multilingual names/descriptions + availability. Older saved menus (v2) are migrated by parseMenu.
export const MENU_STORAGE_KEY = "coffee-and-co:menu:v3";
const LEGACY_KEY = "coffee-and-co:menu:v2";

function legacyMenu(): MenuItem[] {
  try {
    const stored = window.localStorage.getItem(LEGACY_KEY);
    return (stored && parseMenu(JSON.parse(stored))) || INITIAL_MENU;
  } catch {
    return INITIAL_MENU;
  }
}

/** Demo storage: the menu lives in this browser's localStorage. */
export function createLocalMenuRepository(): MenuRepository {
  const store = createJsonStore<MenuItem[]>(MENU_STORAGE_KEY, parseMenu, legacyMenu);

  const change = (fn: (menu: MenuItem[]) => MenuItem[]) => {
    store.write(fn(store.read()));
    return Promise.resolve();
  };

  return {
    peek: () => store.read(),
    list: () => Promise.resolve(store.read()),
    create: (item) => change((menu) => [...menu, { ...item, id: generateId() }]),
    update: (id, item) => change((menu) => menu.map((m) => (m.id === id ? { ...item, id } : m))),
    remove: (id) => change((menu) => menu.filter((m) => m.id !== id)),
    setAvailability: (id, isAvailable) => change((menu) => menu.map((m) => (m.id === id ? { ...m, isAvailable } : m))),
    move: (id, direction) => change((menu) => moveInArray(menu, id, direction)),
  };
}
