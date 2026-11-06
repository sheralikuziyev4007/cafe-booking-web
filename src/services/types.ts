import type { Booking, BookingStatus, ContactMessage, MenuItem, MenuItemInput, NewBooking, NewMessage } from "@/types";

/**
 * The data layer is described by these interfaces. The UI only talks to them (through the hooks in src/hooks),
 * so the same screens work with the demo storage (localStorage) and with a real backend (Supabase).
 */

export interface MenuRepository {
  /** Synchronous snapshot, available only when the data is stored locally. It avoids a loading state on the first render. */
  peek?: () => MenuItem[];
  list: () => Promise<MenuItem[]>;
  /** The new item is added to the end of the menu */
  create: (item: MenuItemInput) => Promise<void>;
  update: (id: string, item: MenuItemInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setAvailability: (id: string, isAvailable: boolean) => Promise<void>;
  /** Moves an item one position up (-1) or down (+1); the order is used on the landing page */
  move: (id: string, direction: -1 | 1) => Promise<void>;
}

export interface InboxRepository {
  peekBookings?: () => Booking[];
  peekMessages?: () => ContactMessage[];
  listBookings: () => Promise<Booking[]>;
  createBooking: (booking: NewBooking) => Promise<void>;
  setBookingStatus: (id: string, status: BookingStatus) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  listMessages: () => Promise<ContactMessage[]>;
  createMessage: (message: NewMessage) => Promise<void>;
  markMessageRead: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
}

/**
 * ok        — signed in as an admin
 * invalid   — wrong credentials
 * forbidden — the account exists but is not an admin
 * error     — the server could not be reached
 */
export type LoginResult = "ok" | "invalid" | "forbidden" | "error";

export interface AuthService {
  /** What the login form asks for: a demo username or a real email address */
  readonly identifierType: "username" | "email";
  /** Synchronous session check, available only for the demo auth. It avoids a loading state on the first render. */
  peekSession?: () => boolean;
  getSession: () => Promise<boolean>;
  /** Called whenever the session changes (sign-in, sign-out, expiry). Returns an unsubscribe function. */
  onChange: (listener: (authenticated: boolean) => void) => () => void;
  signIn: (identifier: string, password: string) => Promise<LoginResult>;
  signOut: () => Promise<void>;
}

export interface Services {
  /** "local" = demo mode, data in this browser; "supabase" = real backend */
  mode: "local" | "supabase";
  menu: MenuRepository;
  inbox: InboxRepository;
  auth: AuthService;
}
