import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser, updateProfile, AuthApiError, type AuthUser } from "@/lib/auth";

export const Route = createFileRoute("/konto/profiil")({
  component: ProfilePage,
});

function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ["konto", "me"],
    queryFn: getCurrentUser,
  });

  if (isLoading) return <p className="text-muted-foreground">Laen…</p>;
  if (!user) return <p className="text-muted-foreground">Andmete laadimine ebaõnnestus.</p>;

  return <ProfileForm user={user} onSaved={() => queryClient.invalidateQueries({ queryKey: ["konto", "me"] })} />;
}

function ProfileForm({ user, onSaved }: { user: AuthUser; onSaved: () => void }) {
  const [form, setForm] = useState({
    first_name: user.first_name ?? "",
    last_name: user.last_name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    date_of_birth: user.date_of_birth ?? "",
    gender: user.gender ?? "",
  });
  const [pw, setPw] = useState({ oldpassword: "", password: "", password_confirmation: "" });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const errMsg = (k: string) => errors[k]?.[0];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (pw.password) {
        payload.oldpassword = pw.oldpassword;
        payload.password = pw.password;
        payload.password_confirmation = pw.password_confirmation;
      }
      await updateProfile(payload as Parameters<typeof updateProfile>[0]);
      toast.success("Profiil on uuendatud");
      setPw({ oldpassword: "", password: "", password_confirmation: "" });
      onSaved();
    } catch (e) {
      if (e instanceof AuthApiError) {
        setErrors(e.errors ?? {});
        toast.error(e.message);
      } else toast.error("Salvestamine ebaõnnestus");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profiil</h1>
      <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Eesnimi" err={errMsg("first_name")}>
            <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
          </Field>
          <Field label="Perekonnanimi" err={errMsg("last_name")}>
            <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
          </Field>
          <Field label="E-post" err={errMsg("email")}>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </Field>
          <Field label="Telefon" err={errMsg("phone")}>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Sünnipäev" err={errMsg("date_of_birth")}>
            <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
          </Field>
          <Field label="Sugu" err={errMsg("gender")}>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="">—</option>
              <option value="Male">Mees</option>
              <option value="Female">Naine</option>
              <option value="Other">Muu</option>
            </select>
          </Field>
        </div>

        <div className="border-t border-border pt-6">
          <h2 className="font-semibold mb-3">Muuda parooli (valikuline)</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Praegune parool" err={errMsg("oldpassword")}>
              <Input type="password" value={pw.oldpassword} onChange={(e) => setPw({ ...pw, oldpassword: e.target.value })} />
            </Field>
            <Field label="Uus parool" err={errMsg("password")}>
              <Input type="password" value={pw.password} onChange={(e) => setPw({ ...pw, password: e.target.value })} />
            </Field>
            <Field label="Uus parool uuesti" err={errMsg("password_confirmation")}>
              <Input type="password" value={pw.password_confirmation} onChange={(e) => setPw({ ...pw, password_confirmation: e.target.value })} />
            </Field>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Salvesta
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, err, children }: { label: string; err?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}
