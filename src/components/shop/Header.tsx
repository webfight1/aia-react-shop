import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ShoppingCart, Menu, ChevronRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { AccountMenu } from "@/components/shop/AccountMenu";
import { SearchBar } from "@/components/shop/SearchBar";
import { buildTree, fetchCategories } from "@/lib/categories";

interface HeaderProps {
  cartCount?: number;
  cartTotal?: number;
}

const staticItems: { label: string; to?: string }[] = [
  { label: "Müügitingimused", to: "/muugitingimused" },
  { label: "Uudised", to: "/uudised" },
  { label: "Abikäsi" },
  { label: "Kontakt", to: "/kontakt" },
  { label: "Kasvatajatele" },
];

export function Header({
  cartCount: cartCountProp,
  cartTotal: cartTotalProp,
}: HeaderProps = {}) {
  const { itemsCount, subtotal } = useCart();
  const cartCount = cartCountProp ?? itemsCount;
  const cartTotal = cartTotalProp ?? (Number(subtotal) || 0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });

  const tree = buildTree(categories);

  const go = (to: string) => {
    setMobileOpen(false);
    navigate({ to });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden flex items-center justify-center h-9 w-9 rounded-xl border border-border bg-card text-foreground hover:bg-accent transition-colors"
          aria-label="Ava menüü"
        >
          <Menu className="h-5 w-5" />
        </button>

        <a href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
            a
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground hidden sm:inline">
            aiamaailm<span className="text-primary">.ee</span>
          </span>
        </a>

        <SearchBar />

        <div className="ml-auto flex items-center gap-4 text-sm">
          <AccountMenu />
          <a
            href="/ostukorv"
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm hover:bg-accent transition-colors"
          >
            <ShoppingCart className="h-4 w-4 text-primary" />
            <div className="text-xs leading-tight hidden sm:block">
              <div className="text-muted-foreground">Tellimus:</div>
              <div className="font-semibold text-foreground">
                {cartCount} {cartCount === 1 ? "toode" : "toodet"} ·{" "}
                {cartTotal.toFixed(2).replace(".", ",")} €
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Mobile navigation sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[360px] p-0">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="text-left text-base">Menüü</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => go("/firmast")}
              className="flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground/90 hover:bg-accent/60 transition-colors border-b border-border"
            >
              Firmast
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Categories accordion */}
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="categories" className="border-b border-border border-0">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium text-foreground/90 hover:bg-accent/60 transition-colors hover:no-underline">
                  Tootekataloog
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <div className="flex flex-col">
                    {tree.map((node) => (
                      <div key={node.id}>
                        <button
                          type="button"
                          onClick={() =>
                            go({
                              to: "/pood",
                              search: { cat: node.slug, name: node.name },
                            } as any)
                          }
                          className="flex w-full items-center justify-between px-6 py-2.5 text-sm text-foreground/85 hover:bg-accent/40 transition-colors"
                        >
                          <span>{node.name}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        {node.children.length > 0 && (
                          <div className="flex flex-col">
                            {node.children.map((child) => (
                              <button
                                key={child.id}
                                type="button"
                                onClick={() =>
                                  go({
                                    to: "/pood",
                                    search: {
                                      cat: child.slug,
                                      name: child.name,
                                    },
                                  } as any)
                                }
                                className="flex w-full items-center justify-between pl-10 pr-6 py-2 text-xs text-muted-foreground hover:bg-accent/40 transition-colors"
                              >
                                <span>{child.name}</span>
                                <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {staticItems.map((item) =>
              item.to ? (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => go(item.to!)}
                  className="flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground/90 hover:bg-accent/60 transition-colors border-b border-border last:border-b-0"
                >
                  {item.label}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ) : (
                <span
                  key={item.label}
                  className="flex items-center px-4 py-3 text-sm font-medium text-foreground/90 border-b border-border"
                >
                  {item.label}
                </span>
              )
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
