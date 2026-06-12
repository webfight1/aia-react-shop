import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, MapPin, Heart, UserCircle } from "lucide-react";
import { getOrders, getAddresses, getWishlist } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/konto/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const orders = useQuery({ queryKey: ["konto", "orders-summary"], queryFn: () => getOrders(1, 5) });
  const addresses = useQuery({ queryKey: ["konto", "addresses"], queryFn: getAddresses });
  const wishlist = useQuery({ queryKey: ["konto", "wishlist"], queryFn: getWishlist });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tere, {user?.first_name}!</h1>
        <p className="text-sm text-muted-foreground">Halda oma tellimusi, aadresse ja profiili.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Tile to="/konto/tellimused" icon={Package} title="Tellimused" count={orders.data?.meta?.total ?? orders.data?.data?.length} />
        <Tile to="/konto/aadressid" icon={MapPin} title="Aadressid" count={addresses.data?.length} />
        <Tile to="/konto/soovinimekiri" icon={Heart} title="Soovinimekiri" count={wishlist.data?.length} />
        <Tile to="/konto/profiil" icon={UserCircle} title="Profiil" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Viimased tellimused</h2>
          <Link to="/konto/tellimused" className="text-sm text-primary hover:underline">Vaata kõiki</Link>
        </div>
        {orders.isLoading ? (
          <p className="text-sm text-muted-foreground">Laen…</p>
        ) : (orders.data?.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Tellimusi pole veel.</p>
        ) : (
          <ul className="divide-y divide-border">
            {(orders.data?.data ?? []).slice(0, 5).map((o) => (
              <li key={o.id}>
                <Link
                  to="/konto/tellimused/$id"
                  params={{ id: String(o.id) }}
                  className="flex items-center justify-between gap-3 py-3 text-sm hover:bg-accent/40 -mx-2 px-2 rounded"
                >
                  <div>
                    <div className="font-medium">#{o.increment_id}</div>
                    <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("et-EE")} · {o.status}</div>
                  </div>
                  <div className="font-semibold tabular-nums">{o.formatted_grand_total ?? `${Number(o.grand_total).toFixed(2)} €`}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Tile({ to, icon: Icon, title, count }: { to: string; icon: typeof Package; title: string; count?: number }) {
  return (
    <Link to={to} className="rounded-2xl border border-border bg-card p-5 hover:border-primary transition group">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="font-semibold">{title}</div>
          {typeof count === "number" && <div className="text-xs text-muted-foreground">{count}</div>}
        </div>
      </div>
    </Link>
  );
}
