import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Home, Minus, Plus, ShoppingBag, Check, Truck, ShieldCheck, Heart, Loader2 } from "lucide-react";
import { Header } from "@/components/shop/Header";
import { Nav } from "@/components/shop/Nav";
import { Footer } from "@/components/shop/Footer";
import { Button } from "@/components/ui/button";
import { fetchProductByUrlKey } from "@/lib/products";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { getWishlist, addToWishlist, removeFromWishlist } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/toode/$urlKey")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.urlKey} — aiamaailm.ee` },
    ],
  }),
  component: ProductPage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Nav />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Toodet ei leitud</h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <Button asChild className="mt-6 rounded-xl">
          <Link to="/pood">Tagasi poodi</Link>
        </Button>
      </main>
      <Footer />
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Nav />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Toodet ei leitud</h1>
        <Button asChild className="mt-6 rounded-xl">
          <Link to="/pood">Tagasi poodi</Link>
        </Button>
      </main>
      <Footer />
    </div>
  ),
});

function ProductPage() {
  const { urlKey } = Route.useParams();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const { addItem, isAdding } = useCart();

  const handleAdd = async () => {
    if (!product) return;
    try {
      await addItem(product.id, qty);
      toast.success(`${product.name} lisatud tellimusse`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lisamine ebaõnnestus");
    }
  };

  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ["product", urlKey],
    queryFn: () => fetchProductByUrlKey(urlKey),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <Nav />
        <main className="flex-1 mx-auto max-w-7xl px-4 md:px-6 py-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square rounded-2xl bg-muted animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 w-2/3 bg-muted rounded animate-pulse" />
              <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
              <div className="h-24 w-full bg-muted rounded animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <Nav />
        <main className="flex-1 mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Toodet ei leitud</h1>
          <p className="mt-2 text-muted-foreground">{(error as Error)?.message}</p>
          <Button onClick={() => router.invalidate()} className="mt-6 rounded-xl">
            Proovi uuesti
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Nav />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
            <Link to="/" className="flex items-center gap-1 hover:text-primary">
              <Home className="h-3.5 w-3.5" />
              Avaleht
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/pood" className="hover:text-primary">Tootekataloog</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium truncate max-w-[40ch]">{product.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Gallery */}
            <div>
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted ring-1 ring-border shadow-sm">
                <img
                  src={product.images[activeImg]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {product.images.map((src, i) => (
                    <button
                      key={src}
                      onClick={() => setActiveImg(i)}
                      className={`aspect-square rounded-lg overflow-hidden bg-muted ring-1 transition-all ${
                        i === activeImg ? "ring-2 ring-primary" : "ring-border hover:ring-primary/50"
                      }`}
                    >
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Tootekood: {product.sku}
              </div>
              <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                {product.name}
              </h1>

              {product.description && (
                <p className="mt-4 text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              )}

              <div className="mt-6 flex items-baseline gap-3">
                <div className="text-4xl font-bold text-primary">{product.formattedPrice}</div>
                <div className="text-sm text-muted-foreground">/ {product.amount}</div>
              </div>

              <div className="mt-2 flex items-center gap-2 text-sm">
                {product.inStock ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                    <Check className="h-4 w-4" /> Laos olemas
                  </span>
                ) : (
                  <span className="text-destructive font-medium">Otsas</span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center rounded-xl border border-border bg-card overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="h-12 w-12 grid place-items-center hover:bg-accent transition-colors"
                    aria-label="Vähenda"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="w-12 text-center font-semibold">{qty}</div>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="h-12 w-12 grid place-items-center hover:bg-accent transition-colors"
                    aria-label="Suurenda"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button size="lg" onClick={handleAdd} disabled={isAdding || !product.inStock} className="rounded-xl h-12 px-6 flex-1 sm:flex-initial">
                  <ShoppingBag className="h-4 w-4" />
                  {isAdding ? "Lisan…" : "Lisa tellimusse"}
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-secondary/30 p-4 flex items-start gap-3">
                  <Truck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold">Kiire saatmine</div>
                    <div className="text-xs text-muted-foreground">3–5 tööpäeva</div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-secondary/30 p-4 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold">Kvaliteedi garantii</div>
                    <div className="text-xs text-muted-foreground">Testitud idanevus</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {product.longDescription && (
            <div className="mt-12 rounded-2xl border border-border bg-card p-6 md:p-8 max-w-4xl">
              <h2 className="text-xl font-bold text-foreground">Kasvatusjuhend</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.longDescription}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
