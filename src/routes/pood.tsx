import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/shop/Header";
import { Nav } from "@/components/shop/Nav";
import { ProductRow } from "@/components/shop/ProductRow";
import {
  ProductQuickViewPopover,
  ProductQuickViewModal,
} from "@/components/shop/ProductQuickView";
import { CartSidebar } from "@/components/shop/CartSidebar";
import { SpecialOffer } from "@/components/shop/SpecialOffer";
import { Footer } from "@/components/shop/Footer";
import { fetchProducts, type Product } from "@/lib/products";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

export const Route = createFileRoute("/pood")({
  validateSearch: (search: Record<string, unknown>) => ({
    cat: typeof search.cat === "string" ? search.cat : undefined,
    name: typeof search.name === "string" ? search.name : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Uued seemned 2025/26 — aiamaailm.ee" },
      {
        name: "description",
        content:
          "Avasta uusi köögivilja-, maitsetaime- ja lillesemneid hooajaks 2025/26. Käsitletud tuntud sordid ja meie valiku uudised.",
      },
    ],
  }),
  component: CategoryPage,
});

const SHIPPING = 1.79;

function useIsDesktop() {
  const [isDesktop, set] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => set(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

function CategoryPage() {
  const [sort, setSort] = useState("default");
  const [hover, setHover] = useState<{ product: Product; rect: DOMRect } | null>(null);
  const [tapProduct, setTapProduct] = useState<Product | null>(null);
  const [tapOpen, setTapOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = () => {
    if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
    hoverCloseTimer.current = setTimeout(() => setHover(null), 120);
  };
  const cancelClose = () => {
    if (hoverCloseTimer.current) {
      clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
  };

  const search = Route.useSearch();
  const [category, setCategory] = useState<{ slug: string; name: string }>({
    slug: search.cat ?? "uued-seemned-202526",
    name: search.name ?? "UUED SEEMNED 2025/26",
  });

  useEffect(() => {
    if (search.cat) {
      setCategory({ slug: search.cat, name: search.name ?? search.cat });
    }
  }, [search.cat, search.name]);

  const { data: allProducts = [], isLoading, isError } = useQuery({
    queryKey: ["products", category.slug],
    queryFn: () => fetchProducts(category.slug),
    staleTime: 60_000,
  });

  const sorted = useMemo(() => {
    const list = [...allProducts];
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name, "et"));
    return list;
  }, [sort, allProducts]);

  const { items: cartItems, itemsCount, subtotal, addItem, removeItem, isRemoving } = useCart();

  const addToCart = async (p: Product) => {
    try {
      await addItem(p.id, 1);
      toast.success(`${p.name} lisatud ostukorvi`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lisamine ebaõnnestus");
    }
  };
  const removeFromCart = async (cartItemId: number) => {
    try {
      await removeItem(cartItemId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Eemaldamine ebaõnnestus");
    }
  };

  const cartCount = itemsCount;
  const cartSubtotal = Number(subtotal) || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={cartCount} cartTotal={cartSubtotal + (cartItems.length ? SHIPPING : 0)} />
      <Nav
        onSelectCategory={(slug, name) => setCategory({ slug, name })}
        selectedSlug={category.slug}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Home className="h-3.5 w-3.5" />
            <a href="#" className="hover:text-primary">Avaleht</a>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium uppercase">{category.name}</span>
          </nav>

          {/* Title */}
          <div className="mb-6 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {category.name}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Left: products */}
            <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-secondary/30">
                <div className="text-sm text-muted-foreground">
                  Kokku <span className="font-semibold text-foreground">{sorted.length}</span> toodet
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground hidden sm:inline">Sorteerimine:</span>
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="h-9 w-[180px] rounded-lg bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Vaikimisi</SelectItem>
                      <SelectItem value="name">Nime järgi (A–Ü)</SelectItem>
                      <SelectItem value="price-asc">Hind kasvavalt</SelectItem>
                      <SelectItem value="price-desc">Hind kahanevalt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                {isLoading && (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    Laen tooteid…
                  </div>
                )}
                {isError && (
                  <div className="p-8 text-center text-sm text-destructive">
                    Toodete laadimine ebaõnnestus. Palun proovi hiljem uuesti.
                  </div>
                )}
                {!isLoading && !isError && sorted.map((p, i) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    index={i}
                    onAdd={addToCart}
                    onHover={(prod, el) => {
                      if (!isDesktop) return;
                      cancelClose();
                      setHover({ product: prod, rect: el.getBoundingClientRect() });
                    }}
                    onLeave={() => isDesktop && scheduleClose()}
                    onTap={(prod) => {
                      if (isDesktop) return;
                      setTapProduct(prod);
                      setTapOpen(true);
                    }}
                  />
                ))}
              </div>

            </section>

            {/* Right: sidebar */}
            <div className="space-y-6">
              <CartSidebar items={cartItems} shipping={SHIPPING} subtotal={cartSubtotal} onRemove={removeFromCart} isRemoving={isRemoving} />
              <SpecialOffer />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {isDesktop && hover && (
        <ProductQuickViewPopover
          key={hover.product.id}
          product={hover.product}
          anchorRect={hover.rect}
          onAdd={addToCart}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        />
      )}

      <ProductQuickViewModal
        product={tapProduct}
        open={tapOpen}
        onOpenChange={setTapOpen}
        onAdd={addToCart}
      />
    </div>
  );
}
