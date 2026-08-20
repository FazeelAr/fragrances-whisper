import Link from "next/link";
import { auth } from "@/src/lib/auth";
import { getCategories } from "@/src/features/categories/queries";
import { User, ShieldAlert, Sparkles } from "lucide-react";
import { STORE_NAME } from "@/src/lib/constants";
import MobileNav from "./MobileNav";
import CartIcon from "./CartIcon";

export default async function SiteHeader() {
  const session = await auth();
  const categories = await getCategories();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Mobile Nav */}
          <div className="flex lg:flex-1 items-center gap-2">
            <MobileNav categories={categories} />
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-neutral-900">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span className="font-serif italic">{STORE_NAME}</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex md:gap-x-8">
            <Link
              href="/products"
              className="text-sm font-medium text-neutral-700 hover:text-amber-600 transition-colors"
            >
              Shop All
            </Link>
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="text-sm font-medium text-neutral-700 hover:text-amber-600 transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex flex-1 items-center justify-end gap-x-4">
            {/* Dynamic Cart Icon with badge */}
            <CartIcon />
          </div>
        </div>
      </div>
    </header>
  );
}
