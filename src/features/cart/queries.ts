import { db } from "@/src/lib/db";
import { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from "@/src/lib/constants";
import { Prisma } from "@prisma/client";

/**
 * Resolves the active cart for a user or guest session.
 * Creates one if it doesn't exist.
 */
export async function getOrCreateCart(userId?: string | null, sessionToken?: string | null) {
  if (userId) {
    // Authenticated user — use DB cart tied to userId
    const existing = await db.cart.findUnique({ where: { userId } });
    if (existing) return existing;
    return db.cart.create({ data: { userId } });
  }

  if (sessionToken) {
    // Guest — use sessionToken cookie
    const existing = await db.cart.findUnique({ where: { sessionToken } });
    if (existing) return existing;
    return db.cart.create({ data: { sessionToken } });
  }

  // No identity at all — should not normally happen; create anonymous cart
  return db.cart.create({ data: {} });
}

/**
 * Fetches the full cart with items and product details.
 */
export async function getCartWithItems(userId?: string | null, sessionToken?: string | null) {
  const where = userId
    ? { userId }
    : sessionToken
    ? { sessionToken }
    : null;

  if (!where) return null;

  return db.cart.findUnique({
    where: where as Prisma.CartWhereUniqueInput,
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

/**
 * Compute cart totals.
 * Uses `priceAtAdd` (snapshot price) for subtotal — stable even if admin changes price later.
 * Re-validates at checkout.
 */
export function getCartTotals(items: { priceAtAdd: Prisma.Decimal; quantity: number }[]) {
  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.priceAtAdd.toString()) * item.quantity,
    0
  );
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = 0; // No GST for now
  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, total };
}

/**
 * Merge a guest cart into a user cart on login.
 * Moves all items from sessionToken cart into userId cart, merging quantities.
 */
export async function mergeGuestCartIntoUserCart(userId: string, sessionToken: string) {
  const guestCart = await db.cart.findUnique({
    where: { sessionToken },
    include: { items: true },
  });

  if (!guestCart || guestCart.items.length === 0) return;

  const userCart = await getOrCreateCart(userId);

  for (const item of guestCart.items) {
    const existing = await db.cartItem.findFirst({
      where: { cartId: userCart.id, productId: item.productId },
    });
    if (existing) {
      await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + item.quantity },
      });
    } else {
      await db.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtAdd: item.priceAtAdd,
        },
      });
    }
  }

  // Delete the guest cart after merging
  await db.cart.delete({ where: { id: guestCart.id } });
}
