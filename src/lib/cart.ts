// Bagisto cart API client.
// Guest: cart_token header. Customer (logged in): Bearer token from auth.
import { AUTH_TOKEN_KEY } from "@/lib/auth";

const API_BASE = "https://aiamaailm.webfight.shop";
const TOKEN_KEY = "aiamaailm_cart_token";

function getAuthBearer(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(AUTH_TOKEN_KEY); } catch { return null; }
}

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

export function getCartToken(): string | null {
  return getToken();
}

export interface BagistoImage {
  small_image_url?: string;
  medium_image_url?: string;
  large_image_url?: string;
  original_image_url?: string;
  url?: string;
  path?: string;
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
    base_image?: BagistoImage;
    images?: BagistoImage[];
  };
  // Some Bagisto versions expose images at top level
  base_image?: BagistoImage;
  images?: BagistoImage[];
  additional?: {
    product?: {
      base_image?: BagistoImage;
    };
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

async function cartApi(
  path: string | { guest: string; customer: string },
  options: RequestInit = {},
): Promise<CartResponse> {
  const token = getToken();
  const bearer = getAuthBearer();
  const guestPath = typeof path === "string" ? path : path.guest;
  const customerPath = typeof path === "string" ? path : path.customer;

  const baseHeaders = (): Record<string, string> => ({
    Accept: "application/json",
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  });

  const callGuest = async (): Promise<{ res: Response; json: CartResponse }> => {
    const headers = baseHeaders();
    if (token) headers["X-Cart-Token"] = token;
    // Pass Bearer to guest endpoint too so backend can resolve customer
    // group for pricing rules when customer endpoints aren't available.
    if (bearer) headers.Authorization = `Bearer ${bearer}`;
    const res = await fetch(`${API_BASE}/api/v1/guest${guestPath}`, { ...options, headers });
    let json: CartResponse = {};
    try { json = (await res.json()) as CartResponse; } catch { /* empty */ }
    const newToken = json?.data?.cart_token;
    if (newToken) setToken(newToken);
    return { res, json };
  };

  // Logged-in customers: try customer endpoint first so backend applies
  // customer-group pricing rules.
  if (bearer) {
    const headers = baseHeaders();
    headers.Authorization = `Bearer ${bearer}`;
    if (token) headers["X-Cart-Token"] = token;
    const res = await fetch(`${API_BASE}/api/v1/customer${customerPath}`, { ...options, headers });
    let json: CartResponse = {};
    try { json = (await res.json()) as CartResponse; } catch { /* empty */ }
    if (res.ok) {
      const newToken = json?.data?.cart_token;
      if (newToken) setToken(newToken);
      return json;
    }
    // Fall back to guest on 401/404/500 (endpoint unsupported in this build).
    if (res.status !== 401 && res.status !== 404 && res.status !== 500) {
      throw new CartApiError(json?.message ?? `Cart request failed (${res.status})`, res.status, json?.errors);
    }
    // fall through to guest
  }

  const { res, json } = await callGuest();
  if (!res.ok) {
    throw new CartApiError(json?.message ?? `Cart request failed (${res.status})`, res.status, json?.errors);
  }
  return json;
}



export async function getCart(): Promise<BagistoCart | null> {
  // No token yet → empty cart, don't call server.
  if (!getToken() && !getAuthBearer()) return null;
  const res = await cartApi("/cart", { method: "GET" });
  return res.data?.cart ?? null;
}

export async function addCartItem(productId: number | string, quantity = 1): Promise<BagistoCart | null> {
  const pid = Number(productId);
  const res = await cartApi(
    { guest: "/cart/items", customer: `/cart/add/${pid}` },
    {
      method: "POST",
      // Guest endpoint requires product_id+quantity; customer /cart/add/{id} only needs quantity.
      // Including product_id is harmless on the customer endpoint.
      body: JSON.stringify({ product_id: pid, quantity }),
    },
  );
  return res.data?.cart ?? null;
}

export async function updateCartItem(cartItemId: number, quantity: number): Promise<BagistoCart | null> {
  const res = await cartApi(
    { guest: "/cart/items", customer: "/cart/update" },
    {
      method: "PUT",
      body: JSON.stringify({ qty: { [cartItemId]: quantity } }),
    },
  );
  return res.data?.cart ?? null;
}

export async function removeCartItem(cartItemId: number): Promise<BagistoCart | null> {
  const res = await cartApi(
    { guest: `/cart/items/${cartItemId}`, customer: `/cart/remove/${cartItemId}` },
    { method: "DELETE" },
  );
  return res.data?.cart ?? null;
}

function pickImageUrl(img?: BagistoImage): string {
  if (!img) return "";
  return (
    img.small_image_url ||
    img.medium_image_url ||
    img.large_image_url ||
    img.original_image_url ||
    img.url ||
    img.path ||
    ""
  );
}

function normalizeCartImageUrl(url: string): string {
  if (!url) return "";
  const absolute = url.startsWith("http") || url.startsWith("data:")
    ? url
    : `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;

  const match = absolute.match(/\/cache\/(?:small|medium|large|original)\/product\/(\d+)\/([^/?#]+)\.[a-zA-Z0-9]+(?:[?#].*)?$/);
  if (!match) return absolute;

  const [, productId, fileName] = match;
  return `${API_BASE}/storage/cache/product/${productId}/${fileName}_400x400.webp`;
}

export function cartItemImage(item: BagistoCartItem): string {
  const img =
    pickImageUrl(item.product?.base_image) ||
    pickImageUrl(item.product?.images?.[0]) ||
    pickImageUrl(item.base_image) ||
    pickImageUrl(item.images?.[0]) ||
    pickImageUrl(item.additional?.product?.base_image) ||
    "";
  if (!img) return "";
  return normalizeCartImageUrl(img);
}

// ---------- Checkout ----------

export interface CheckoutAddress {
  first_name: string;
  last_name: string;
  company_name?: string;
  email: string;
  phone: string;
  address: string[]; // MUST be array
  city: string;
  postcode: string;
  state?: string;
  country: string; // ISO-2
  vat_id?: string;
  use_for_shipping?: boolean;
}

export interface ShippingRate {
  method: string;
  method_title: string;
  price: number;
  base_formatted_price?: string;
  formatted_price?: string;
  carrier_title?: string;
}

export interface PaymentMethod {
  method: string;
  method_title: string;
  image?: string;
  description?: string;
}

// Auth-aware checkout wrapper: picks guest vs customer endpoint based on login state.
// If the customer endpoint returns 401 (stale/expired token), automatically falls back
// to the guest endpoint with the cart token so checkout can still complete.
async function checkoutApi(paths: { guest: string; customer: string }, options: RequestInit = {}): Promise<CartResponse> {
  const bearer = getAuthBearer();

  const callGuest = async (): Promise<CartResponse> => {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) ?? {}),
    };
    const t = getToken();
    if (t) headers["X-Cart-Token"] = t;
    const res = await fetch(`${API_BASE}${paths.guest}`, { ...options, headers });
    const raw = await res.text();
    let json: CartResponse = {};
    try { json = raw ? (JSON.parse(raw) as CartResponse) : {}; } catch { /* empty */ }
    const newToken = json?.data?.cart_token;
    if (newToken) setToken(newToken);
    if (!res.ok) {
      console.error("[checkout guest]", paths.guest, res.status, raw, "body:", options.body);
      throw new CartApiError(json?.message ?? `Checkout request failed (${res.status})`, res.status, json?.errors);
    }
    return json;
  };

  if (!bearer) return callGuest();

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${bearer}`,
    ...((options.headers as Record<string, string>) ?? {}),
  };
  const res = await fetch(`${API_BASE}${paths.customer}`, { ...options, headers });
  const raw = await res.text();
  let json: CartResponse = {};
  try { json = raw ? (JSON.parse(raw) as CartResponse) : {}; } catch { /* empty */ }

  // Stale customer session — clear auth and retry as guest so checkout continues.
  if (res.status === 401) {
    try {
      localStorage.removeItem("aiamaailm_auth_token");
      localStorage.removeItem("aiamaailm_user");
      window.dispatchEvent(new Event("auth:changed"));
    } catch { /* ignore */ }
    return callGuest();
  }

  // Customer endpoint missing in this Bagisto build (404) — fall back to guest with X-Cart-Token.
  if (res.status === 404) {
    return callGuest();
  }

  // Customer endpoint can't reach a customer-cart (guest cart wasn't merged on login).
  // Fall back to guest with X-Cart-Token. Do NOT blanket-fallback on 500 — guest
  // cart is separate and usually has no address/shipping, which turns a backend
  // bug into a misleading "Tarneaadress is missing" 400.
  const errCode = (json as { data?: { error_code?: string } })?.data?.error_code;
  const errMsg = (json as { data?: { message?: string }; message?: string })?.data?.message
    ?? (json as { message?: string })?.message
    ?? "";
  const cartLikeError = errCode === "CART_NOT_FOUND" || /cart not found|no product in your cart/i.test(errMsg);
  if (!res.ok && cartLikeError) {
    return callGuest();
  }


  if (!res.ok) {
    console.error("[checkout customer]", paths.customer, res.status, raw, "body:", options.body);
    throw new CartApiError(json?.message ?? `Checkout request failed (${res.status})`, res.status, json?.errors);
  }
  return json;
}


const CHECKOUT_PATHS = {
  saveAddress:     { guest: "/api/v1/guest/checkout/addresses",        customer: "/api/v1/customer/checkout/save-address" },
  saveShipping:    { guest: "/api/v1/guest/checkout/shipping-method",  customer: "/api/v1/customer/checkout/save-shipping" },
  savePayment:     { guest: "/api/v1/guest/checkout/payment-method",   customer: "/api/v1/customer/checkout/save-payment" },
  placeOrder:      { guest: "/api/v1/guest/checkout/place-order",      customer: "/api/v1/customer/checkout/save-order" },
  shippingMethods: { guest: "/api/v1/guest/checkout/shipping-methods", customer: "/api/v1/customer/checkout/shipping-methods" },
  paymentMethods:  { guest: "/api/v1/guest/checkout/payment-methods",  customer: "/api/v1/customer/checkout/payment-methods" },
};

export interface CustomerAddressRef { address_id: number }

export async function saveCheckoutAddresses(
  billing: CheckoutAddress | CustomerAddressRef,
  shipping?: CheckoutAddress | CustomerAddressRef,
) {
  const billingBody = "address_id" in billing ? billing : { ...billing, use_for_shipping: shipping ? false : true };
  const body = { billing: billingBody, shipping: shipping ?? billing };
  const res = await checkoutApi(CHECKOUT_PATHS.saveAddress, { method: "POST", body: JSON.stringify(body) });
  return res.data ?? null;
}

export async function getShippingMethods(): Promise<Record<string, { carrier_title?: string; rates: ShippingRate[] }>> {
  const res = await checkoutApi(CHECKOUT_PATHS.shippingMethods, { method: "GET" });
  const d = res.data as
    | {
        shippingMethods?: Record<string, { carrier_title?: string; rates: ShippingRate[] }>;
        shipping_rates?: { shippingMethods?: Record<string, { carrier_title?: string; rates: ShippingRate[] }> };
      }
    | undefined;
  return d?.shippingMethods ?? d?.shipping_rates?.shippingMethods ?? {};
}

export interface ParcelLockerPayload {
  locker_id: string;
  locker_name: string;
  locker_address: string;
  locker_city: string;
  locker_postcode: string;
  locker_country: string;
}

export async function saveShippingMethod(
  shipping_method: string,
  parcel_locker?: ParcelLockerPayload,
) {
  const body: Record<string, unknown> = { shipping_method };
  if (parcel_locker) body.parcel_locker = parcel_locker;
  const res = await checkoutApi(CHECKOUT_PATHS.saveShipping, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.data ?? null;
}

// ---------- Parcel lockers (Omniva / DPD / Smartpost) ----------

export type ParcelCarrier = "omniva" | "dpd" | "smartpost";

export interface ParcelLocker {
  id: string;
  name: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  county?: string;
}

interface OmnivaRaw {
  zip: string;
  name: string;
  county?: string;
  city: string;
  street?: string;
  house?: string;
}
interface DpdRaw {
  parcel_shop_id: string;
  company_name: string;
  street?: string;
  house_no?: string;
  city: string;
  zip_code: string;
  country_code?: string;
}
interface SmartpostRaw {
  name?: string;
  address?: string;
  city?: string;
  zip?: string;
  county?: string;
  place_id?: string;
}

export async function getParcelLockers(carrier: ParcelCarrier): Promise<ParcelLocker[]> {
  const res = await fetch(`${API_BASE}/api/v1/${carrier}/locations`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: { locations?: unknown[] } };
  const list = json?.data?.locations ?? [];
  if (carrier === "omniva") {
    return (list as OmnivaRaw[]).map((l) => ({
      id: l.zip,
      name: l.name,
      address: `${l.street ?? ""} ${l.house ?? ""}`.trim(),
      city: l.city,
      postcode: l.zip,
      country: "EE",
      county: l.county,
    }));
  }
  if (carrier === "dpd") {
    return (list as DpdRaw[]).map((l) => ({
      id: l.parcel_shop_id,
      name: l.company_name,
      address: `${l.street ?? ""} ${l.house_no ?? ""}`.trim(),
      city: l.city,
      postcode: l.zip_code,
      country: l.country_code ?? "EE",
    }));
  }
  return (list as SmartpostRaw[]).map((l) => ({
    id: l.place_id ?? l.zip ?? l.name ?? "",
    name: l.name ?? "",
    address: l.address ?? "",
    city: l.city ?? "",
    postcode: l.zip ?? "",
    country: "EE",
    county: l.county,
  }));
}

export function detectParcelCarrier(method: string): ParcelCarrier | null {
  const m = method.toLowerCase();
  if (m.startsWith("omniva")) return "omniva";
  if (m.startsWith("dpd")) return "dpd";
  if (m.startsWith("smartpost") || m.startsWith("itella")) return "smartpost";
  return null;
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const res = await checkoutApi(CHECKOUT_PATHS.paymentMethods, { method: "GET" });
  const d = res.data as { payment_methods?: { payment_methods?: PaymentMethod[] } | PaymentMethod[] } | undefined;
  const pm = d?.payment_methods;
  if (Array.isArray(pm)) return pm;
  return pm?.payment_methods ?? [];
}

export async function savePaymentMethod(method: string) {
  const res = await checkoutApi(CHECKOUT_PATHS.savePayment, {
    method: "POST",
    body: JSON.stringify({ payment: { method } }),
  });
  return res.data ?? null;
}

export interface PlaceOrderResult {
  order?: { id: number; increment_id?: string };
  redirect_url?: string;
}

export async function placeOrder(): Promise<PlaceOrderResult> {
  const res = await checkoutApi(CHECKOUT_PATHS.placeOrder, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return (res.data ?? {}) as PlaceOrderResult;
}

