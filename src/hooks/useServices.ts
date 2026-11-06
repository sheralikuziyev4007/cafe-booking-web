import { useContext } from "react";
import { ServicesContext } from "@/context/servicesContext";

export function useServices() {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error("useServices must be used within a ServicesProvider");
  return ctx;
}
