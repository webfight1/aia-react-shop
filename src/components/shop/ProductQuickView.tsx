import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Product } from "@/lib/products";

interface DesktopProps {
  product: Product;
  anchorRect: DOMRect;
  onAdd: (p: Product) => void;
}

export function ProductQuickViewPopover({ product, anchorRect, onAdd }: DesktopProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [product.id]);

  const width = 760;
  const margin = 16;
  let left = anchorRect.right + 12;
  if (left + width > window.innerWidth - margin) {
    left = anchorRect.left - width - 12;
  }
  if (left < margin) left = margin;

  let top = anchorRect.top;
  const estHeight = 520;
  if (top + estHeight > window.innerHeight - margin) {
    top = Math.max(margin, window.innerHeight - estHeight - margin);
  }

  return (
    <div
      style={{
        position: "fixed",
        top,
        left,
        width,
        opacity: mounted ? 1 : 0,
        transform: mounted ? "scale(1)" : "scale(0.96)",
        transition: "opacity 180ms ease, transform 180ms ease",
      }}
      className="z-50 rounded-2xl border border-border bg-popover shadow-2xl pointer-events-none"
    >
      <div className="grid grid-cols-[1fr_360px] gap-5 p-6">
        <div className="min-w-0 flex flex-col">
          <h3 className="text-lg font-semibold text-foreground leading-tight">
            {product.name}
          </h3>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-[8]">
            {product.description}
          </p>
          <div className="mt-auto pt-5 flex items-center justify-between gap-3 pointer-events-auto">
            <div>
              <div className="text-xs text-muted-foreground">{product.amount}</div>
              <div className="text-xl font-bold text-foreground">
                {product.price.toFixed(2).replace(".", ",")} €
              </div>
            </div>
            <Button size="sm" onClick={() => onAdd(product)} className="rounded-lg">
              <Plus className="h-4 w-4" /> Lisa tellimusse
            </Button>
          </div>
        </div>
        <div className="w-full rounded-xl overflow-hidden bg-muted ring-1 ring-border" style={{ height: 352 }}>
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  );
}

interface ModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAdd: (p: Product) => void;
}

export function ProductQuickViewModal({ product, open, onOpenChange, onAdd }: ModalProps) {
  if (!product) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 z-10 rounded-full bg-background/80 backdrop-blur p-1.5 hover:bg-background"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="aspect-[4/3] w-full bg-muted">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{product.amount}</div>
              <div className="text-xl font-bold text-foreground">
                {product.price.toFixed(2).replace(".", ",")} €
              </div>
            </div>
            <Button
              onClick={() => {
                onAdd(product);
                onOpenChange(false);
              }}
              className="rounded-lg"
            >
              <Plus className="h-4 w-4" /> Lisa tellimusse
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
