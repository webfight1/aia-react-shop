import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
  type BagistoCart,
} from "@/lib/cart";

const CART_KEY = ["cart"] as const;

export function useCart() {
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: CART_KEY,
    queryFn: getCart,
    staleTime: 30_000,
  });

  const setCart = (cart: BagistoCart | null) =>
    queryClient.setQueryData(CART_KEY, cart);

  const addMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number | string; quantity?: number }) =>
      addCartItem(productId, quantity ?? 1),
    onSuccess: (cart) => setCart(cart),
  });

  const updateMutation = useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: number; quantity: number }) =>
      updateCartItem(cartItemId, quantity),
    onSuccess: (cart) => setCart(cart),
  });

  const removeMutation = useMutation({
    mutationFn: (cartItemId: number) => removeCartItem(cartItemId),
    onSuccess: (cart) => setCart(cart),
  });

  const cart = cartQuery.data ?? null;
  const items = cart?.items ?? [];
  const itemsCount = cart?.items_qty ?? items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart?.sub_total ?? items.reduce((s, i) => s + i.total, 0);

  return {
    cart,
    items,
    itemsCount,
    subtotal,
    isLoading: cartQuery.isLoading,
    addItem: (productId: number | string, quantity = 1) =>
      addMutation.mutateAsync({ productId, quantity }),
    updateItem: (cartItemId: number, quantity: number) =>
      updateMutation.mutateAsync({ cartItemId, quantity }),
    removeItem: (cartItemId: number) => removeMutation.mutateAsync(cartItemId),
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
