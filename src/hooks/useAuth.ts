import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getStoredUser,
  getAuthToken,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
} from "@/lib/auth";

export function useAuth() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setIsReady(true);
    const onChange = () => setUser(getStoredUser());
    window.addEventListener("auth:changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("auth:changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const u = await apiLogin(input);
    setUser(u);
    // Server merged the guest cart into the customer account; refresh cart view.
    queryClient.invalidateQueries({ queryKey: ["cart"] });
    return u;
  }, [queryClient]);

  const register = useCallback(async (input: RegisterInput) => {
    const u = await apiRegister(input);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  }, [queryClient]);

  return {
    user,
    isAuthenticated: !!user || !!getAuthToken(),
    isReady,
    login,
    register,
    logout,
  };
}
