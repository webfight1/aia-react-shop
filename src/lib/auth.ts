// Bagisto customer (Sanctum) authentication client.
const BASE = "https://aiamaailm.webfight.shop";

export const AUTH_TOKEN_KEY = "aiamaailm_auth_token";
export const AUTH_USER_KEY = "aiamaailm_user";

export interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  [key: string]: unknown;
}

export class AuthApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(AUTH_TOKEN_KEY); } catch { return null; }
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch { return null; }
}

export function setAuth(token: string, user: AuthUser) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("auth:changed"));
  } catch { /* ignore */ }
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    window.dispatchEvent(new Event("auth:changed"));
  } catch { /* ignore */ }
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

async function authApi<T = unknown>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...((opts.headers as Record<string, string>) ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  let json: unknown = {};
  try { json = await res.json(); } catch { /* empty */ }

  if (res.status === 401 && token) {
    const isAuthCritical = path.includes("/customer/get") || path.includes("/customer/profile");
    if (isAuthCritical) clearAuth();
    throw new AuthApiError("Sessioon on aegunud", 401);
  }

  if (!res.ok) {
    const j = json as { message?: string; errors?: Record<string, string[]> };
    throw new AuthApiError(j?.message ?? `HTTP ${res.status}`, res.status, j?.errors);
  }
  return json as T;
}

// -------- Auth flows --------

export interface LoginInput { email: string; password: string; }
export interface RegisterInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  is_subscribed?: boolean;
}

interface AuthResponse {
  token?: string;
  data?: AuthUser;
  message?: string;
  cart_merged?: boolean;
}

export interface LoginResult {
  user: AuthUser;
  cartMerged: boolean;
}

export async function login(input: LoginInput): Promise<AuthUser> {
  // Lazy import to avoid circular dep with cart.ts
  const { getCartToken, clearCartToken } = await import("@/lib/cart");
  const cartToken = getCartToken();
  const res = await authApi<AuthResponse>("/api/v1/customer/login", {
    method: "POST",
    headers: cartToken ? { "X-Cart-Token": cartToken } : undefined,
    body: JSON.stringify({ ...input, device_name: "browser" }),
  });
  if (!res.token || !res.data) throw new AuthApiError("Sisselogimine ebaõnnestus", 500);
  setAuth(res.token, res.data);
  // Server side bound the guest cart to the customer; drop the guest token.
  if (cartToken) clearCartToken();
  return res.data;
}

export async function register(input: RegisterInput): Promise<AuthUser> {
  const res = await authApi<AuthResponse>("/api/v1/customer/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  // Bagisto register returns only a confirmation message (no token).
  // If a token came back, use it; otherwise log in to obtain one.
  if (res.token && res.data) {
    setAuth(res.token, res.data);
    return res.data;
  }
  return await login({ email: input.email, password: input.password });
}

export async function logout(): Promise<void> {
  if (getAuthToken()) {
    try { await authApi("/api/v1/customer/logout", { method: "POST" }); } catch { /* ignore */ }
  }
  clearAuth();
}

export async function forgotPassword(email: string): Promise<void> {
  await authApi("/api/v1/customer/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(payload: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  await authApi("/api/v1/customer/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!getAuthToken()) return null;
  const res = await authApi<{ data: AuthUser }>("/api/v1/customer/get", { method: "GET" });
  const user = res.data;
  if (user) {
    try { localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user)); } catch { /* ignore */ }
  }
  return user;
}

export interface ProfileUpdateInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  oldpassword?: string;
  password?: string;
  password_confirmation?: string;
}

export async function updateProfile(input: ProfileUpdateInput): Promise<AuthUser> {
  const res = await authApi<{ data: AuthUser }>("/api/v1/customer/profile", {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (res.data) {
    try { localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data)); } catch { /* ignore */ }
    if (typeof window !== "undefined") window.dispatchEvent(new Event("auth:changed"));
  }
  return res.data;
}

// -------- Orders --------

export interface CustomerOrderItem {
  id: number;
  name: string;
  qty_ordered: number;
  price: number | string;
  total?: number | string;
  formatted_price?: string;
  formatted_total?: string;
  product?: { url_key?: string; base_image?: { small_image_url?: string } };
}

export interface CustomerOrder {
  id: number;
  increment_id: string;
  status: string;
  status_label?: string;
  grand_total: number | string;
  formatted_grand_total?: string;
  created_at: string;
  items?: CustomerOrderItem[];
  shipping_address?: Record<string, unknown>;
  billing_address?: Record<string, unknown>;
  payment?: { method_title?: string };
  payment_title?: string;
  shipping_title?: string;
  channel_name?: string;
}

function normalizeOrdersPayload(
  payload: CustomerOrder[] | CustomerOrder | { data?: CustomerOrder[] | CustomerOrder; meta?: { current_page: number; last_page: number; total: number } },
): { data: CustomerOrder[]; meta?: { current_page: number; last_page: number; total: number } } {
  if (Array.isArray(payload)) {
    return { data: payload };
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    const data = payload.data;
    return {
      data: Array.isArray(data) ? data : data ? [data] : [],
      meta: payload.meta,
    };
  }

  return payload ? { data: [payload] } : { data: [] };
}

export async function getOrders(page = 1, limit = 20): Promise<{
  data: CustomerOrder[];
  meta?: { current_page: number; last_page: number; total: number };
}> {
  const res = await authApi<CustomerOrder[] | { data?: CustomerOrder[]; meta?: { current_page: number; last_page: number; total: number } }>(
    "/api/v1/customer/orders",
    { method: "GET" },
  );

  const normalized = normalizeOrdersPayload(res);
  const total = normalized.data.length;
  const safeLimit = Math.max(1, limit);
  const currentPage = Math.max(1, page);
  const start = (currentPage - 1) * safeLimit;
  const end = start + safeLimit;

  return {
    data: normalized.data.slice(start, end),
    meta: normalized.meta ?? {
      current_page: currentPage,
      last_page: Math.max(1, Math.ceil(total / safeLimit)),
      total,
    },
  };
}

export async function getOrder(id: number | string): Promise<CustomerOrder | null> {
  try {
    const res = await authApi<CustomerOrder | CustomerOrder[] | { data?: CustomerOrder | CustomerOrder[] }>(`/api/v1/customer/orders/${id}`, { method: "GET" });
    const normalized = normalizeOrdersPayload(res);
    if (normalized.data[0]) return normalized.data[0];
  } catch {
    // fallback listile, kui single-order endpoint mingil põhjusel ebaõnnestub
  }
  const list = await getOrders(1, 100);
  return list.data.find((o) => String(o.id) === String(id)) ?? null;
}

export async function cancelOrder(id: number | string): Promise<void> {
  await authApi(`/api/v1/customer/orders/${id}/cancel`, { method: "POST" });
}

export async function reorder(id: number | string): Promise<void> {
  await authApi(`/api/v1/customer/orders/reorder/${id}`, { method: "GET" });
}

export async function withdrawOrder(id: number | string): Promise<{ order_id: number; status: string } | null> {
  const res = await authApi<{ message?: string; data?: { order_id: number; status: string } }>(
    `/api/v1/customer/orders/${id}/withdraw`,
    { method: "POST" },
  );
  return res.data ?? null;
}

// -------- Addresses --------

export interface CustomerAddress {
  id?: number;
  first_name: string;
  last_name: string;
  company_name?: string;
  email?: string;
  phone: string;
  address: string[] | string;
  city: string;
  postcode: string;
  state?: string;
  country: string;
  vat_id?: string;
  default_address?: boolean | number;
}

export async function getAddresses(): Promise<CustomerAddress[]> {
  const res = await authApi<{ data: CustomerAddress[] }>("/api/v1/customer/addresses", { method: "GET" });
  return res.data ?? [];
}

export async function getAddress(id: number | string): Promise<CustomerAddress | null> {
  const res = await authApi<{ data: CustomerAddress }>(`/api/v1/customer/addresses/${id}`, { method: "GET" });
  return res.data ?? null;
}

export async function createAddress(addr: CustomerAddress): Promise<CustomerAddress> {
  const body = { ...addr, address: Array.isArray(addr.address) ? addr.address : [addr.address] };
  const res = await authApi<{ data: CustomerAddress }>("/api/v1/customer/addresses", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function updateAddress(id: number | string, addr: CustomerAddress): Promise<CustomerAddress> {
  const body = { ...addr, address: Array.isArray(addr.address) ? addr.address : [addr.address] };
  const res = await authApi<{ data: CustomerAddress }>(`/api/v1/customer/addresses/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function deleteAddress(id: number | string): Promise<void> {
  await authApi(`/api/v1/customer/addresses/${id}`, { method: "DELETE" });
}

export async function makeDefaultAddress(id: number | string): Promise<void> {
  await authApi(`/api/v1/customer/addresses/make-default/${id}`, { method: "PATCH" });
}

// -------- Wishlist --------

export interface WishlistItem {
  id: number;
  product_id: number;
  product?: {
    name?: string;
    url_key?: string;
    price?: number;
    formatted_price?: string;
    base_image?: { small_image_url?: string; medium_image_url?: string; url?: string };
  };
}

export async function getWishlist(): Promise<WishlistItem[]> {
  const res = await authApi<{ data: WishlistItem[] }>("/api/v1/customer/wishlist", { method: "GET" });
  return res.data ?? [];
}

// Bagisto wishlist on toggle-endpoint: sama POST lisab või eemaldab toote.
export async function toggleWishlist(productId: number | string): Promise<void> {
  await authApi(`/api/v1/customer/wishlist/${productId}`, { method: "POST" });
}

// Backward-compatible aliases — mõlemad teevad sama toggle-päringu.
export const addToWishlist = toggleWishlist;
export const removeFromWishlist = toggleWishlist;

export async function clearWishlist(): Promise<void> {
  await authApi("/api/v1/customer/wishlist/all", { method: "DELETE" });
}

// NB: {itemId} on wishlist-kirje ID (mitte product_id).
export async function moveWishlistToCart(itemId: number | string): Promise<void> {
  await authApi(`/api/v1/customer/wishlist/${itemId}/move-to-cart`, { method: "POST" });
}

// -------- Customer cart sync (after login) --------

export async function addToCustomerCart(productId: number | string, quantity: number): Promise<void> {
  await authApi(`/api/v1/customer/cart/add/${productId}`, {
    method: "POST",
    body: JSON.stringify({ quantity }),
  });
}
