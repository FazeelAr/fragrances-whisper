import { db } from "@/src/lib/db";
import { cookies } from "next/headers";
import { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from "@/src/lib/constants";
import { Prisma } from "@prisma/client";

export const CART_COOKIE = "fw_cart";

export interface CookieCartItem {
  productId: string;
  quantity: number;
}

export interface CartItemProduct {
  id: string;
  name: string;
  slug: string;
  stock: number;
  volumeMl: number | null;
  brand: string | null;
  images: { url: string; altText: string | null }[];
}

export interface CartItemWithProduct {
  id: string; // maps to productId for row actions
  productId: string;
  quantity: number;
  priceAtAdd: Prisma.Decimal;
  product: CartItemProduct;
}

export interface HydratedCart {
  id: string;
  items: CartItemWithProduct[];
}

/**
 * Fast synchronous cookie read - 0 database calls.
 * Used across the application for instant rendering.
 */
export async function getCartCookieItems(): Promise<CookieCartItem[]> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(CART_COOKIE)?.value;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => item && typeof item.productId === "string" && typeof item.quantity === "number" && item.quantity > 0
    );
  } catch {
    return [];
  }
}

/**
 * Returns the total item count in the cart in 0ms without any DB query.
 * Perfect for the SiteHeader / CartIcon on every page.
 */
export async function getCartItemCount(): Promise<number> {
  const items = await getCartCookieItems();
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Fetches the full cart with items and product details.
 * Reads product details from DB only for the products currently in the cookie.
 */
export async function getCartWithItems(
  _userId?: string | null,
  _sessionToken?: string | null
): Promise<HydratedCart> {
  const cookieItems = await getCartCookieItems();
  if (cookieItems.length === 0) {
    return { id: "cookie-cart", items: [] };
  }

  const productIds = cookieItems.map((i) => i.productId);
  const products = await db.product.findMany({
    where: {
      id: { in: productIds },
      isPublished: true,
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));
  const items: CartItemWithProduct[] = [];

  for (const cookieItem of cookieItems) {
    const product = productMap.get(cookieItem.productId);
    if (!product) continue;

    items.push({
      id: product.id,
      productId: product.id,
      quantity: Math.min(cookieItem.quantity, product.stock),
      priceAtAdd: product.price,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        stock: product.stock,
        volumeMl: product.volumeMl,
        brand: product.brand,
        images: product.images,
      },
    });
  }

  return { id: "cookie-cart", items };
}

/**
 * Compute cart totals.
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
 * Compatibility exports for any cached client chunks
 */
export async function getOrCreateCart(_userId?: string | null, _sessionToken?: string | null) {
  return { id: "cookie-cart" };
}

export async function mergeGuestCartIntoUserCart() {}

