import { Tag, ArrowRight } from "lucide-react";
import { specialOffer } from "@/lib/products";

export function SpecialOffer() {
  return (
    <aside className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-3">
        <Tag className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">
          Eripakkumised
        </h2>
      </div>
      <div className="p-4">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
          <img src={specialOffer.image} alt={specialOffer.name} className="h-full w-full object-cover" />
        </div>
        <div className="mt-3">
          <div className="font-medium text-foreground">{specialOffer.name}</div>
          <div className="text-xs text-muted-foreground">{specialOffer.amount}</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground line-through">
              {specialOffer.oldPrice.toFixed(2).replace(".", ",")} €
            </span>
            <span className="text-xl font-bold text-primary">
              {specialOffer.newPrice.toFixed(2).replace(".", ",")} €
            </span>
          </div>
        </div>
        <a
          href="#"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all"
        >
          Kõik eripakkumised <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </aside>
  );
}
