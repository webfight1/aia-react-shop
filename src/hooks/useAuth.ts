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
import { getCart, clearCartToken } from "@/lib/cart";

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

  // After successful login, move guest cart items into customer cart.
  const mergeGuestCart = useCallback(async () => {
    try {
      const guest = await getCart();
      const items = guest?.items ?? [];
      for (const it of items) {
        try { await addToCustomerCart(it.product_id, it.quantity); } catch { /* ignore */ }
      }
    } catch { /* ignore */ }
    clearCartToken();
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  }, [queryClient]);

  const login = useCallback(async (input: LoginInput) => {
    const u = await apiLogin(input);
    setUser(u);
    await mergeGuestCart();
    return u;
  }, [mergeGuestCart]);

  const register = useCallback(async (input: RegisterInput) => {
    const u = await apiRegister(input);
    setUser(u);
    await mergeGuestCart();
    return u;
  }, [mergeGuestCart]);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    clearCartToken();
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
