import { cookies } from "next/headers";
import { auth } from "@/src/lib/auth";
import { getCartWithItems } from "@/src/features/cart/queries";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default async function CartIcon() {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const cookieStore = await cookies();
  const sessionToken = !userId ? (cookieStore.get("fw_cart_id")?.value ?? null) : null;

  const cart = await getCartWithItems(userId, sessionToken);
  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <Link
      href="/cart"
      className="relative group -m-2 flex items-center p-2 text-neutral-700 hover:text-amber-600 transition-colors"
    >
      <ShoppingBag className="h-6 w-6 flex-shrink-0" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
      <span className="sr-only">Cart ({itemCount})</span>
    </Link>
  );
}
