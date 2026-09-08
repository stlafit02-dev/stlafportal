import { useState, type ReactNode } from "react";
import { TicketModalContext } from "./TicketModalContext";
import { SubmitTicketModal } from "./SubmitTicketModal";
import { Toast } from "../components/Toast/Toast";
import { useLastTicket } from "./useLastTicket";

export function TicketModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { notifyTicketSubmitted } = useLastTicket();

  return (
    <TicketModalContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
      <SubmitTicketModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmitted={(ticketNumber) => {
          setToastMessage(`Ticket ${ticketNumber} submitted.`);
          notifyTicketSubmitted();
        }}
      />
      <Toast message={toastMessage ?? ""} isVisible={!!toastMessage} onClose={() => setToastMessage(null)} />
    </TicketModalContext.Provider>
  );
}
