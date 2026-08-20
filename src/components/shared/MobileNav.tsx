"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Sparkles } from "lucide-react";
import { STORE_NAME } from "@/src/lib/constants";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface MobileNavProps {
  categories: Category[];
}

export default function MobileNav({ categories }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-stone-700 hover:text-amber-600 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Slide-in Content Panel */}
          <div className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white p-6 shadow-xl animate-slide-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-lg font-bold text-stone-900"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="font-serif italic">{STORE_NAME}</span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-stone-500 hover:text-stone-950 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-y-4">
              <Link
                href="/products"
                onClick={() => setIsOpen(false)}
                className="text-base font-semibold text-stone-900 hover:text-amber-700 transition-colors"
              >
                Shop All Products
              </Link>

              <div className="h-px bg-stone-100 my-2"></div>

              <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest block mb-2">
                Collections
              </span>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium text-stone-600 hover:text-amber-700 transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
