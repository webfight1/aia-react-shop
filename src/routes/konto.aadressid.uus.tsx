import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AddressForm } from "@/components/shop/AddressForm";
import { createAddress, AuthApiError, type CustomerAddress } from "@/lib/auth";

export const Route = createFileRoute("/konto/aadressid/uus")({
  component: NewAddressPage,
});

function NewAddressPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return (
    <AddressForm
      title="Uus aadress"
      onSubmit={async (data) => {
        try {
          await createAddress(data as CustomerAddress);
          toast.success("Aadress lisatud");
          queryClient.invalidateQueries({ queryKey: ["konto", "addresses"] });
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
