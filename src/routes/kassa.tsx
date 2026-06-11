import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/shop/Header";
import { Nav } from "@/components/shop/Nav";
import { Footer } from "@/components/shop/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

export const Route = createFileRoute("/kassa")({
  head: () => ({
    meta: [
      { title: "Kassa — aiamaailm.ee" },
      { name: "description", content: "Vormista tellimus aiamaailm.ee e-poes." },
    ],
  }),
  component: CheckoutPage,
});

const SHIPPING = 1.79;

function CheckoutPage() {
  const { items, subtotal, itemsCount } = useCart();
  const sub = Number(subtotal) || 0;
  const total = sub + (items.length ? SHIPPING : 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={itemsCount} cartTotal={total} />
      <Nav />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 md:px-6 py-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">Kassa</h1>
          {items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <p className="text-muted-foreground mb-4">Ostukorv on tühi — lisa kõigepealt tooteid.</p>
              <Button asChild><Link to="/pood">Vaata tooteid</Link></Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Kassa-vorm (aadress, tarne, makse) on tulekul. Praegu näed kokkuvõtet:
              </p>
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item.id} className="flex justify-between py-2 text-sm">
                    <span>{item.quantity}× {item.name}</span>
                    <span className="tabular-nums">{(Number(item.total) || 0).toFixed(2).replace(".", ",")} €</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border pt-3 flex justify-between font-bold">
                <span>Kokku</span>
                <span className="tabular-nums">{total.toFixed(2).replace(".", ",")} €</span>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
