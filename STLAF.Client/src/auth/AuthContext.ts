import { createContext } from "react";
import type { UserInfo } from "./authApi";

export interface AuthContextValue {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isLoggingOut: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);