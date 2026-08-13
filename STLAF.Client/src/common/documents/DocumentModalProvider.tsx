import { useState, type ReactNode } from "react";
import { DocumentModalContext } from "./DocumentModalContext";
import { SubmitDocumentModal } from "./SubmitDocumentModal";

export function DocumentModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DocumentModalContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
      <SubmitDocumentModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </DocumentModalContext.Provider>
  );
}