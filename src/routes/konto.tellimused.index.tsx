import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Undo2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getOrders, withdrawOrder } from "@/lib/auth";
import { orderStatusLabel } from "@/lib/order-status";

export const Route = createFileRoute("/konto/tellimused/")({
  component: OrdersListPage,
});

function OrdersListPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [withdrawId, setWithdrawId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["konto", "orders", page],
    queryFn: () => getOrders(page, 20),
  });

  const orders = data?.data ?? [];
  const meta = data?.meta;

  const onWithdraw = async () => {
    if (!withdrawId) return;
    setBusy(true);
    try {
      await withdrawOrder(withdrawId);
      toast.success("Tellimusest taganetud. Saatsime poele teate.");
      queryClient.invalidateQueries({ queryKey: ["konto", "orders"] });
      setWithdrawId(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Taganemine ebaõnnestus");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Minu tellimused</h1>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">Laen…</p>
        ) : orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Tellimusi pole.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2">Number</th>
                <th className="text-left px-4 py-2">Kuupäev</th>
                <th className="text-left px-4 py-2">Staatus</th>
                <th className="text-right px-4 py-2">Summa</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const canWithdraw = !["withdrawn", "canceled", "closed"].includes(o.status);
                return (
                  <tr key={o.id} className="border-t border-border hover:bg-accent/30">
                    <td className="px-4 py-3 font-medium">#{o.increment_id}</td>
                    <td className="px-4 py-3">{new Date(o.created_at).toLocaleDateString("et-EE")}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">
                      {o.formatted_grand_total ?? `${Number(o.grand_total).toFixed(2)} €`}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        to="/konto/tellimused/$id"
                        params={{ id: String(o.id) }}
                        className="text-primary hover:underline"
                      >Vaata</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border border-border px-3 py-1.5 disabled:opacity-50"
          >Eelmine</button>
          <span className="text-muted-foreground">Lk {meta.current_page} / {meta.last_page}</span>
          <button
            disabled={page >= meta.last_page}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-border px-3 py-1.5 disabled:opacity-50"
          >Järgmine</button>
        </div>
      )}

      <AlertDialog open={withdrawId !== null} onOpenChange={(o) => !o && setWithdrawId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Kas oled kindel?
            </AlertDialogTitle>
            <AlertDialogDescription>
              EL-i seaduse alusel on sul õigus 14 päeva jooksul ostust taganeda.
              Pärast kinnitamist saadame poeomanikule teate ja tellimuse staatus muutub
              <strong> "Taganetud"</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Tühista</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); onWithdraw(); }}
              disabled={busy}
              className="bg-red-600 hover:bg-red-700"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Jah, tagane
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    processing: "bg-blue-100 text-blue-700",
    pending: "bg-amber-100 text-amber-700",
    completed: "bg-green-100 text-green-700",
    canceled: "bg-red-100 text-red-700",
    closed: "bg-gray-200 text-gray-700",
    withdrawn: "bg-orange-100 text-orange-700",
  };
  const cls = colors[status] ?? "bg-muted text-foreground";
  return <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${cls}`}>{orderStatusLabel(status)}</span>;
}
