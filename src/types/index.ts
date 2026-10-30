export type Lang = "en" | "ru" | "uz";

/** Text stored in every supported language. Empty strings fall back to another language. */
export type Localized = Record<Lang, string>;

export type Category = "coffee" | "desserts" | "breakfast" | "main";

export interface MenuItem {
  id: string;
  name: Localized;
  category: Category;
  /** Price in the site currency (see SITE.currency) */
  price: number;
  description: Localized;
  /** Image URL or local path (/images/...). Empty string shows a category icon placeholder. */
  imageUrl: string;
  /** false = item is on the stop-list: still shown on the menu, marked as unavailable */
  isAvailable: boolean;
}

export type MenuItemInput = Omit<MenuItem, "id">;

export interface Review {
  id: string;
  authorName: Localized;
  /** 1–5 */
  rating: number;
  text: Localized;
}

export interface ContactFormData {
  name: string;
  contact: string;
  message: string;
}

export interface BookingFormData {
  name: string;
  phone: string;
  /** As typed by the user: dd/mm/yyyy (converted to ISO on submit) */
  date: string;
  /** HH:MM */
  time: string;
  guests: string;
  comment: string;
}

export type BookingStatus = "new" | "confirmed" | "cancelled";

export interface Booking {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  comment: string;
  status: BookingStatus;
  /** ISO timestamp */
  createdAt: string;
}

export interface ContactMessage extends ContactFormData {
  id: string;
  read: boolean;
  /** ISO timestamp */
  createdAt: string;
}
