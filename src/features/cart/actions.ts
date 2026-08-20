"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/db";
import { getOrCreateCart } from "./queries";
import { addToCartSchema, updateCartItemSchema } from "./schema";
import { Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const CART_COOKIE = "fw_cart_id";

/**
 * Get or create the guest sessionToken cookie.
 * Returns the token string.
 */
async function getSessionToken(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get(CART_COOKIE)?.value;
  if (!token) {
    token = uuidv4();
    cookieStore.set(CART_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
  return token;
}

/**
 * Add a product to the cart.
 * Always re-validates stock and snapshots the current DB price.
 */
export async function addToCart(productId: string, quantity: number) {
  const parsed = addToCartSchema.safeParse({ productId, quantity });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const sessionToken = userId ? null : await getSessionToken();

    // Validate product exists and has sufficient stock
    const product = await db.product.findUnique({
      where: { id: productId, isPublished: true },
      select: { id: true, stock: true, price: true, name: true },
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

    const cart = await getOrCreateCart(userId, sessionToken);

    // Check if item already in cart — if so, increment quantity
    const existingItem = await db.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stock) {
        return {
          success: false,
          error: `Only ${product.stock} unit(s) available. You already have ${existingItem.quantity} in your cart.`,
        };
      }
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          priceAtAdd: new Prisma.Decimal(product.price.toString()),
        },
      });
    }

    revalidatePath("/cart");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("addToCart error:", e);
    return { success: false, error: "Failed to add item to cart." };
  }
}

/**
 * Update the quantity of a cart item.
 * If quantity = 0, removes the item.
 */
export async function updateCartItemQty(cartItemId: string, quantity: number) {
  const parsed = updateCartItemSchema.safeParse({ cartItemId, quantity });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    if (quantity === 0) {
      return removeFromCart(cartItemId);
    }

    // Re-validate stock against current DB value
    const item = await db.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: { select: { stock: true } } },
    });

    if (!item) return { success: false, error: "Cart item not found." };

    const clampedQty = Math.min(quantity, item.product.stock);

    await db.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: clampedQty },
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (e) {
    console.error("updateCartItemQty error:", e);
    return { success: false, error: "Failed to update cart item." };
  }
}

/**
 * Remove a single item from the cart.
 */
export async function removeFromCart(cartItemId: string) {
  try {
    await db.cartItem.delete({ where: { id: cartItemId } });
    revalidatePath("/cart");
    return { success: true };
  } catch (e) {
    console.error("removeFromCart error:", e);
    return { success: false, error: "Failed to remove item from cart." };
  }
}

/**
 * Clear all items from a cart.
 */
export async function clearCart(cartId: string) {
  try {
    await db.cartItem.deleteMany({ where: { cartId } });
    revalidatePath("/cart");
    return { success: true };
  } catch (e) {
    console.error("clearCart error:", e);
    return { success: false, error: "Failed to clear cart." };
  }
}
