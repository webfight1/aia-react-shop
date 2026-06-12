import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/shop/Header";
import { Nav } from "@/components/shop/Nav";
import { Footer } from "@/components/shop/Footer";
import { PageBlocks } from "@/components/shop/PageBlocks";
import { fetchPage } from "@/lib/pages";

interface Props {
  slug: string;
  fallbackTitle?: string;
}

export function CmsPage({ slug, fallbackTitle }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["page", slug],
    queryFn: () => fetchPage(slug),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: (count, err: any) => err?.status !== 404 && count < 2,
  });

  const notFound = (error as any)?.status === 404;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Nav />

      <main className="flex-1">
        <section className="border-b border-border bg-secondary/30">
          <div className="mx-auto max-w-4xl px-4 md:px-6 py-10 md:py-14">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              {data?.title || fallbackTitle || "..."}
            </h1>
            {data?.excerpt && (
              <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
                {data.excerpt}
              </p>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 md:px-6 py-10 md:py-16">
          {isLoading && (
            <div className="text-muted-foreground">Laen sisu...</div>
          )}
          {notFound && (
            <div className="text-muted-foreground">
              Lehte ei leitud. Lisa sisu admin-is.
            </div>
          )}
          {!isLoading && !notFound && data && (
            <>
              {data.blocks && data.blocks.length > 0 ? (
                <PageBlocks blocks={data.blocks} />
              ) : (
                <p className="text-muted-foreground italic">
                  Sellel lehel pole veel sisu.
                </p>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
