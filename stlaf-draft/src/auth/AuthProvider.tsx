import { useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { login as loginApi, signup as signupApi, type ClientInfo } from "./authApi";

function getStoredUser(): ClientInfo | null {
  const stored = localStorage.getItem("stlaf_draft_user");
  return stored ? JSON.parse(stored) : null;
}

function getStoredToken(): string | null {
  return localStorage.getItem("stlaf_draft_token");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ClientInfo | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [isLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  function persist(newToken: string, newUser: ClientInfo) {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("stlaf_draft_token", newToken);
    localStorage.setItem("stlaf_draft_user", JSON.stringify(newUser));
  }

  async function login(email: string, password: string) {
    const result = await loginApi(email, password);
    persist(result.token, result.client);
  }

  async function signup(email: string, password: string, fullName: string) {
    const result = await signupApi(email, password, fullName);
    persist(result.token, result.client);
  }

  async function logout() {
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    setToken(null);
    setUser(null);
    localStorage.removeItem("stlaf_draft_token");
    localStorage.removeItem("stlaf_draft_user");
    setIsLoggingOut(false);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, login, signup, logout, isLoading, isLoggingOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
