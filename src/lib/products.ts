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
  image: string;
}

const API_BASE = "https://aiamaailm.webfight.shop";

const FALLBACK_IMG = "https://picsum.photos/seed/produkt/400/400";

export const DEFAULT_CATEGORY_SLUG = "uued-seemned-202526";

export function mapApiProduct(p: ApiProduct): Product {
  const priceStr = p.special_price ?? p.price;
  const price = parseFloat(priceStr) || 0;
  const image = p.image ? `${API_BASE}${p.image}` : FALLBACK_IMG;
  return {
    id: String(p.id),
    name: p.name,
    amount: "1 tk",
    price,
    image,
    description:
      "Toote kirjeldus ei ole hetkel saadaval. Võta ühendust, kui soovid lisainfot selle toote kohta.",
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
