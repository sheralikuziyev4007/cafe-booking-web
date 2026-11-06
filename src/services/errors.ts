/** The chosen date and time already has as many active bookings as the cafe can seat */
export class SlotFullError extends Error {
  constructor() {
    super("SLOT_FULL");
    this.name = "SlotFullError";
  }
}
