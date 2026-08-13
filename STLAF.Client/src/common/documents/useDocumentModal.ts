import { useContext } from "react";
import { DocumentModalContext } from "./DocumentModalContext";

export function useDocumentModal() {
  const context = useContext(DocumentModalContext);
  if (!context) throw new Error("useDocumentModal must be used within a DocumentModalProvider");
  return context;
}