import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import { useState } from "react";
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
import { getOrder, cancelOrder, reorder, withdrawOrder } from "@/lib/auth";
import { orderStatusLabel } from "@/lib/order-status";

export const Route = createFileRoute("/konto/tellimused/$id")({
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<"cancel" | "reorder" | "withdraw" | null>(null);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ["konto", "order", id],
    queryFn: () => getOrder(id),
  });

  const onCancel = async () => {
    if (!confirm("Kas oled kindel, et soovid tellimuse tühistada?")) return;
    setBusy("cancel");
    try {
      await cancelOrder(id);
      toast.success("Tellimus on tühistatud");
      queryClient.invalidateQueries({ queryKey: ["konto", "order", id] });
      queryClient.invalidateQueries({ queryKey: ["konto", "orders"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Tühistamine ebaõnnestus");
    } finally {
      setBusy(null);
    }
  };

  const onReorder = async () => {
    setBusy("reorder");
    try {
      await reorder(id);
      toast.success("Tooted on lisatud ostukorvi");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      navigate({ to: "/ostukorv" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Korvi lisamine ebaõnnestus");
    } finally {
      setBusy(null);
    }
  };

  const onWithdraw = async () => {
    setBusy("withdraw");
    try {
      await withdrawOrder(id);
      toast.success("Tellimusest taganetud. Saatsime poele teate.");
      queryClient.invalidateQueries({ queryKey: ["konto", "order", id] });
      queryClient.invalidateQueries({ queryKey: ["konto", "orders"] });
      setShowWithdraw(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Taganemine ebaõnnestus");
    } finally {
      setBusy(null);
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Laen…</p>;
  if (!order) return <p className="text-muted-foreground">Tellimust ei leitud.</p>;

  const canCancel = ["pending", "processing"].includes(order.status);
  const canWithdraw = !["withdrawn", "canceled", "closed"].includes(order.status);

  return (
    <div className="space-y-6">
      <div>
        <Link to="/konto/tellimused" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Tagasi tellimuste juurde
        </Link>
        <h1 className="text-2xl font-bold mt-2">Tellimus #{order.increment_id}</h1>
        <p className="text-sm text-muted-foreground">
          {new Date(order.created_at).toLocaleString("et-EE")} · staatus: <span className="font-medium text-foreground">{orderStatusLabel(order.status)}</span>
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-3">Tooted</h2>
        {(order.items ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Tooteid pole.</p>
        ) : (
          <ul className="divide-y divide-border">
            {(order.items ?? []).map((it) => (
              <li key={it.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-muted-foreground">Kogus: {it.qty_ordered}</div>
                </div>
                <div className="font-semibold tabular-nums">{it.formatted_total ?? `${Number(it.total).toFixed(2)} €`}</div>
              </li>
            ))}
          </ul>
        )}
        <div className="border-t border-border mt-4 pt-4 flex justify-between items-baseline">
          <span className="font-semibold">Kokku</span>
          <span className="text-lg font-bold tabular-nums">
            {order.formatted_grand_total ?? `${Number(order.grand_total).toFixed(2)} €`}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={onReorder} disabled={busy !== null}>
          {busy === "reorder" && <Loader2 className="h-4 w-4 animate-spin" />} Telli uuesti
        </Button>
        {canCancel && (
          <Button variant="outline" onClick={onCancel} disabled={busy !== null}>
            {busy === "cancel" && <Loader2 className="h-4 w-4 animate-spin" />} Tühista tellimus
          </Button>
        )}
      </div>

      {canWithdraw && (
        <p className="text-sm text-muted-foreground">
          Ei soovi toodet?{" "}
          <button
            type="button"
            onClick={() => setShowWithdraw(true)}
            disabled={busy !== null}
            className="underline hover:text-foreground"
          >
            Tagane ostust
          </button>
        </p>
      )}

      <AlertDialog open={showWithdraw} onOpenChange={setShowWithdraw}>
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
            <AlertDialogCancel disabled={busy === "withdraw"}>Tühista</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); onWithdraw(); }}
              disabled={busy === "withdraw"}
              className="bg-red-600 hover:bg-red-700"
            >
              {busy === "withdraw" && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Jah, tagane
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
