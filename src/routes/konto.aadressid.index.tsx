import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Star, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getAddresses, deleteAddress, makeDefaultAddress, type CustomerAddress } from "@/lib/auth";

export const Route = createFileRoute("/konto/aadressid/")({
  component: AddressesPage,
});

function AddressesPage() {
  const queryClient = useQueryClient();
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["konto", "addresses"],
    queryFn: getAddresses,
  });
  const [busyId, setBusyId] = useState<number | null>(null);

  const onDelete = async (id: number) => {
    if (!confirm("Kustutada see aadress?")) return;
    setBusyId(id);
    try {
      await deleteAddress(id);
      toast.success("Aadress kustutatud");
      queryClient.invalidateQueries({ queryKey: ["konto", "addresses"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kustutamine ebaõnnestus");
    } finally { setBusyId(null); }
  };

  const onMakeDefault = async (id: number) => {
    setBusyId(id);
    try {
      await makeDefaultAddress(id);
      toast.success("Vaikimisi aadress seatud");
      queryClient.invalidateQueries({ queryKey: ["konto", "addresses"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Toiming ebaõnnestus");
    } finally { setBusyId(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Aadressid</h1>
        <Button asChild>
          <Link to="/konto/aadressid/uus"><Plus className="h-4 w-4" /> Lisa uus</Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Laen…</p>
      ) : addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-muted-foreground mb-4">Ühtegi aadressi pole salvestatud.</p>
          <Button asChild><Link to="/konto/aadressid/uus">Lisa esimene aadress</Link></Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <AddressCard
              key={a.id}
              a={a}
              busy={busyId === a.id}
              onDelete={() => a.id && onDelete(a.id)}
              onMakeDefault={() => a.id && onMakeDefault(a.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AddressCard({ a, busy, onDelete, onMakeDefault }: { a: CustomerAddress; busy: boolean; onDelete: () => void; onMakeDefault: () => void }) {
  const addressLine = Array.isArray(a.address) ? a.address.join(", ") : a.address;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="font-semibold">{a.first_name} {a.last_name}</div>
        {a.default_address ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
            <Star className="h-3 w-3" /> Vaikimisi
          </span>
        ) : null}
      </div>
      <div className="text-sm text-muted-foreground space-y-0.5">
        {a.company_name && <div>{a.company_name}</div>}
        <div>{addressLine}</div>
        <div>{a.postcode} {a.city}{a.state ? `, ${a.state}` : ""}</div>
        <div>{a.country}</div>
        {a.phone && <div>Tel: {a.phone}</div>}
      </div>
      <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-border">
        <Button asChild size="sm" variant="outline">
          <Link to="/konto/aadressid/$id/muuda" params={{ id: String(a.id) }}>
            <Pencil className="h-3.5 w-3.5" /> Muuda
          </Link>
        </Button>
        {!a.default_address && (
          <Button size="sm" variant="outline" onClick={onMakeDefault} disabled={busy}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Star className="h-3.5 w-3.5" />} Sea vaikimisi
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={onDelete} disabled={busy} className="text-destructive hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" /> Kustuta
        </Button>
      </div>
    </div>
  );
}
