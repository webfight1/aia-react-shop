import { createFileRoute } from "@tanstack/react-router";
import { CmsPage } from "@/components/shop/CmsPage";

export const Route = createFileRoute("/muugitingimused")({
  head: () => ({
    meta: [
      { title: "Müügitingimused — Aiamaailm.ee" },
      {
        name: "description",
        content: "Aiamaailm.ee müügitingimused ja klienditeenuse info.",
      },
    ],
  }),
  component: () => (
    <CmsPage slug="muugitingimused" fallbackTitle="Müügitingimused" />
  ),
});
