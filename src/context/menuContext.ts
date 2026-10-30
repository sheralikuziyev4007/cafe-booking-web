import { createContext } from "react";
import type { MenuItem, MenuItemInput } from "@/types";

export interface MenuContextValue {
  menu: MenuItem[];
  addItem: (item: MenuItemInput) => void;
  updateItem: (id: string, item: MenuItemInput) => void;
  deleteItem: (id: string) => void;
  toggleAvailability: (id: string) => void;
  /** Moves an item one position up (-1) or down (+1); the order is used on the landing page */
  moveItem: (id: string, direction: -1 | 1) => void;
}

export const MenuContext = createContext<MenuContextValue | undefined>(undefined);
