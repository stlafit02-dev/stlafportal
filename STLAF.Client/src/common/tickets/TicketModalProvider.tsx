import { useState, type ReactNode } from "react";
import { TicketModalContext } from "./TicketModalContext";
import { SubmitTicketModal } from "./SubmitTicketModal";

export function TicketModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TicketModalContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
      <SubmitTicketModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </TicketModalContext.Provider>
  );
}