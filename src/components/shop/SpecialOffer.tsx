import { Tag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchFeaturedProducts } from "@/lib/products";

export function SpecialOffer() {
  const { data: products } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => fetchFeaturedProducts(6),
    staleTime: 5 * 60_000,
  });

  if (!products || products.length === 0) return null;

  return (
    <aside className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-3">
        <Tag className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">
          Eripakkumised
        </h2>
      </div>
      <div className="p-3 space-y-3">
        {products.map((p) => (
          <Link
            key={p.id}
            to="/toode/$urlKey"
            params={{ urlKey: p.url_key }}
            className="block rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all overflow-hidden group"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-3">
              <div className="font-medium text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {p.name}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{p.amount}</div>
              <div className="mt-1.5 text-base font-bold text-primary">
                {p.price.toFixed(2).replace(".", ",")} €
              </div>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
