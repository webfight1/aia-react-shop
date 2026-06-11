import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { Header } from "@/components/shop/Header";
import { Nav } from "@/components/shop/Nav";
import { Footer } from "@/components/shop/Footer";
import { Button } from "@/components/ui/button";

const searchSchema = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/aitah")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Aitäh tellimuse eest — aiamaailm.ee" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ThanksPage,
});

function ThanksPage() {
  const { id } = Route.useSearch();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Nav />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 md:px-6 py-16 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">Aitäh tellimuse eest!</h1>
          <p className="text-muted-foreground mb-6">
            Saatsime kinnituse sinu e-postile.
            {id && <> Tellimuse number: <span className="font-semibold text-foreground">#{id}</span>.</>}
          </p>
          <Button asChild><Link to="/pood">Jätka ostlemist</Link></Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
