import { createContext } from "react";
import type { ClientInfo } from "./authApi";

export interface AuthContextValue {
  user: ClientInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isLoggingOut: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
