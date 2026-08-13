import { createContext } from "react";

export interface DocumentModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const DocumentModalContext = createContext<DocumentModalContextValue | undefined>(undefined);