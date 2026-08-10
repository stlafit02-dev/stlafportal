import { createContext } from "react";

export interface TicketModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const TicketModalContext = createContext<TicketModalContextValue | undefined>(undefined);