import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Leaf,
  Truck,
  Sprout,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Header } from "@/components/shop/Header";
import { Nav } from "@/components/shop/Nav";
import { Footer } from "@/components/shop/Footer";
import { Button } from "@/components/ui/button";
import { buildTree, fetchCategories } from "@/lib/categories";
import { fetchProducts, type Product } from "@/lib/products";
import heroImage from "@/assets/hero-garden.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aiamaailm.ee — paneme aiad elama" },
      {
        name: "description",
        content:
          "Kvaliteetsed seemned, lillesibulad ja aiapidaja tarvikud otse Eestist. Väga hea idanevus, lai valik ja mõistlik hind.",
      },
      { property: "og:title", content: "Aiamaailm.ee — paneme aiad elama" },
      {
        property: "og:description",
        content:
          "Kvaliteetsed seemned, lillesibulad ja aiapidaja tarvikud otse Eestist.",
      },
    ],
  }),
  component: HomePage,
});

const FEATURED_CATEGORY = "uued-seemned-202526";

function HomePage() {
  const { data: catsRaw = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });
  const { data: featured = [] } = useQuery({
    queryKey: ["products", FEATURED_CATEGORY],
    queryFn: () => fetchProducts(FEATURED_CATEGORY),
    staleTime: 60_000,
  });

  const topCategories = buildTree(catsRaw).slice(0, 6);
  const featuredProducts = featured.slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={0} cartTotal={0} />
      <Nav onSelectCategory={() => {}} />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 -z-10 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
            aria-hidden
          />
          <div
            className="absolute inset-0 -z-10 bg-gradient-to-r from-background/95 via-background/70 to-background/10"
            aria-hidden
          />

          <div className="mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-28">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sprout className="h-3.5 w-3.5" />
                Hooaeg 2025 / 26
              </span>
              <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.05]">
                Paneme aiad{" "}
                <span className="text-primary italic font-serif">elama.</span>
              </h1>
              <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed">
                Väga hea idanevusega seemned, lai valik lillesibulaid ja
                aiapidaja tarvikuid — otse aiakasvataja juurest sinu peenrale.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-xl h-12 px-6">
                  <Link to="/pood">
                    Vaata kataloogi
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-xl h-12 px-6 bg-background/70 backdrop-blur"
                >
                  <a href="#lugu">Meie lugu</a>
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" /> 30+ aastat kogemust
                </span>
                <span className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-primary" /> 1500+ sorti
                </span>
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" /> Saatmine kogu Eestisse
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* VALUE PROPS */}
        <section className="border-y border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Sprout, t: "Kõrge idanevus", d: "Iga partii testitud" },
              { icon: Leaf, t: "Värske saak", d: "Otse kasvatajalt" },
              { icon: Truck, t: "Kiire saatmine", d: "Postiga 3 päevaga" },
              { icon: ShieldCheck, t: "Mõistlik hind", d: "Ilma vahemeesteta" },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">{t}</div>
                  <div className="text-xs text-muted-foreground">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="mx-auto max-w-7xl px-4 md:px-6 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Tootekategooriad
              </h2>
              <p className="mt-2 text-muted-foreground">
                Sirvi meie sortimenti kategooriate kaupa.
              </p>
            </div>
            <Link
              to="/pood"
              className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Kõik kategooriad <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {topCategories.map((c, i) => (
              <Link
                key={c.id}
                to="/pood"
                className="group relative overflow-hidden rounded-2xl border border-border bg-card aspect-square p-4 flex flex-col justify-end shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div
                  className="absolute inset-0 -z-10 opacity-90 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(155deg, oklch(0.93 0.06 ${
                      120 + i * 20
                    }) 0%, oklch(0.85 0.10 ${110 + i * 15}) 100%)`,
                  }}
                  aria-hidden
                />
                <Leaf className="absolute top-3 right-3 h-5 w-5 text-foreground/30" />
                <div className="font-semibold text-foreground leading-tight uppercase text-sm">
                  {c.name}
                </div>
                <div className="text-xs text-foreground/60 mt-1">
                  {c.children.length} alamkategooriat
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section className="bg-secondary/30 border-y border-border">
          <div className="mx-auto max-w-7xl px-4 md:px-6 py-14">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Uudis
                </span>
                <h2 className="mt-1 text-3xl md:text-4xl font-bold tracking-tight">
                  Uued seemned 2025 / 26
                </h2>
              </div>
              <Link
                to="/pood"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Vaata kõiki <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((p: Product) => (
                <Link
                  to="/pood"
                  key={p.id}
                  className="group rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-medium text-foreground line-clamp-2 min-h-10">
                      {p.name}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-base font-bold text-primary">
                        {p.price.toFixed(2).replace(".", ",")} €
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {p.amount}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* STORY */}
        <section id="lugu" className="mx-auto max-w-7xl px-4 md:px-6 py-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Aiamaailma lugu
              </span>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">
                Elav maailm, lõpmatus mitmekesisuses
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                Siit leiad tõelist elujõudu — kontsentreeritud korralikult
                idanevatesse seemnetesse ning lillesibulatesse. Meilt saavad
                kvaliteetseid seemneid ja lillesibulaid kõik, kes seda soovivad
                ja seda väga mõistliku hinna eest.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Kes aga soovivad täisteenust, need leiavad kohe tootekataloogi
                kallale ja koostavad tellimuse, mis saabub postiga kolme kuni
                viie tööpäeva jooksul soovitud aadressile.
              </p>
              <div className="mt-6">
                <Button asChild variant="outline" className="rounded-xl">
                  <a href="#">Loe rohkem</a>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-xl">
                <img
                  src={heroImage}
                  alt="Aiamaailma kasvuhoone"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 rounded-2xl bg-card border border-border shadow-lg p-5 max-w-[220px]">
                <div className="text-3xl font-bold text-primary">30+</div>
                <div className="text-sm text-muted-foreground">
                  aastat aiapidajaid teenindanud
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 md:px-6 pb-16">
          <div className="rounded-3xl bg-primary text-primary-foreground p-10 md:p-14 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-primary-foreground/10" />
            <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-primary-foreground/5" />
            <div className="relative max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Valmis hooaega alustama?
              </h2>
              <p className="mt-3 text-primary-foreground/90 text-lg">
                Sirvi täielikku tootekataloogi ja telli oma lemmiksordid juba
                täna.
              </p>
              <div className="mt-6">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="rounded-xl h-12 px-6"
                >
                  <Link to="/pood">
                    Ava kataloog
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
