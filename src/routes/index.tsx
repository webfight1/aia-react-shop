import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Leaf, Sprout } from "lucide-react";
import { Header } from "@/components/shop/Header";
import { Nav } from "@/components/shop/Nav";
import { Footer } from "@/components/shop/Footer";
import { Button } from "@/components/ui/button";
import { buildTree, fetchCategories } from "@/lib/categories";
import { fetchProducts, type Product } from "@/lib/products";
import { fetchHomeContent, getLucideIcon } from "@/lib/home";
import heroImage from "@/assets/hero-garden.jpg";
import catKoogivili from "@/assets/cat-koogivili.jpg";
import catLilled from "@/assets/cat-lilled.jpg";
import catMaitsetaimed from "@/assets/cat-maitsetaimed.jpg";
import catIdandamine from "@/assets/cat-idandamine.jpg";
import catSeemned from "@/assets/cat-seemned.jpg";
import catSeemnelint from "@/assets/cat-seemnelint.jpg";
import catSoodakultuurid from "@/assets/cat-soodakultuurid.jpg";
import catUued from "@/assets/cat-uued.jpg";
import catMuu from "@/assets/cat-muu.jpg";

const CATEGORY_IMAGES: Record<string, string> = {
  "koogivilja-seemned": catKoogivili,
  "lilleseemned": catLilled,
  "maitsetaimed": catMaitsetaimed,
  "seemned-idandamiseks": catIdandamine,
  "seeria-baltik-seemned": catSeemned,
  "seemned-lindil": catSeemnelint,
  "soodapeet-keerispea-ristik": catSoodakultuurid,
  "uued-seemned-202526": catUued,
  "kae-siis-mis": catMuu,
};

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

function Icon({
  name,
  className,
}: {
  name?: string | null;
  className?: string;
}) {
  const Cmp = getLucideIcon(name);
  if (!Cmp) return null;
  return <Cmp className={className} />;
}

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
  const { data: home } = useQuery({
    queryKey: ["home-content"],
    queryFn: fetchHomeContent,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  const topCategories = buildTree(catsRaw).slice(0, 6);
  const featuredProducts = featured.slice(0, 8);

  const hero = home?.hero;
  const valueProps = home?.valueProps ?? [];
  const story = home?.story;
  const ctaSection = home?.cta;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
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
              {hero?.badge?.text && (
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Icon name={hero.badge.icon} className="h-3.5 w-3.5" />
                  {hero.badge.text}
                </span>
              )}
              <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.05]">
                {hero?.title?.before ?? "Paneme aiad"}{" "}
                <span className="text-primary italic font-serif">
                  {hero?.title?.highlight ?? "elama."}
                </span>
              </h1>
              {hero?.description && (
                <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed">
                  {hero.description}
                </p>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                {hero?.primaryCta?.label && hero.primaryCta.href && (
                  <Button asChild size="lg" className="rounded-xl h-12 px-6">
                    <Link to={hero.primaryCta.href}>
                      {hero.primaryCta.label}
                      <Icon
                        name={hero.primaryCta.icon}
                        className="ml-1 h-4 w-4"
                      />
                    </Link>
                  </Button>
                )}
                {hero?.secondaryCta?.label && hero.secondaryCta.href && (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-xl h-12 px-6 bg-background/70 backdrop-blur"
                  >
                    <a href={hero.secondaryCta.href}>
                      {hero.secondaryCta.label}
                    </a>
                  </Button>
                )}
              </div>

              {hero?.highlights && hero.highlights.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
                  {hero.highlights.map((h, i) => (
                    <span key={i} className="flex items-center gap-2">
                      <Icon name={h.icon} className="h-4 w-4 text-primary" />
                      {h.text}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* VALUE PROPS */}
        {valueProps.length > 0 && (
          <section className="border-y border-border bg-secondary/30">
            <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
              {valueProps.map((v, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon name={v.icon} className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">
                      {v.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {v.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
            {topCategories.map((c) => {
              const img = CATEGORY_IMAGES[c.slug] ?? catMuu;
              return (
                <Link
                  key={c.id}
                  to="/pood"
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card aspect-square p-4 flex flex-col justify-end shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <img
                    src={img}
                    alt={c.name}
                    loading="lazy"
                    className="absolute inset-0 -z-10 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
                    aria-hidden
                  />
                  <Leaf className="absolute top-3 right-3 h-5 w-5 text-white/70 drop-shadow" />
                  <div className="font-semibold text-white leading-tight uppercase text-sm drop-shadow">
                    {c.name}
                  </div>
                  <div className="text-xs text-white/80 mt-1 drop-shadow">
                    {c.children.length} alamkategooriat
                  </div>
                </Link>
              );
            })}
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
                  to="/toode/$urlKey"
                  params={{ urlKey: p.url_key }}
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
        {story && (
          <section
            id={story.id ?? "lugu"}
            className="mx-auto max-w-7xl px-4 md:px-6 py-16"
          >
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                {story.eyebrow && (
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {story.eyebrow}
                  </span>
                )}
                {story.title && (
                  <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">
                    {story.title}
                  </h2>
                )}
                {story.paragraphs?.map((p, i) => (
                  <p
                    key={i}
                    className="mt-5 text-muted-foreground leading-relaxed"
                  >
                    {p}
                  </p>
                ))}
                {story.cta?.label && story.cta.href && (
                  <div className="mt-6">
                    <Button asChild variant="outline" className="rounded-xl">
                      <a href={story.cta.href}>{story.cta.label}</a>
                    </Button>
                  </div>
                )}
              </div>
              <div className="relative">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-xl">
                  <img
                    src={heroImage}
                    alt="Aiamaailma kasvuhoone"
                    className="h-full w-full object-cover"
                  />
                </div>
                {story.stat?.value && (
                  <div className="absolute -bottom-6 -left-6 rounded-2xl bg-card border border-border shadow-lg p-5 max-w-[220px]">
                    <div className="text-3xl font-bold text-primary">
                      {story.stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {story.stat.label}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        {ctaSection && (
          <section className="mx-auto max-w-7xl px-4 md:px-6 pb-16">
            <div className="rounded-3xl bg-primary text-primary-foreground p-10 md:p-14 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-primary-foreground/10" />
              <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-primary-foreground/5" />
              <div className="relative max-w-2xl">
                {ctaSection.title && (
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    {ctaSection.title}
                  </h2>
                )}
                {ctaSection.description && (
                  <p className="mt-3 text-primary-foreground/90 text-lg">
                    {ctaSection.description}
                  </p>
                )}
                {ctaSection.button?.label && ctaSection.button.href && (
                  <div className="mt-6">
                    <Button
                      asChild
                      size="lg"
                      variant="secondary"
                      className="rounded-xl h-12 px-6"
                    >
                      <Link to={ctaSection.button.href}>
                        {ctaSection.button.label}
                        <Icon
                          name={ctaSection.button.icon}
                          className="ml-1 h-4 w-4"
                        />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

// fallback to silence unused warning in some setups
void Sprout;
