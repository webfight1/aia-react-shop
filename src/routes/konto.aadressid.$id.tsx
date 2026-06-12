import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AddressForm } from "@/components/shop/AddressForm";
import { getAddress, updateAddress, AuthApiError, type CustomerAddress } from "@/lib/auth";

export const Route = createFileRoute("/konto/aadressid/$id")({
  component: EditAddressPage,
});

function EditAddressPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["konto", "address", id],
    queryFn: () => getAddress(id),
  });

  if (isLoading) return <p className="text-muted-foreground">Laen…</p>;
  if (!data) return <p className="text-muted-foreground">Aadressi ei leitud.</p>;

  return (
    <AddressForm
      title="Muuda aadressi"
      initial={data}
      onSubmit={async (form) => {
        try {
          await updateAddress(id, form as CustomerAddress);
          toast.success("Aadress salvestatud");
          queryClient.invalidateQueries({ queryKey: ["konto", "addresses"] });
          queryClient.invalidateQueries({ queryKey: ["konto", "address", id] });
          navigate({ to: "/konto/aadressid" });
        } catch (e) {
          if (e instanceof AuthApiError) {
            toast.error(e.message);
            return e.errors ?? {};
          }
          toast.error("Salvestamine ebaõnnestus");
        }
        return {};
      }}
    />
  );
}
