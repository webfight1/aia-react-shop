import { Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/products";

interface Props {
  product: Product;
  index: number;
  onAdd: (p: Product) => void;
  onHover: (p: Product, el: HTMLElement) => void;
  onLeave: () => void;
  onTap: (p: Product) => void;
}

export function ProductRow({ product, index, onAdd, onHover, onLeave, onTap }: Props) {
  const handleTapIntercept = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) {
      e.preventDefault();
      onTap(product);
    }
  };

  return (
    <div
      className={`group grid grid-cols-[1fr_auto] items-center gap-3 md:gap-4 px-3 md:px-4 py-3 border-b border-border/60 transition-colors ${
        index % 2 === 0 ? "bg-card" : "bg-secondary/40"
      } hover:bg-accent/40`}
    >
      {/* Hover-ala: pilt, nimi, kogus, hind */}
      <div
        onMouseEnter={(e) => onHover(product, e.currentTarget)}
        onMouseLeave={onLeave}
        className="grid grid-cols-[56px_1fr] md:grid-cols-[64px_1fr_120px_100px] items-center gap-3 md:gap-4"
      >
        <Link
          to="/toode/$urlKey"
          params={{ urlKey: product.url_key }}
          onClick={handleTapIntercept}
          className="h-14 w-14 rounded-lg overflow-hidden bg-muted ring-1 ring-border shrink-0 block"
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </Link>

        <Link
          to="/toode/$urlKey"
          params={{ urlKey: product.url_key }}
          onClick={handleTapIntercept}
          className="min-w-0"
        >
          <div className="font-medium text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-2">
            <span className="truncate">{product.name}</span>
            {product.featured && (
              <span className="shrink-0 rounded-md bg-amber-100 text-amber-800 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5">
                Soovitatud
              </span>
            )}
            {product.isNew && (
              <span className="shrink-0 rounded-md bg-blue-100 text-blue-800 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5">
                Uus
              </span>
            )}
          </div>
          <div className="md:hidden text-xs text-muted-foreground mt-0.5">
            {product.amount} ·{" "}
            {product.oldPrice && (
              <span className="line-through mr-1">{product.oldPrice.toFixed(2).replace(".", ",")} €</span>
            )}
            <span className={`font-semibold ${product.oldPrice ? "text-primary" : "text-foreground"}`}>
              {product.price.toFixed(2).replace(".", ",")} €
            </span>
          </div>
        </Link>

        <div className="hidden md:block text-sm text-muted-foreground">{product.amount}</div>
        <div className="hidden md:block text-right">
          {product.oldPrice && (
            <div className="text-xs text-muted-foreground line-through leading-tight">
              {product.oldPrice.toFixed(2).replace(".", ",")} €
            </div>
          )}
          <div className={`font-semibold ${product.oldPrice ? "text-primary" : "text-foreground"}`}>
            {product.price.toFixed(2).replace(".", ",")} €
          </div>
        </div>
      </div>

      {/* Nupp – hoverivaba */}
      <Button
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onAdd(product);
        }}
        className="rounded-lg shadow-sm"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Lisa tellimusse</span>
      </Button>
    </div>
  );
}
