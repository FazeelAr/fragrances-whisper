import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(100),
});

export const updateCartItemSchema = z.object({
  cartItemId: z.string().min(1),
  quantity: z.coerce.number().int().min(0).max(100),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
