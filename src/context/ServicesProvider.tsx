import type { ReactNode } from "react";
import type { Services } from "@/services/types";
import { ServicesContext } from "./servicesContext";

/** Makes the data layer (menu, inbox, auth) available to hooks. Tests pass fake services here. */
export function ServicesProvider({ services, children }: { services: Services; children: ReactNode }) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}
