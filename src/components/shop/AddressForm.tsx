import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CustomerAddress } from "@/lib/auth";

const COUNTRIES = [
  { code: "EE", name: "Eesti" },
  { code: "LV", name: "Läti" },
  { code: "LT", name: "Leedu" },
  { code: "FI", name: "Soome" },
];

const EE_COUNTIES = [
  "Harju maakond", "Hiiu maakond", "Ida-Viru maakond", "Jõgeva maakond",
  "Järva maakond", "Lääne maakond", "Lääne-Viru maakond", "Põlva maakond",
  "Pärnu maakond", "Rapla maakond", "Saare maakond", "Tartu maakond",
  "Valga maakond", "Viljandi maakond", "Võru maakond",
];

type FormErrors = Record<string, string[]>;

interface Props {
  title: string;
  initial?: CustomerAddress;
  onSubmit: (data: CustomerAddress) => Promise<FormErrors | void>;
}

export function AddressForm({ title, initial, onSubmit }: Props) {
  const [form, setForm] = useState<CustomerAddress>({
    first_name: initial?.first_name ?? "",
    last_name: initial?.last_name ?? "",
    company_name: initial?.company_name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    address: Array.isArray(initial?.address) ? (initial.address[0] ?? "") : (initial?.address ?? ""),
    city: initial?.city ?? "",
    postcode: initial?.postcode ?? "",
    state: initial?.state ?? "",
    country: initial?.country ?? "EE",
    vat_id: initial?.vat_id ?? "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const errMsg = (k: string) => errors[k]?.[0];

  const set = <K extends keyof CustomerAddress>(k: K, v: CustomerAddress[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const result = await onSubmit({
        ...form,
        address: [typeof form.address === "string" ? form.address : (form.address[0] ?? "")],
      });
      if (result && Object.keys(result).length) setErrors(result);
    } finally {
      setSubmitting(false);
    }
  };

  const addressStr = typeof form.address === "string" ? form.address : (form.address[0] ?? "");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="rounded-2xl border border-border bg-card p-6 grid sm:grid-cols-2 gap-4">
        <Field label="Eesnimi *" err={errMsg("first_name")}>
          <Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} required />
        </Field>
        <Field label="Perekonnanimi *" err={errMsg("last_name")}>
          <Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} required />
        </Field>
        <Field label="Ettevõte (valikuline)" err={errMsg("company_name")}>
          <Input value={form.company_name ?? ""} onChange={(e) => set("company_name", e.target.value)} />
        </Field>
        <Field label="KMKR (valikuline)" err={errMsg("vat_id")}>
          <Input value={form.vat_id ?? ""} onChange={(e) => set("vat_id", e.target.value)} />
        </Field>
        <Field label="Telefon *" err={errMsg("phone")}>
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
        </Field>
        <Field label="Riik *" err={errMsg("country")}>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            value={form.country}
            onChange={(e) => { set("country", e.target.value); if (e.target.value !== "EE") set("state", ""); }}
          >
            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Aadress *" err={errMsg("address")}>
            <Input value={addressStr} onChange={(e) => set("address", e.target.value)} placeholder="Tänav, maja, korter" required />
          </Field>
        </div>
        <Field label="Linn *" err={errMsg("city")}>
          <Input value={form.city} onChange={(e) => set("city", e.target.value)} required />
        </Field>
        <Field label="Postiindeks *" err={errMsg("postcode")}>
          <Input value={form.postcode} onChange={(e) => set("postcode", e.target.value)} required />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Maakond" err={errMsg("state")}>
            {form.country === "EE" ? (
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={form.state ?? ""}
                onChange={(e) => set("state", e.target.value)}
              >
                <option value="">Vali maakond…</option>
                {EE_COUNTIES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            ) : (
              <Input value={form.state ?? ""} onChange={(e) => set("state", e.target.value)} />
            )}
          </Field>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Salvesta
        </Button>
      </div>
    </form>
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
