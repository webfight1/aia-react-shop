import { X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/products";

export interface CartItem {
  product: Product;
  qty: number;
}

interface Props {
  items: CartItem[];
  shipping: number;
  onRemove: (id: string) => void;
}

export function CartSidebar({ items, shipping, onRemove }: Props) {
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const total = subtotal + (items.length ? shipping : 0);

  return (
    <aside className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-3">
        <ShoppingBag className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">
          Muuda tellimust
        </h2>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Sinu ostukorv on tühi.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map(({ product, qty }) => (
              <li key={product.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="truncate text-foreground">
                    {qty > 1 && <span className="text-muted-foreground">{qty}× </span>}
                    {product.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{product.amount}</div>
                </div>
                <div className="font-semibold text-foreground tabular-nums">
                  {(product.price * qty).toFixed(2).replace(".", ",")} €
                </div>
                <button
                  onClick={() => onRemove(product.id)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label="Eemalda"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border px-4 py-3 space-y-3 bg-secondary/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Kokku saatekuluga</span>
          <span className="text-lg font-bold text-foreground tabular-nums">
            {total.toFixed(2).replace(".", ",")} €
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="rounded-lg">
            Muuda
          </Button>
          <Button size="sm" className="rounded-lg" disabled={!items.length}>
            Vormista
          </Button>
        </div>
      </div>
    </aside>
  );
}
