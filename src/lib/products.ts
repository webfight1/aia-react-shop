export interface Product {
  id: string;
  name: string;
  amount: string;
  price: number;
  image: string;
  description: string;
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

export const specialOffer = {
  name: "TOMAT 'Tigerella'",
  amount: "20 seemet",
  oldPrice: 3.25,
  newPrice: 1.95,
  image: "https://picsum.photos/seed/ripe-tomato/400/400",
};
