import { useContext } from "react";
import { TicketModalContext } from "./TicketModalContext";

export function useTicketModal() {
  const context = useContext(TicketModalContext);
  if (!context) {
    throw new Error("useTicketModal must be used within a TicketModalProvider");
  }
  return context;
}