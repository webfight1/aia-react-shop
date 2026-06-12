import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getStoredUser,
  getAuthToken,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  addToCustomerCart,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
} from "@/lib/auth";
import { getCart } from "@/lib/cart";

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

  // After login, try to sync existing guest cart items into the customer cart.
  // Best-effort — if the server merges automatically, this is a no-op; failures are silent.
  const syncGuestCart = useCallback(async () => {
    try {
      const guest = await getCart();
      const items = guest?.items ?? [];
      for (const it of items) {
        try { await addToCustomerCart(it.product_id, it.quantity); } catch { /* ignore */ }
      }
    } catch { /* ignore */ }
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  }, [queryClient]);

  const login = useCallback(async (input: LoginInput) => {
    const u = await apiLogin(input);
    setUser(u);
    void syncGuestCart();
    return u;
  }, [syncGuestCart]);

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
