import { createContext } from "react";

export interface LastTicketContextValue {
  /** Bumped every time a ticket is successfully submitted, so LastTicketCard knows to refetch. */
  version: number;
  notifyTicketSubmitted: () => void;
}

export const LastTicketContext = createContext<LastTicketContextValue | undefined>(undefined);
