import { ShoppingCart, User } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { AccountMenu } from "@/components/shop/AccountMenu";
import { SearchBar } from "@/components/shop/SearchBar";


interface HeaderProps {
  cartCount?: number;
  cartTotal?: number;
}

const SHIPPING = 1.79;

export function Header({ cartCount: cartCountProp, cartTotal: cartTotalProp }: HeaderProps = {}) {
  const { itemsCount, subtotal } = useCart();
  const cartCount = cartCountProp ?? itemsCount;
  const cartTotal = cartTotalProp ?? (Number(subtotal) || 0);

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

        <SearchBar />


        <div className="ml-auto flex items-center gap-4 text-sm">
          <AccountMenu />
          <a href="/ostukorv" className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm hover:bg-accent transition-colors">
            <ShoppingCart className="h-4 w-4 text-primary" />
            <div className="text-xs leading-tight">
              <div className="text-muted-foreground">Tellimus:</div>
              <div className="font-semibold text-foreground">
                {cartCount} {cartCount === 1 ? "toode" : "toodet"} · {cartTotal.toFixed(2).replace(".", ",")} €
              </div>
            </div>
          </a>
        </div>
      </div>
    </header>
  );
}
