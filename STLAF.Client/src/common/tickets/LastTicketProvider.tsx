import { useState, type ReactNode } from "react";
import { LastTicketContext } from "./LastTicketContext";

export function LastTicketProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);

  return (
    <LastTicketContext.Provider value={{ version, notifyTicketSubmitted: () => setVersion((v) => v + 1) }}>
      {children}
    </LastTicketContext.Provider>
  );
}
