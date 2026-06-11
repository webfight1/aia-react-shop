import { X, ShoppingBag, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cartItemImage, type BagistoCartItem } from "@/lib/cart";

interface Props {
  items: BagistoCartItem[];
  shipping: number;
  subtotal: number;
  onRemove: (cartItemId: number) => void;
  isRemoving?: boolean;
}

export function CartSidebar({ items, shipping, subtotal, onRemove, isRemoving }: Props) {
  const sub = Number(subtotal) || 0;
  const total = sub + (items.length ? shipping : 0);

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
            {items.map((item) => {
              const img = cartItemImage(item);
              return (
                <li key={item.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  {img && (
                    <img
                      src={img}
                      alt={item.name}
                      className="h-10 w-10 rounded-md object-cover ring-1 ring-border shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-foreground">
                      {item.quantity > 1 && (
                        <span className="text-muted-foreground">{item.quantity}× </span>
                      )}
                      {item.name}
                    </div>
                  </div>
                  <div className="font-semibold text-foreground tabular-nums">
                    {(Number(item.total) || 0).toFixed(2).replace(".", ",")} €
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    disabled={isRemoving}
                    className="rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-40"
                    aria-label="Eemalda"
                  >
                    {isRemoving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </button>
                </li>
              );
            })}
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
