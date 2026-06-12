import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/shop/Header";
import { Nav } from "@/components/shop/Nav";
import { Footer } from "@/components/shop/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { AuthApiError } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sisene — aiamaailm.ee" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  // login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // register
  const [r, setR] = useState({
    first_name: "", last_name: "", email: "", password: "", password_confirmation: "",
    is_subscribed: false,
  });

  const errMsg = (k: string) => errors[k]?.[0];

  const handleError = (e: unknown, fb: string) => {
    if (e instanceof AuthApiError) {
      setErrors(e.errors ?? {});
      toast.error(e.message || fb);
    } else {
      toast.error(e instanceof Error ? e.message : fb);
    }
  };

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      await login({ email, password });
      toast.success("Tere tulemast tagasi!");
      navigate({ to: "/konto" });
    } catch (e) {
      handleError(e, "Sisselogimine ebaõnnestus");
    } finally {
      setSubmitting(false);
    }
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (r.password !== r.password_confirmation) {
      setErrors({ password_confirmation: ["Paroolid ei kattu"] });
      return;
    }
    setSubmitting(true);
    try {
      await register(r);
      toast.success("Konto on loodud!");
      navigate({ to: "/konto" });
    } catch (e) {
      handleError(e, "Registreerimine ebaõnnestus");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Nav />
      <main className="flex-1">
        <div className="mx-auto max-w-md px-4 md:px-6 py-10">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex gap-2 mb-6 rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => { setTab("login"); setErrors({}); }}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition ${tab === "login" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
              >Logi sisse</button>
              <button
                type="button"
                onClick={() => { setTab("register"); setErrors({}); }}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition ${tab === "register" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
              >Loo konto</button>
            </div>

            {tab === "login" ? (
              <form onSubmit={onLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>E-post</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  {errMsg("email") && <p className="text-xs text-destructive">{errMsg("email")}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Parool</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  {errMsg("password") && <p className="text-xs text-destructive">{errMsg("password")}</p>}
                </div>
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Logi sisse
                </Button>
                <div className="text-center text-sm">
                  <Link to="/forgot-password" className="text-primary hover:underline">Unustasid parooli?</Link>
                </div>
              </form>
            ) : (
              <form onSubmit={onRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Eesnimi</Label>
                    <Input value={r.first_name} onChange={(e) => setR({ ...r, first_name: e.target.value })} required />
                    {errMsg("first_name") && <p className="text-xs text-destructive">{errMsg("first_name")}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Perekonnanimi</Label>
                    <Input value={r.last_name} onChange={(e) => setR({ ...r, last_name: e.target.value })} required />
                    {errMsg("last_name") && <p className="text-xs text-destructive">{errMsg("last_name")}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>E-post</Label>
                  <Input type="email" value={r.email} onChange={(e) => setR({ ...r, email: e.target.value })} required />
                  {errMsg("email") && <p className="text-xs text-destructive">{errMsg("email")}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Parool (vähemalt 8 tähemärki)</Label>
                  <Input type="password" value={r.password} onChange={(e) => setR({ ...r, password: e.target.value })} required minLength={8} />
                  {errMsg("password") && <p className="text-xs text-destructive">{errMsg("password")}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Parool uuesti</Label>
                  <Input type="password" value={r.password_confirmation} onChange={(e) => setR({ ...r, password_confirmation: e.target.value })} required />
                  {errMsg("password_confirmation") && <p className="text-xs text-destructive">{errMsg("password_confirmation")}</p>}
                </div>
                <label className="flex items-start gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={r.is_subscribed}
                    onChange={(e) => setR({ ...r, is_subscribed: e.target.checked })}
                    className="mt-0.5"
                  />
                  Soovin tellida uudiskirja
                </label>
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Loo konto
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
