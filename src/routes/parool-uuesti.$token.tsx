import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/shop/Header";
import { Nav } from "@/components/shop/Nav";
import { Footer } from "@/components/shop/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword, AuthApiError } from "@/lib/auth";

export const Route = createFileRoute("/parool-uuesti/$token")({
  head: () => ({ meta: [{ title: "Uus parool — aiamaailm.ee" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ email: typeof s.email === "string" ? s.email : "" }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useParams();
  const { email: emailFromUrl } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState(emailFromUrl);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const errMsg = (k: string) => errors[k]?.[0];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (password !== confirm) {
      setErrors({ password_confirmation: ["Paroolid ei kattu"] });
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword({ token, email, password, password_confirmation: confirm });
      toast.success("Parool on uuendatud — palun logi sisse");
      navigate({ to: "/login" });
    } catch (e) {
      if (e instanceof AuthApiError) {
        setErrors(e.errors ?? {});
        toast.error(e.message);
      } else toast.error("Parooli muutmine ebaõnnestus");
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
            <h1 className="text-2xl font-bold mb-6">Uus parool</h1>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>E-post</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                {errMsg("email") && <p className="text-xs text-destructive">{errMsg("email")}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Uus parool</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                {errMsg("password") && <p className="text-xs text-destructive">{errMsg("password")}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Parool uuesti</Label>
                <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                {errMsg("password_confirmation") && <p className="text-xs text-destructive">{errMsg("password_confirmation")}</p>}
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Salvesta uus parool
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
