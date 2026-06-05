import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Home } from "lucide-react";
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
import { CartSidebar, type CartItem } from "@/components/shop/CartSidebar";
import { SpecialOffer } from "@/components/shop/SpecialOffer";
import { Footer } from "@/components/shop/Footer";
import { products as allProducts, type Product } from "@/lib/products";

export const Route = createFileRoute("/")({
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sort, setSort] = useState("default");
  const [hover, setHover] = useState<{ product: Product; rect: DOMRect } | null>(null);
  const [tapProduct, setTapProduct] = useState<Product | null>(null);
  const [tapOpen, setTapOpen] = useState(false);
  const isDesktop = useIsDesktop();

  const sorted = useMemo(() => {
    const list = [...allProducts];
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name, "et"));
    return list;
  }, [sort]);

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.product.id === p.id);
      if (ex) return prev.map((i) => (i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { product: p, qty: 1 }];
    });
  };
  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((i) => i.product.id !== id));

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartSubtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={cartCount} cartTotal={cartSubtotal + (cart.length ? SHIPPING : 0)} />
      <Nav />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Home className="h-3.5 w-3.5" />
            <a href="#" className="hover:text-primary">Avaleht</a>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">UUED SEEMNED 2025/26</span>
          </nav>

          {/* Title */}
          <div className="mb-6 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Uued seemned <span className="text-primary">2025/26</span>
            </h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              Mõned sordid siin on uued ja mõned vanad teada-tuntud, kuid meie valikus uued.
              Vali endale lemmikud ja alusta hooaega õigesti.
            </p>
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
                {sorted.map((p, i) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    index={i}
                    onAdd={addToCart}
                    onHover={(prod, el) => {
                      if (!isDesktop) return;
                      setHover({ product: prod, rect: el.getBoundingClientRect() });
                    }}
                    onLeave={() => isDesktop && setHover(null)}
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
              <CartSidebar items={cart} shipping={SHIPPING} onRemove={removeFromCart} />
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
