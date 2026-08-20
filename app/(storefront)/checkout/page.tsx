import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/src/lib/auth";
import { getCartWithItems, getCartTotals } from "@/src/features/cart/queries";
import CheckoutForm from "@/src/features/orders/components/CheckoutForm";

export default async function CheckoutPage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const cookieStore = await cookies();
  const sessionToken = !userId ? (cookieStore.get("fw_cart_id")?.value ?? null) : null;

  const cart = await getCartWithItems(userId, sessionToken);

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const totals = getCartTotals(
    cart.items.map((i) => ({ priceAtAdd: i.priceAtAdd, quantity: i.quantity }))
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-serif font-bold text-stone-900 mb-8">Checkout</h1>
      <CheckoutForm
        initialUser={
          session?.user
            ? {
                name: session.user.name,
                email: session.user.email,
              }
            : null
        }
        totals={totals}
      />
    </div>
  );
}
