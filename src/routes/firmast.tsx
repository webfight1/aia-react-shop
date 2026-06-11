import { createFileRoute } from "@tanstack/react-router";
import { CmsPage } from "@/components/shop/CmsPage";

export const Route = createFileRoute("/firmast")({
  head: () => ({
    meta: [
      { title: "Firmast — Aiamaailm.ee" },
      {
        name: "description",
        content:
          "Aiamaailm on aastast 1996 tegutsev aiakauba pakkuja — seemned, sibulad ja aiapidaja tarvikud.",
      },
    ],
  }),
  component: () => <CmsPage slug="firmast" fallbackTitle="Firmast" />,
});
