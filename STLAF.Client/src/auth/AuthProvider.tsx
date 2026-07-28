import { useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { login as loginApi, type UserInfo } from "./authApi";

function getStoredUser(): UserInfo | null {
  const stored = localStorage.getItem("stlaf_user");
  return stored ? JSON.parse(stored) : null;
}

function getStoredToken(): string | null {
  return localStorage.getItem("stlaf_token");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [isLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function login(email: string, password: string) {
    const result = await loginApi(email, password);
    setToken(result.token);
    setUser(result.user);
    localStorage.setItem("stlaf_token", result.token);
    localStorage.setItem("stlaf_user", JSON.stringify(result.user));
  }

  async function logout() {
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    setToken(null);
    setUser(null);
    localStorage.removeItem("stlaf_token");
    localStorage.removeItem("stlaf_user");
    setIsLoggingOut(false);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, login, logout, isLoading, isLoggingOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}