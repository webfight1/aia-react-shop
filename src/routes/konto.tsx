import { useEffect } from "react";
import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { Header } from "@/components/shop/Header";
import { Nav } from "@/components/shop/Nav";
import { Footer } from "@/components/shop/Footer";
import { LayoutDashboard, Package, MapPin, Heart, UserCircle, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/konto")({
  head: () => ({ meta: [{ title: "Minu konto — aiamaailm.ee" }] }),
  component: KontoLayout,
});

const links = [
  { to: "/konto", label: "Ülevaade", icon: LayoutDashboard, exact: true },
  { to: "/konto/tellimused", label: "Tellimused", icon: Package },
  { to: "/konto/aadressid", label: "Aadressid", icon: MapPin },
  { to: "/konto/soovinimekiri", label: "Soovinimekiri", icon: Heart },
  { to: "/konto/profiil", label: "Profiil", icon: UserCircle },
] as const;

function KontoLayout() {
  const { isAuthenticated, isReady, logout, user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [isReady, isAuthenticated, navigate]);

  if (!isReady || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header /><Nav />
        <main className="flex-1 flex items-center justify-center text-muted-foreground">Laen…</main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Nav />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-8">
          <div className="grid md:grid-cols-[240px_1fr] gap-6">
            <aside className="rounded-2xl border border-border bg-card p-4 h-fit">
              <div className="mb-4 px-2">
                <div className="text-sm font-semibold">{user?.first_name} {user?.last_name}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
              </div>
              <nav className="space-y-1">
                {links.map((l) => {
                  const Icon = l.icon;
                  const active = l.exact ? pathname === l.to : pathname.startsWith(l.to);
                  return (
                    <Link
                      key={l.to}
                      to={l.to}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-primary/10 text-primary font-medium" : "text-foreground/80 hover:bg-accent"}`}
                    >
                      <Icon className="h-4 w-4" /> {l.label}
                    </Link>
                  );
                })}
                <button
                  type="button"
                  onClick={async () => { await logout(); navigate({ to: "/" }); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition"
                >
                  <LogOut className="h-4 w-4" /> Logi välja
                </button>
              </nav>
            </aside>
            <section><Outlet /></section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
