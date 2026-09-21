"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/src/lib/db";
import { CART_COOKIE, getCartCookieItems, type CookieCartItem } from "./queries";
import { addToCartSchema, updateCartItemSchema } from "./schema";

/**
 * Save items into the cart cookie.
 */
async function saveCartCookie(items: CookieCartItem[]) {
  const cookieStore = await cookies();
  if (items.length === 0) {
    cookieStore.delete(CART_COOKIE);
  } else {
    cookieStore.set(CART_COOKIE, JSON.stringify(items), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
}

/**
 * Add a product to the cart (stored in cookie, verified against DB stock).
 */
export async function addToCart(productId: string, quantity: number) {
  const parsed = addToCartSchema.safeParse({ productId, quantity });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    // Fast verification that product exists and has stock
    const product = await db.product.findUnique({
      where: { id: productId, isPublished: true },
      select: { id: true, stock: true, name: true },
    });

    if (!product) {
      return { success: false, error: "Product not found or unavailable." };
    }

    if (product.stock < quantity) {
      return {
        success: false,
        error: `Only ${product.stock} unit(s) available in stock.`,
      };
    }

    const items = await getCartCookieItems();
    const existingIndex = items.findIndex((i) => i.productId === productId);

    if (existingIndex > -1) {
      const newQty = items[existingIndex].quantity + quantity;
      if (newQty > product.stock) {
        return {
          success: false,
          error: `Only ${product.stock} unit(s) available. You already have ${items[existingIndex].quantity} in your cart.`,
        };
      }
      items[existingIndex].quantity = newQty;
    } else {
      items.push({ productId, quantity });
    }

    await saveCartCookie(items);

    revalidatePath("/cart");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("addToCart error:", e);
    return { success: false, error: "Failed to add item to cart." };
  }
}

/**
 * Update the quantity of a cart item in the cookie.
 */
export async function updateCartItemQty(cartItemId: string, quantity: number) {
  const parsed = updateCartItemSchema.safeParse({ cartItemId, quantity });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }

    const items = await getCartCookieItems();
    const itemIndex = items.findIndex((i) => i.productId === cartItemId);
    if (itemIndex === -1) {
      return { success: false, error: "Cart item not found." };
    }

    // Verify current stock
    const product = await db.product.findUnique({
      where: { id: cartItemId },
      select: { stock: true },
    });

    const maxStock = product?.stock ?? quantity;
    items[itemIndex].quantity = Math.min(quantity, maxStock);

    await saveCartCookie(items);

    revalidatePath("/cart");
    return { success: true };
  } catch (e) {
    console.error("updateCartItemQty error:", e);
    return { success: false, error: "Failed to update cart item." };
  }
}

/**
 * Remove a single item from the cart cookie.
 */
export async function removeFromCart(cartItemId: string) {
  try {
    const items = await getCartCookieItems();
    const filtered = items.filter((i) => i.productId !== cartItemId);
    await saveCartCookie(filtered);

    revalidatePath("/cart");
    return { success: true };
  } catch (e) {
    console.error("removeFromCart error:", e);
    return { success: false, error: "Failed to remove item from cart." };
  }
}

/**
 * Clear all items from the cart cookie.
 */
export async function clearCart() {
  try {
    await saveCartCookie([]);
    revalidatePath("/cart");
    return { success: true };
  } catch (e) {
    console.error("clearCart error:", e);
    return { success: false, error: "Failed to clear cart." };
  }
}
