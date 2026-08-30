"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Price from "@/src/components/shared/Price";

interface SerializedProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string | null;
  price: string;
  compareAtPrice: string | null;
  sku: string;
  stock: number;
  fragranceNotes: any;
  volumeMl: number;
  gender: string;
  isPublished: boolean;
  isFeatured: boolean;
  categoryId: string;
  images: { id: string; url: string; isPrimary: boolean; altText: string | null }[];
}

interface SerializedCategory {
  id: string;
  name: string;
  slug: string;
  products: SerializedProduct[];
}

interface ProductTabsProps {
  allProducts: SerializedProduct[];
  categories: SerializedCategory[];
}

export default function ProductTabs({ allProducts, categories }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("ALL");

  // Get active products based on tab selection
  const activeProducts =
    activeTab === "ALL"
      ? allProducts
      : categories.find((cat) => cat.id === activeTab)?.products || [];

  return (
    <div className="space-y-12">
      {/* Category Pills Container */}
      <div className="bg-stone-950 p-2 rounded-xl sm:rounded-full border border-stone-900 max-w-4xl mx-auto flex items-center justify-start sm:justify-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* ALL Tab */}
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
            activeTab === "ALL"
              ? "bg-amber-500 text-stone-950 font-bold border border-amber-500"
              : "bg-transparent border border-stone-900 text-stone-400 hover:text-amber-400 hover:border-amber-500/30"
          }`}
        >
          ALL
        </button>

        {/* Dynamic Category Tabs */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
              activeTab === category.id
                ? "bg-amber-500 text-stone-950 font-bold border border-amber-500"
                : "bg-transparent border border-stone-900 text-stone-400 hover:text-amber-400 hover:border-amber-500/30"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {activeProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-stone-150 p-8 max-w-md mx-auto">
          <p className="text-lg text-stone-500 font-serif mb-2">No fragrances in this collection yet.</p>
          <p className="text-xs text-stone-400 font-sans">We will be updating this category soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {activeProducts.map((product) => {
            const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
            return (
              <div key={product.id} className="group relative flex flex-col bg-white rounded-lg border border-stone-100 overflow-hidden hover:shadow-lg transition-all">
                <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
                  {primaryImage ? (
                    <Image
                      src={primaryImage.url}
                      alt={primaryImage.altText || product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-stone-400 text-xs sm:text-base">No Image</div>
                  )}
                  {product.compareAtPrice && (
                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-amber-600 text-white text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md uppercase tracking-wider">
                      Sale
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-3 sm:p-5">
                  <span className="text-xs text-stone-400 uppercase tracking-widest mb-1.5">
                    {product.brand || "Fragrance Whisper"}
                  </span>
                  <h3 className="text-base font-serif text-stone-950 mb-2">
                    <Link href={`/products/${product.slug}`} className="hover:text-amber-700 transition-colors">
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.name}
                    </Link>
                  </h3>
                  <p className="text-xs text-stone-500 font-sans line-clamp-1 mb-4">
                    Notes: {typeof product.fragranceNotes === 'object' && product.fragranceNotes !== null
                      ? Object.values(product.fragranceNotes).join(" · ")
                      : "Exquisite scent profile"}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <Price amount={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
                    <span className="text-xs text-stone-400 font-medium">
                      {product.volumeMl}ml
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
