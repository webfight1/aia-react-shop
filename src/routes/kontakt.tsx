import { createFileRoute } from "@tanstack/react-router";
import { CmsPage } from "@/components/shop/CmsPage";

export const Route = createFileRoute("/kontakt")({
  head: () => ({
    meta: [
      { title: "Kontakt — Aiamaailm.ee" },
      {
        name: "description",
        content: "Võta Aiamaailmaga ühendust — kontaktinfo ja asukoht.",
      },
    ],
  }),
  component: () => <CmsPage slug="kontakt" fallbackTitle="Kontakt" />,
});
