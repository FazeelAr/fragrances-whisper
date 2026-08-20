"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Check } from "lucide-react";
import { GENDER_LABELS } from "@/src/lib/constants";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
}

interface MobileFiltersProps {
  categories: Category[];
}

export default function MobileFilters({ categories }: MobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") || "";
  const activeGender = searchParams.get("gender") || "";
  const activeSearch = searchParams.get("search") || "";

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchVal = formData.get("search")?.toString() || "";
    
    const params = new URLSearchParams(searchParams.toString());
    if (searchVal) params.set("search", searchVal);
    else params.delete("search");
    params.delete("page");
    
    setIsOpen(false);
    router.push(`/products?${params.toString()}`);
  };

  const getFilterUrl = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    return `/products?${params.toString()}`;
  };

  return (
    <div className="lg:hidden w-full">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
      >
        <SlidersHorizontal className="h-4 w-4 text-stone-400" />
        Filter & Search
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Drawer Content */}
          <div className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white p-6 shadow-xl animate-slide-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
              <span className="font-serif text-lg font-medium text-stone-900">Filters</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-stone-500 hover:text-stone-950 transition-colors"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="space-y-2">
                <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">Search</label>
                <input
                  type="text"
                  name="search"
                  placeholder="Search notes, names..."
                  defaultValue={activeSearch}
                  className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
                />
              </form>

              {/* Categories */}
              <div>
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-3">Categories</span>
                <div className="space-y-2">
                  <Link
                    href={getFilterUrl("category")}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between text-sm py-1.5 transition-colors ${
                      !activeCategory ? "text-amber-700 font-medium" : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <span>All Categories</span>
                    {!activeCategory && <Check className="h-4 w-4" />}
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={getFilterUrl("category", cat.slug)}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between text-sm py-1.5 transition-colors ${
                        activeCategory === cat.slug ? "text-amber-700 font-medium" : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      <span>{cat.name} ({cat._count.products})</span>
                      {activeCategory === cat.slug && <Check className="h-4 w-4" />}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div>
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-3">Gender</span>
                <div className="space-y-2">
                  <Link
                    href={getFilterUrl("gender")}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between text-sm py-1.5 transition-colors ${
                      !activeGender ? "text-amber-700 font-medium" : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <span>All Genders</span>
                    {!activeGender && <Check className="h-4 w-4" />}
                  </Link>
                  {Object.entries(GENDER_LABELS).map(([key, label]) => (
                    <Link
                      key={key}
                      href={getFilterUrl("gender", key)}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between text-sm py-1.5 transition-colors ${
                        activeGender === key ? "text-amber-700 font-medium" : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      <span>{label}</span>
                      {activeGender === key && <Check className="h-4 w-4" />}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
