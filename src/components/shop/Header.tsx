import { Search, ShoppingCart, User, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  cartCount: number;
  cartTotal: number;
}

export function Header({ cartCount, cartTotal }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 md:px-6">
        <a href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
            a
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            aiamaailm<span className="text-primary">.ee</span>
          </span>
        </a>

        <div className="relative flex-1 max-w-xl hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Otsi tooteid, sorte, seemneid…"
            className="pl-9 pr-20 h-10 rounded-xl bg-secondary border-transparent focus-visible:border-primary"
          />
          <Button
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 rounded-lg"
          >
            Otsi
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-4 text-sm">
          <a href="#" className="hidden lg:flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <User className="h-4 w-4" /> Püsikliendi konto
          </a>
          <a href="#" className="hidden lg:flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <LogIn className="h-4 w-4" /> Sisene
          </a>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
            <ShoppingCart className="h-4 w-4 text-primary" />
            <div className="text-xs leading-tight">
              <div className="text-muted-foreground">Tellimus:</div>
              <div className="font-semibold text-foreground">
                {cartCount} {cartCount === 1 ? "toode" : "toodet"} · {cartTotal.toFixed(2).replace(".", ",")} €
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
