import Link from "next/link";
import { auth } from "@/src/lib/auth";
import { getCategories } from "@/src/features/categories/queries";
import { Sparkles, LogIn, LayoutDashboard, User } from "lucide-react";
import { STORE_NAME } from "@/src/lib/constants";
import MobileNav from "./MobileNav";
import CartIcon from "./CartIcon";
import AnnouncementBar from "./AnnouncementBar";

export default async function SiteHeader() {
  const [session, categories] = await Promise.all([
    auth(),
    getCategories(),
  ]);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Moving Taglines Line Above Navbar */}
      <AnnouncementBar />

      {/* Main Navbar */}
      <div className="border-b border-neutral-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Mobile Nav */}
          <div className="flex lg:flex-1 items-center gap-2">
            <MobileNav categories={categories} isLoggedIn={!!session} isAdmin={isAdmin} />
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
          <div className="flex flex-1 items-center justify-end gap-x-3 sm:gap-x-4">
            {session ? (
              isAdmin ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 transition-colors"
                  title="Admin Dashboard"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-amber-700" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              ) : (
                <Link
                  href="/profile"
                  className="p-2 text-neutral-700 hover:text-amber-600 transition-colors"
                  title="Account"
                >
                  <User className="h-4 w-4" />
                </Link>
              )
            ) : (
              <Link
                href="/login?next=/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-700 hover:text-amber-700 hover:bg-neutral-50 border border-neutral-200 transition-colors"
                title="Admin Login"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Login</span>
              </Link>
            )}

            {/* Dynamic Cart Icon with badge */}
            <CartIcon />
          </div>
        </div>
      </div>
    </div>
  </header>
  );
}
