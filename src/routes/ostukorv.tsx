import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/shop/Header";
import { Nav } from "@/components/shop/Nav";
import { Footer } from "@/components/shop/Footer";
import { useCart } from "@/hooks/useCart";
import { cartItemImage } from "@/lib/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/ostukorv")({
  head: () => ({
    meta: [
      { title: "Ostukorv — aiamaailm.ee" },
      { name: "description", content: "Vaata ja muuda oma ostukorvi enne tellimuse vormistamist." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, itemsCount, updateItem, removeItem, isUpdating, isRemoving, isLoading } = useCart();
  const sub = Number(subtotal) || 0;
  const total = sub;


  const change = async (id: number, qty: number) => {
    if (qty < 1) return;
    try { await updateItem(id, qty); } catch (e) { toast.error(e instanceof Error ? e.message : "Uuendamine ebaõnnestus"); }
  };
  const remove = async (id: number) => {
    try { await removeItem(id); } catch (e) { toast.error(e instanceof Error ? e.message : "Eemaldamine ebaõnnestus"); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={itemsCount} cartTotal={sub} />
      <Nav />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 md:px-6 py-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">Ostukorv</h1>

          {isLoading ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">Laen…</div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <p className="text-muted-foreground mb-4">Sinu ostukorv on tühi.</p>
              <Button asChild><Link to="/pood">Vaata tooteid</Link></Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-[1fr_320px] gap-6">
              <section className="rounded-2xl border border-border bg-card overflow-hidden">
                <ul className="divide-y divide-border">
                  {items.map((item) => {
                    const img = cartItemImage(item);
                    const itemTotal = Number(item.total) || 0;
                    return (
                      <li key={item.id} className="flex items-center gap-4 p-4">
                        {img && <img src={img} alt={item.name} className="h-16 w-16 rounded-md object-cover ring-1 ring-border" />}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground truncate">{item.name}</div>
                          <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
                        </div>
                        <div className="flex items-center gap-1 rounded-lg border border-border">
                          <button
                            onClick={() => change(item.id, item.quantity - 1)}
                            disabled={isUpdating || item.quantity <= 1}
                            className="p-1.5 hover:bg-accent disabled:opacity-40"
                            aria-label="Vähenda"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => change(item.id, item.quantity + 1)}
                            disabled={isUpdating}
                            className="p-1.5 hover:bg-accent disabled:opacity-40"
                            aria-label="Lisa"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="w-24 text-right font-semibold tabular-nums">
                          {itemTotal.toFixed(2).replace(".", ",")} €
                        </div>
                        <button
                          onClick={() => remove(item.id)}
                          disabled={isRemoving}
                          className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                          aria-label="Eemalda"
                        >
                          {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <aside className="rounded-2xl border border-border bg-card p-5 h-fit space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vahesumma</span>
                  <span className="tabular-nums">{sub.toFixed(2).replace(".", ",")} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Saatekulu</span>
                  <span className="tabular-nums">{SHIPPING.toFixed(2).replace(".", ",")} €</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-semibold">Kokku</span>
                  <span className="text-lg font-bold tabular-nums">{total.toFixed(2).replace(".", ",")} €</span>
                </div>
                <Button asChild className="w-full rounded-lg">
                  <Link to="/kassa">Vormista tellimus</Link>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-lg">
                  <Link to="/pood">Jätka ostlemist</Link>
                </Button>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
