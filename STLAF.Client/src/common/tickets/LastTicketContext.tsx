import { createContext } from "react";

export interface LastTicketContextValue {
  version: number;
  notifyTicketSubmitted: () => void;
}

export const LastTicketContext = createContext<LastTicketContextValue | undefined>(undefined);
