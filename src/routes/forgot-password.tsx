import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/shop/Header";
import { Nav } from "@/components/shop/Nav";
import { Footer } from "@/components/shop/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword, AuthApiError } from "@/lib/auth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Parooli taastamine — aiamaailm.ee" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success("Saatsime parooli taastamise lingi e-postile");
    } catch (e) {
      const msg = e instanceof AuthApiError ? e.message : "Saatmine ebaõnnestus";
      toast.error(msg);
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
            <h1 className="text-2xl font-bold mb-2">Unustasid parooli?</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Sisesta oma e-posti aadress ja saadame sulle taastamise lingi.
            </p>
            {sent ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-primary/10 px-4 py-3 text-sm">
                  Kui konto on olemas, leiad varsti e-postist taastamise lingi.
                </div>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/login">Tagasi sisselogimisse</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>E-post</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Saada link
                </Button>
                <div className="text-center text-sm">
                  <Link to="/login" className="text-muted-foreground hover:text-foreground">Tagasi sisselogimisse</Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
