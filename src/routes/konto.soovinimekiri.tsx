import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, ShoppingCart, Loader2, Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getWishlist, removeFromWishlist, clearWishlist, moveWishlistToCart } from "@/lib/auth";

export const Route = createFileRoute("/konto/soovinimekiri")({
  component: WishlistPage,
});

function WishlistPage() {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["konto", "wishlist"],
    queryFn: getWishlist,
  });
  const [busyId, setBusyId] = useState<number | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["konto", "wishlist"] });
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  };

  const onRemove = async (productId: number) => {
    setBusyId(productId);
    try {
      await removeFromWishlist(productId);
      toast.success("Eemaldatud soovinimekirjast");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Eemaldamine ebaõnnestus");
    } finally { setBusyId(null); }
  };

  const onMoveToCart = async (wishlistItemId: number) => {
    setBusyId(wishlistItemId);
    try {
      await moveWishlistToCart(productId);
      toast.success("Lisatud ostukorvi");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Korvi lisamine ebaõnnestus");
    } finally { setBusyId(null); }
  };

  const onClear = async () => {
    if (!confirm("Tühjenda kogu soovinimekiri?")) return;
    try {
      await clearWishlist();
      toast.success("Soovinimekiri tühjendatud");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Tühjendamine ebaõnnestus");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Soovinimekiri</h1>
        {items.length > 0 && (
          <Button variant="outline" size="sm" onClick={onClear}>Tühjenda kõik</Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Laen…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <Heart className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">Soovinimekiri on tühi.</p>
          <Button asChild><Link to="/pood">Sirvi tooteid</Link></Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((it) => {
            const img = it.product?.base_image?.small_image_url ?? it.product?.base_image?.medium_image_url ?? it.product?.base_image?.url;
            return (
              <div key={it.id} className="rounded-2xl border border-border bg-card p-4 flex gap-4">
                <div className="h-20 w-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  {img && <img src={img} alt={it.product?.name ?? ""} className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to="/toode/$urlKey"
                    params={{ urlKey: it.product?.url_key ?? "" }}
                    className="font-medium hover:text-primary truncate block"
                  >{it.product?.name}</Link>
                  <div className="text-sm font-semibold mt-1">
                    {it.product?.formatted_price ?? (it.product?.price ? `${Number(it.product.price).toFixed(2)} €` : "")}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={() => onMoveToCart(it.id)} disabled={busyId === it.product_id}>
                      {busyId === it.product_id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShoppingCart className="h-3.5 w-3.5" />}
                      Korvi
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onRemove(it.product_id)} disabled={busyId === it.product_id}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
