import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sprout } from "lucide-react";
import { Header } from "@/components/shop/Header";
import { Nav } from "@/components/shop/Nav";
import { Footer } from "@/components/shop/Footer";
import { Button } from "@/components/ui/button";
import firmastImage from "@/assets/firmast.jpg";

export const Route = createFileRoute("/firmast")({
  head: () => ({
    meta: [
      { title: "Firmast — Aiamaailm.ee" },
      {
        name: "description",
        content:
          "Aiamaailm on aastast 1996 tegutsev aiakauba pakkuja — seemned, sibulad ja aiapidaja tarvikud. Hulgi- ja jaemüük üle Eesti.",
      },
      { property: "og:title", content: "Firmast — Aiamaailm.ee" },
      {
        property: "og:description",
        content:
          "Aiamaailm on aastast 1996 tegutsev aiakauba pakkuja. Vaata meie tootekataloogi ja tee oma tellimus juba täna.",
      },
      { property: "og:image", content: firmastImage },
      { name: "twitter:image", content: firmastImage },
    ],
  }),
  component: FirmastPage,
});

function FirmastPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={0} cartTotal={0} />
      <Nav onSelectCategory={() => {}} />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="mx-auto max-w-7xl px-4 md:px-6 py-14 md:py-20">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Sprout className="h-3.5 w-3.5" />
                  Firmast
                </span>
                <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.05]">
                  Sinu{" "}
                  <span className="text-primary italic font-serif">
                    Aiamaailm
                  </span>
                </h1>
                <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                  Aiamaailm kaupleb aiaga seotud kaubaga — seemned, sibulad,
                  tarvikud jms — juba aastast{" "}
                  <span className="font-semibold text-foreground">1996</span>.
                </p>
                <div className="mt-8">
                  <Button asChild size="lg" className="rounded-xl h-12 px-6">
                    <Link to="/pood">
                      Vaata tootekataloogi
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
                  <img
                    src={firmastImage}
                    alt="Aiamaailm — aiapidaja päevatöö"
                    width={1600}
                    height={1024}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUOTES */}
        <section className="mx-auto max-w-4xl px-4 md:px-6 py-14 md:py-20">
          <figure className="text-center">
            <blockquote className="text-2xl md:text-3xl font-serif italic text-foreground leading-relaxed">
              „Mida külvad, seda lõikad."
            </blockquote>
          </figure>

          <div className="my-12 h-px bg-border" />

          <figure className="text-center">
            <blockquote className="text-xl md:text-2xl font-serif italic text-foreground leading-relaxed space-y-3">
              <p>Tahad olla õnnelik ühe päeva — joo ennast purju.</p>
              <p>Tahad olla õnnelik ühe aasta — abiellu.</p>
              <p>
                Tahad olla õnnelik terve elu —{" "}
                <span className="text-primary">hakka aednikuks.</span>
              </p>
            </blockquote>
            <figcaption className="mt-5 text-sm uppercase tracking-wider text-muted-foreground">
              Hiina vanasõna
            </figcaption>
          </figure>
        </section>

        {/* STORY */}
        <section className="border-t border-border bg-secondary/30">
          <div className="mx-auto max-w-4xl px-4 md:px-6 py-14 md:py-20">
            <div className="prose prose-lg max-w-none text-foreground">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Eelkõige oleme hulgifirma, kuid pakume ka jaekliendile head
                ning kiiret teenindust mõistliku hinna eest.
              </p>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
                Vaata meie tootekataloogi ja tee oma tellimus juba täna!
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl h-12 px-6">
                <Link to="/pood">
                  Tootekataloog
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
