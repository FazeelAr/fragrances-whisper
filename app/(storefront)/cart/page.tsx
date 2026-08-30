import Link from "next/link";
import { cookies } from "next/headers";
import { auth } from "@/src/lib/auth";
import { getCartWithItems, getCartTotals } from "@/src/features/cart/queries";
import CartItemRow from "@/src/features/cart/components/CartItemRow";
import { formatPrice } from "@/src/lib/utils";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default async function CartPage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const cookieStore = await cookies();
  const sessionToken = !userId ? (cookieStore.get("fw_cart_id")?.value ?? null) : null;

  const cart = await getCartWithItems(userId, sessionToken);
  const items = cart?.items ?? [];
  const totals = getCartTotals(items.map((i) => ({ priceAtAdd: i.priceAtAdd, quantity: i.quantity })));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-serif font-bold text-stone-900 mb-8">Your Cart</h1>

      {items.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-xl border border-stone-100 shadow-sm">
          <ShoppingBag className="h-16 w-16 text-stone-200 mb-6" />
          <p className="text-xl font-serif text-stone-500 mb-3">Your cart is empty</p>
          <p className="text-sm text-stone-400 font-sans mb-8 max-w-xs">
            Add some exquisite fragrances to your cart and they will appear here.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-md bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800 transition-colors"
          >
            Browse Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-stone-100 shadow-sm px-6 divide-y divide-stone-100">
            <ul className="divide-y divide-stone-100">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={{
                    id: item.id,
                    quantity: item.quantity,
                    priceAtAdd: item.priceAtAdd.toString(),
                    product: {
                      id: item.product.id,
                      name: item.product.name,
                      slug: item.product.slug,
                      stock: item.product.stock,
                      volumeMl: item.product.volumeMl,
                      brand: item.product.brand,
                      images: item.product.images,
                    },
                  }}
                />
              ))}
            </ul>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-6 space-y-4 sticky top-24">
              <h2 className="font-serif text-lg font-medium text-stone-900 border-b border-stone-100 pb-3">
                Order Summary
              </h2>

              <div className="space-y-3 font-sans text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-medium">{formatPrice(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  {totals.shipping === 0 ? (
                    <span className="text-green-600 font-semibold">FREE</span>
                  ) : (
                    <span className="font-medium">{formatPrice(totals.shipping)}</span>
                  )}
                </div>
                {totals.shipping > 0 && (
                  <p className="text-xs text-stone-400">
                    Add {formatPrice(5000 - totals.subtotal)} more for free shipping
                  </p>
                )}
                <div className="border-t border-stone-100 pt-3 flex justify-between font-bold text-stone-900 text-base">
                  <span>Total</span>
                  <span>{formatPrice(totals.total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full text-center rounded-md bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-800 transition-colors shadow-md"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/products"
                className="block text-center text-xs text-stone-400 hover:text-stone-600 transition-colors mt-2"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
