import { createContext } from "react";
import type { Services } from "@/services/types";

export const ServicesContext = createContext<Services | undefined>(undefined);
