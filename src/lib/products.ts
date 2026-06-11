export interface Product {
  id: string;
  url_key: string;
  name: string;
  amount: string;
  price: number;
  image: string;
  description: string;
}

export interface ProductDetail extends Product {
  sku: string;
  longDescription: string;
  images: string[];
  inStock: boolean;
  formattedPrice: string;
}

export interface ApiProduct {
  id: number;
  name: string;
  sku: string;
  price: string;
  special_price: string | null;
  url_key: string;
  short_description?: string | null;
  image: string;
}

interface ApiProductDetail {
  id: number;
  sku: string;
  name: string;
  url_key: string;
  price: string;
  formatted_price?: string;
  short_description?: string | null;
  description?: string | null;
  in_stock?: boolean;
  images?: Array<{
    large_image_url?: string;
    medium_image_url?: string;
    original_image_url?: string;
  }>;
  base_image?: {
    large_image_url?: string;
    medium_image_url?: string;
    original_image_url?: string;
  };
}

const API_BASE = "https://aiamaailm.webfight.shop";

const FALLBACK_IMG = "https://picsum.photos/seed/produkt/400/400";

export const DEFAULT_CATEGORY_SLUG = "uued-seemned-202526";

function htmlToText(html: string): string {
  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*p\s*>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\ufeff/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function mapApiProduct(p: ApiProduct): Product {
  const priceStr = p.special_price ?? p.price;
  const price = parseFloat(priceStr) || 0;
  const image = p.image ? `${API_BASE}${p.image}` : FALLBACK_IMG;
  const description = p.short_description
    ? htmlToText(p.short_description)
    : "Toote kirjeldus ei ole hetkel saadaval.";
  return {
    id: String(p.id),
    url_key: p.url_key,
    name: p.name,
    amount: "1 tk",
    price,
    image,
    description,
  };
}

export async function fetchProducts(slug: string = DEFAULT_CATEGORY_SLUG): Promise<Product[]> {
  const url = `${API_BASE}/api/v1/category/${encodeURIComponent(slug)}?width=400&height=400&format=webp`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
  const data: ApiProduct[] = await res.json();
  return data.map(mapApiProduct);
}

export async function fetchProductByUrlKey(urlKey: string): Promise<ProductDetail> {
  const url = `${API_BASE}/api/v1/products?url_key=${encodeURIComponent(urlKey)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch product: ${res.status}`);
  const json = await res.json();
  const p: ApiProductDetail | undefined = Array.isArray(json?.data) ? json.data[0] : json?.data;
  if (!p) throw new Error("Toodet ei leitud");
  const price = parseFloat(p.price) || 0;
  const images =
    p.images?.map((i) => i.large_image_url || i.medium_image_url || i.original_image_url || "").filter(Boolean) ?? [];
  const baseImage =
    p.base_image?.large_image_url || p.base_image?.medium_image_url || p.base_image?.original_image_url || "";
  const allImages = images.length ? images : baseImage ? [baseImage] : [FALLBACK_IMG];
  return {
    id: String(p.id),
    url_key: p.url_key,
    sku: p.sku,
    name: p.name,
    amount: "1 tk",
    price,
    image: allImages[0],
    images: allImages,
    description: p.short_description ? htmlToText(p.short_description) : "",
    longDescription: p.description ? htmlToText(p.description) : "",
    inStock: p.in_stock ?? true,
    formattedPrice: p.formatted_price ?? `${price.toFixed(2).replace(".", ",")} €`,
  };
}

export const specialOffer = {
  name: "TOMAT 'Tigerella'",
  amount: "20 seemet",
  oldPrice: 3.25,
  newPrice: 1.95,
  image: "https://picsum.photos/seed/ripe-tomato/400/400",
};
