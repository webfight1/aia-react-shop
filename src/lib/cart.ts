// Bagisto guest cart API client with cart_token support.
// Token-based (no cookies). Token rotates on every response — always store the latest.

const API_BASE = "https://aiamaailm.webfight.shop";
const TOKEN_KEY = "aiamaailm_cart_token";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function clearCartToken() {
  setToken(null);
}

export interface BagistoCartItem {
  id: number;
  product_id: number;
  sku: string;
  name: string;
  type: string;
  quantity: number;
  price: number;
  base_price?: number;
  total: number;
  base_total?: number;
  formatted_price?: string;
  formatted_total?: string;
  product?: {
    url_key?: string;
    base_image?: {
      small_image_url?: string;
      medium_image_url?: string;
      large_image_url?: string;
    };
  };
  // Some Bagisto versions expose images at top level
  base_image?: {
    small_image_url?: string;
    medium_image_url?: string;
  };
}

export interface BagistoCart {
  id: number;
  is_guest: number;
  items_count: number;
  items_qty: number;
  grand_total: number;
  sub_total: number;
  formatted_grand_total?: string;
  formatted_sub_total?: string;
  items: BagistoCartItem[];
  billing_address?: unknown;
  shipping_address?: unknown;
  shipping_method?: string | null;
  payment_method?: string | null;
}

export interface CartResponse {
  data?: {
    cart_token?: string;
    cart?: BagistoCart | null;
  };
  message?: string;
  errors?: Record<string, string[]>;
}

export class CartApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function cartApi(path: string, options: RequestInit = {}): Promise<CartResponse> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) headers["X-Cart-Token"] = token;

  const res = await fetch(`${API_BASE}/api/v1/guest${path}`, {
    ...options,
    headers,
  });

  let json: CartResponse = {};
  try {
    json = (await res.json()) as CartResponse;
  } catch {
    /* empty body */
  }

  const newToken = json?.data?.cart_token;
  if (newToken) setToken(newToken);

  if (!res.ok) {
    throw new CartApiError(
      json?.message ?? `Cart request failed (${res.status})`,
      res.status,
      json?.errors,
    );
  }
  return json;
}

export async function getCart(): Promise<BagistoCart | null> {
  // No token yet → empty cart, don't call server.
  if (!getToken()) return null;
  const res = await cartApi("/cart", { method: "GET" });
  return res.data?.cart ?? null;
}

export async function addCartItem(productId: number | string, quantity = 1): Promise<BagistoCart | null> {
  const res = await cartApi("/cart/items", {
    method: "POST",
    body: JSON.stringify({ product_id: Number(productId), quantity }),
  });
  return res.data?.cart ?? null;
}

export async function updateCartItem(cartItemId: number, quantity: number): Promise<BagistoCart | null> {
  const res = await cartApi("/cart/items", {
    method: "PUT",
    body: JSON.stringify({ qty: { [cartItemId]: quantity } }),
  });
  return res.data?.cart ?? null;
}

export async function removeCartItem(cartItemId: number): Promise<BagistoCart | null> {
  const res = await cartApi(`/cart/items/${cartItemId}`, { method: "DELETE" });
  return res.data?.cart ?? null;
}

export function cartItemImage(item: BagistoCartItem): string {
  const img =
    item.product?.base_image?.small_image_url ||
    item.product?.base_image?.medium_image_url ||
    item.base_image?.small_image_url ||
    item.base_image?.medium_image_url ||
    "";
  if (!img) return "";
  return img.startsWith("http") ? img : `${API_BASE}${img}`;
}
