import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

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

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      try {
        const r = await fetch(
          `${API_BASE}/api/v1/search?q=${encodeURIComponent(query)}`,
          { signal: ctrl.signal }
        );
        const j = await r.json();
        setResults(j.data ?? []);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit() {
    if (query.trim().length < 2) return;
    setOpen(false);
    navigate({ to: "/otsing", search: { q: query.trim() } });
  }

  function goto(urlKey: string) {
    setOpen(false);
    navigate({ to: "/toode/$urlKey", params: { urlKey } });
  }

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl hidden md:block">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Otsi tooteid, sorte, seemneid…"
          className="w-full pl-9 pr-20 h-10 rounded-xl bg-secondary border border-transparent focus:border-primary focus:outline-none text-sm"
        />
        <button
          type="submit"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          Otsi
        </button>
      </form>

      {open && query.length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-border bg-popover shadow-lg z-50 overflow-hidden">
          {loading && (
            <div className="p-3 text-sm text-muted-foreground">Otsin…</div>
          )}
          {!loading && results.length === 0 && (
            <div className="p-3 text-sm text-muted-foreground">
              Ei leidnud „{query}" kohta tulemusi.
            </div>
          )}
          {!loading && results.length > 0 && (
            <>
              {results.slice(0, 8).map((p) => {
                const img = p.image ? `${API_BASE}${p.image}` : null;
                const hasSpecial =
                  p.special_price && Number(p.special_price) > 0;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => goto(p.url_key)}
                    className="flex gap-3 p-2 hover:bg-secondary w-full text-left items-center border-b border-border last:border-b-0"
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={p.name}
                        className="h-12 w-12 rounded-md object-cover bg-secondary shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-secondary shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {p.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {hasSpecial ? (
                          <>
                            <span className="text-primary font-semibold">
                              {Number(p.special_price).toFixed(2).replace(".", ",")} €
                            </span>{" "}
                            <span className="line-through">
                              {Number(p.price).toFixed(2).replace(".", ",")} €
                            </span>
                          </>
                        ) : (
                          <span className="text-foreground">
                            {Number(p.price).toFixed(2).replace(".", ",")} €
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={submit}
                className="block w-full p-2 text-center text-sm text-primary hover:bg-secondary border-t border-border font-medium"
              >
                Vaata kõiki tulemusi →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
