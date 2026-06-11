import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/shop/Header";
import { Nav } from "@/components/shop/Nav";
import { Footer } from "@/components/shop/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/useCart";
import {
  CartApiError,
  clearCartToken,
  getPaymentMethods,
  getShippingMethods,
  placeOrder,
  saveCheckoutAddresses,
  savePaymentMethod,
  saveShippingMethod,
  type CheckoutAddress,
  type ShippingRate,
} from "@/lib/cart";

export const Route = createFileRoute("/kassa")({
  head: () => ({
    meta: [
      { title: "Kassa — aiamaailm.ee" },
      { name: "description", content: "Vormista tellimus aiamaailm.ee e-poes." },
    ],
  }),
  component: CheckoutPage,
});

interface FormState {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postcode: string;
  state: string;
  country: string;
  company_name: string;
}

const initial: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postcode: "",
  state: "",
  country: "EE",
  company_name: "",
};

const COUNTRIES = [
  { code: "EE", name: "Eesti" },
  { code: "LV", name: "Läti" },
  { code: "LT", name: "Leedu" },
];

const EE_COUNTIES = [
  "Harju maakond",
  "Hiiu maakond",
  "Ida-Viru maakond",
  "Jõgeva maakond",
  "Järva maakond",
  "Lääne maakond",
  "Lääne-Viru maakond",
  "Põlva maakond",
  "Pärnu maakond",
  "Rapla maakond",
  "Saare maakond",
  "Tartu maakond",
  "Valga maakond",
  "Viljandi maakond",
  "Võru maakond",
];

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",");
}

function toAddress(f: FormState, hasCompany: boolean): CheckoutAddress {
  // Bagisto eeldab address/city/postcode välju — ilma ettevõtteta saadame placeholderid.
  return {
    first_name: f.first_name.trim(),
    last_name: f.last_name.trim(),
    email: f.email.trim(),
    phone: f.phone.trim(),
    address: [hasCompany ? f.address.trim() : "-"],
    city: hasCompany ? f.city.trim() : "-",
    postcode: hasCompany ? f.postcode.trim() : "00000",
    state: hasCompany ? f.state.trim() : "",
    country: (f.country.trim() || "EE").toUpperCase(),
    company_name: f.company_name.trim(),
    vat_id: "",
  };
}

function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { items, itemsCount, subtotal, isLoading } = useCart();
  const sub = Number(subtotal) || 0;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [shippingMethod, setShippingMethod] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const shippingQuery = useQuery({
    queryKey: ["checkout", "shipping-methods"],
    queryFn: getShippingMethods,
    enabled: step >= 2,
    staleTime: 0,
  });
  const paymentQuery = useQuery({
    queryKey: ["checkout", "payment-methods"],
    queryFn: getPaymentMethods,
    enabled: step >= 3,
    staleTime: 0,
  });

  const shippingRates = useMemo<ShippingRate[]>(() => {
    const groups = shippingQuery.data ?? {};
    return Object.values(groups).flatMap((g) =>
      g.rates.map((r) => ({ ...r, carrier_title: r.carrier_title ?? g.carrier_title })),
    );
  }, [shippingQuery.data]);

  const selectedRate = shippingRates.find((r) => r.method === shippingMethod);
  const shippingCost = Number(selectedRate?.price) || 0;
  const total = sub + shippingCost;

  useEffect(() => {
    if (step >= 2 && !shippingMethod && shippingRates.length) {
      setShippingMethod(shippingRates[0].method);
    }
  }, [shippingRates, shippingMethod, step]);
  useEffect(() => {
    if (step >= 3 && !paymentMethod && paymentQuery.data?.length) {
      setPaymentMethod(paymentQuery.data[0].method);
    }
  }, [paymentQuery.data, paymentMethod, step]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const errMsg = (k: string) => errors[k]?.[0] || errors[`billing.${k}`]?.[0];

  const handleApiError = (e: unknown, fallback: string) => {
    if (e instanceof CartApiError) {
      setErrors(e.errors ?? {});
      toast.error(e.message || fallback);
    } else {
      toast.error(e instanceof Error ? e.message : fallback);
    }
  };

  const submitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const required: Array<keyof FormState> = [
      "first_name", "last_name", "email", "phone", "address", "city", "postcode",
    ];
    const localErrors: Record<string, string[]> = {};
    for (const k of required) {
      if (!form[k].trim()) localErrors[k] = ["Väli on kohustuslik"];
    }
    if (Object.keys(localErrors).length) {
      setErrors(localErrors);
      return;
    }
    setSubmitting(true);
    try {
      await saveCheckoutAddresses(toAddress(form));
      setStep(2);
    } catch (e) {
      handleApiError(e, "Aadressi salvestamine ebaõnnestus");
    } finally {
      setSubmitting(false);
    }
  };

  const submitShipping = async () => {
    if (!shippingMethod) return toast.error("Vali tarneviis");
    setSubmitting(true);
    try {
      await saveShippingMethod(shippingMethod);
      setStep(3);
    } catch (e) {
      handleApiError(e, "Tarneviisi salvestamine ebaõnnestus");
    } finally {
      setSubmitting(false);
    }
  };

  const submitPayment = async () => {
    if (!paymentMethod) return toast.error("Vali makseviis");
    setSubmitting(true);
    try {
      await savePaymentMethod(paymentMethod);
      const result = await placeOrder();
      clearCartToken();
      queryClient.setQueryData(["cart"], null);
      if (result.redirect_url) {
        window.location.href = result.redirect_url;
        return;
      }
      const id = result.order?.increment_id ?? String(result.order?.id ?? "");
      navigate({ to: "/aitah", search: { id } });
    } catch (e) {
      handleApiError(e, "Tellimuse esitamine ebaõnnestus");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={itemsCount} cartTotal={total} />
      <Nav />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">Kassa</h1>
          <Steps step={step} />

          {isLoading ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground mt-6">Laen…</div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center mt-6">
              <p className="text-muted-foreground mb-4">Ostukorv on tühi.</p>
              <Button asChild><Link to="/pood">Vaata tooteid</Link></Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-[1fr_340px] gap-6 mt-6">
              <section className="rounded-2xl border border-border bg-card p-6">
                {step === 1 && (
                  <form onSubmit={submitAddress} className="space-y-4">
                    <h2 className="text-xl font-semibold">Aadress</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Eesnimi *" err={errMsg("first_name")}>
                        <Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} />
                      </Field>
                      <Field label="Perekonnanimi *" err={errMsg("last_name")}>
                        <Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} />
                      </Field>
                      <Field label="E-post *" err={errMsg("email")}>
                        <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                      </Field>
                      <Field label="Telefon *" err={errMsg("phone")}>
                        <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+372..." />
                      </Field>
                      <Field label="Ettevõte" err={errMsg("company_name")}>
                        <Input value={form.company_name} onChange={(e) => set("company_name", e.target.value)} />
                      </Field>
                      <Field label="Riik *" err={errMsg("country")}>
                        <Input value={form.country} onChange={(e) => set("country", e.target.value.toUpperCase())} maxLength={2} />
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="Aadress *" err={errMsg("address")}>
                          <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Tänav, maja, korter" />
                        </Field>
                      </div>
                      <Field label="Linn *" err={errMsg("city")}>
                        <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
                      </Field>
                      <Field label="Postiindeks *" err={errMsg("postcode")}>
                        <Input value={form.postcode} onChange={(e) => set("postcode", e.target.value)} />
                      </Field>
                      <Field label="Maakond" err={errMsg("state")}>
                        <Input value={form.state} onChange={(e) => set("state", e.target.value)} />
                      </Field>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button type="submit" disabled={submitting}>
                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Jätka tarneviisi juurde
                      </Button>
                    </div>
                  </form>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Tarneviis</h2>
                    {shippingQuery.isLoading ? (
                      <p className="text-muted-foreground text-sm">Laen tarneviise…</p>
                    ) : shippingRates.length === 0 ? (
                      <p className="text-destructive text-sm">Tarneviise ei leitud.</p>
                    ) : (
                      <ul className="space-y-2">
                        {shippingRates.map((r) => (
                          <li key={r.method}>
                            <label className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-accent/50">
                              <input
                                type="radio"
                                name="ship"
                                value={r.method}
                                checked={shippingMethod === r.method}
                                onChange={() => setShippingMethod(r.method)}
                              />
                              <div className="flex-1">
                                <div className="font-medium">{r.method_title}</div>
                                {r.carrier_title && <div className="text-xs text-muted-foreground">{r.carrier_title}</div>}
                              </div>
                              <div className="tabular-nums font-semibold">
                                {r.base_formatted_price ?? `${fmt(Number(r.price) || 0)} €`}
                              </div>
                            </label>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex justify-between pt-2">
                      <Button variant="outline" onClick={() => setStep(1)}>Tagasi</Button>
                      <Button onClick={submitShipping} disabled={submitting || !shippingMethod}>
                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Jätka makseviisi juurde
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Makseviis</h2>
                    {paymentQuery.isLoading ? (
                      <p className="text-muted-foreground text-sm">Laen makseviise…</p>
                    ) : (paymentQuery.data ?? []).length === 0 ? (
                      <p className="text-destructive text-sm">Makseviise ei leitud.</p>
                    ) : (
                      <ul className="space-y-2">
                        {(paymentQuery.data ?? []).map((p) => (
                          <li key={p.method}>
                            <label className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-accent/50">
                              <input
                                type="radio"
                                name="pay"
                                value={p.method}
                                checked={paymentMethod === p.method}
                                onChange={() => setPaymentMethod(p.method)}
                              />
                              <div className="flex-1">
                                <div className="font-medium">{p.method_title}</div>
                                {p.description && <div className="text-xs text-muted-foreground">{p.description}</div>}
                              </div>
                            </label>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex justify-between pt-2">
                      <Button variant="outline" onClick={() => setStep(2)}>Tagasi</Button>
                      <Button onClick={submitPayment} disabled={submitting || !paymentMethod}>
                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Esita tellimus
                      </Button>
                    </div>
                  </div>
                )}
              </section>

              <aside className="rounded-2xl border border-border bg-card p-5 h-fit space-y-3">
                <h3 className="font-semibold">Kokkuvõte</h3>
                <ul className="divide-y divide-border text-sm">
                  {items.map((item) => (
                    <li key={item.id} className="flex justify-between py-2 gap-3">
                      <span className="truncate">{item.quantity}× {item.name}</span>
                      <span className="tabular-nums shrink-0">{fmt(Number(item.total) || 0)} €</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border pt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Vahesumma</span><span className="tabular-nums">{fmt(sub)} €</span></div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tarne</span>
                    <span className="tabular-nums">{selectedRate ? `${fmt(shippingCost)} €` : "—"}</span>
                  </div>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-semibold">Kokku</span>
                  <span className="text-lg font-bold tabular-nums">{fmt(total)} €</span>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Steps({ step }: { step: 1 | 2 | 3 }) {
  const labels = ["Aadress", "Tarne", "Makse"];
  return (
    <ol className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
      {labels.map((l, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const active = n === step;
        const done = n < step;
        return (
          <li key={l} className="flex items-center gap-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${active ? "bg-primary text-primary-foreground" : done ? "bg-primary/20 text-primary" : "bg-muted"}`}>{n}</span>
            <span className={active ? "text-foreground font-medium" : ""}>{l}</span>
            {n < 3 && <span className="mx-1">›</span>}
          </li>
        );
      })}
    </ol>
  );
}

function Field({ label, err, children }: { label: string; err?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}
