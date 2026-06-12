import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/shop/Header";
import { Nav } from "@/components/shop/Nav";
import { Footer } from "@/components/shop/Footer";

const API_BASE = "https://aiamaailm.webfight.shop";

interface SearchResult {
  id: number;
  name: string;
  sku: string;
  price: string;
  special_price: string | null;
  url_key: string;
  image: string | null;
}

export const Route = createFileRoute("/otsing")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  head: ({ match }) => ({
    meta: [
      { title: `Otsing: ${(match.search as { q?: string }).q || ""} — aiamaailm.ee` },
      { name: "description", content: "Toodete otsingu tulemused aiamaailm.ee poes." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const [items, setItems] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q || q.length < 2) {
      setItems([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    fetch(`${API_BASE}/api/v1/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((j) => {
        setItems(j.data ?? []);
        setTotal(j.meta?.total ?? 0);
      })
      .catch(() => {
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <Nav />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6">
        <h1 className="text-2xl font-semibold text-foreground mb-1">
          Otsing: „{q}"
        </h1>
        <div className="text-sm text-muted-foreground mb-6">
          {loading ? "Otsin…" : `${total} tulemust`}
        </div>

        {!loading && items.length === 0 && q.length >= 2 && (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Ei leidnud „{q}" kohta tulemusi. Proovi teisi märksõnu.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((p) => {
            const img = p.image ? `${API_BASE}${p.image}` : null;
            const hasSpecial =
              p.special_price && Number(p.special_price) > 0;
            return (
              <Link
                key={p.id}
                to="/toode/$urlKey"
                params={{ urlKey: p.url_key }}
                className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition"
              >
                <div className="aspect-square bg-secondary overflow-hidden">
                  {img && (
                    <img
                      src={img}
                      alt={p.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem]">
                    {p.name}
                  </div>
                  <div className="mt-2 text-sm">
                    {hasSpecial ? (
                      <>
                        <span className="text-primary font-semibold">
                          {Number(p.special_price).toFixed(2).replace(".", ",")} €
                        </span>{" "}
                        <span className="text-muted-foreground line-through text-xs">
                          {Number(p.price).toFixed(2).replace(".", ",")} €
                        </span>
                      </>
                    ) : (
                      <span className="text-foreground font-semibold">
                        {Number(p.price).toFixed(2).replace(".", ",")} €
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
