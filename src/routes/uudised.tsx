import { createFileRoute } from "@tanstack/react-router";
import { CmsPage } from "@/components/shop/CmsPage";

export const Route = createFileRoute("/uudised")({
  head: () => ({
    meta: [
      { title: "Uudised — Aiamaailm.ee" },
      {
        name: "description",
        content: "Aiamaailma värsked uudised, hooaja info ja teadaanded.",
      },
    ],
  }),
  component: () => <CmsPage slug="uudised" fallbackTitle="Uudised" />,
});
