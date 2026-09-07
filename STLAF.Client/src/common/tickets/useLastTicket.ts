import { useContext } from "react";
import { LastTicketContext } from "./LastTicketContext";

export function useLastTicket() {
  const context = useContext(LastTicketContext);
  if (!context) {
    throw new Error("useLastTicket must be used within a LastTicketProvider");
  }
  return context;
}
