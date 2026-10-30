import { useContext } from "react";
import { InboxContext } from "@/context/inboxContext";

export function useInbox() {
  const ctx = useContext(InboxContext);
  if (!ctx) throw new Error("useInbox must be used within an InboxProvider");
  return ctx;
}
