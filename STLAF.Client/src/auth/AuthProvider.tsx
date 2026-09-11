import { useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { login as loginApi, logout as logoutApi, type UserInfo } from "./authApi";

function getStoredUser(): UserInfo | null {
  const stored = localStorage.getItem("stlaf_user");
  return stored ? JSON.parse(stored) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(getStoredUser);
  const [isLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function login(email: string, password: string) {
    const result = await loginApi(email, password);
    setUser(result.user);
    localStorage.setItem("stlaf_user", JSON.stringify(result.user));
  }

  async function logout() {
    setIsLoggingOut(true);

    await Promise.all([
      logoutApi().catch(() => {}),
      new Promise((resolve) => setTimeout(resolve, 400)),
    ]);

    setUser(null);
    localStorage.removeItem("stlaf_user");
    setIsLoggingOut(false);
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, isLoading, isLoggingOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}