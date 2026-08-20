"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { formatPrice } from "@/src/lib/utils";
import { ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw, Loader2, Check } from "lucide-react";
import { addToCart } from "@/src/features/cart/actions";

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
}

interface ProductInteractiveProps {
  product: {
    id: string;
    name: string;
    brand: string | null;
    price: string;
    compareAtPrice: string | null;
    stock: number;
    volumeMl: number;
    gender: string;
  };
  images: ProductImage[];
}

export default function ProductInteractive({ product, images }: ProductInteractiveProps) {
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(
    images.find((img) => img.isPrimary) || images[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [cartError, setCartError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    setCartError(null);
    setAddedToCart(false);
    startTransition(async () => {
      const result = await addToCart(product.id, quantity);
      if (result.success) {
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 3000);
      } else {
        setCartError(result.error || "Failed to add to cart.");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      {/* Product Gallery */}
      <div className="space-y-4">
        {/* Main Display Image */}
        <div className="relative aspect-square w-full rounded-lg bg-stone-100 overflow-hidden border border-stone-100">
          {selectedImage ? (
            <Image
              src={selectedImage.url}
              alt={selectedImage.altText || product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-stone-400">No Image</div>
          )}
        </div>

        {/* Thumbnail Selector list */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-4">
            {images.map((img) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className={`relative aspect-square rounded-md overflow-hidden bg-stone-50 border-2 transition-all ${
                  selectedImage?.id === img.id ? "border-amber-600 ring-1 ring-amber-600" : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.altText || product.name}
                  fill
                  className="object-cover"
                  sizes="12vw"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Actions & Info */}
      <div className="flex flex-col">
        <span className="text-sm font-semibold tracking-wider text-stone-400 uppercase mb-2">
          {product.brand || "Fragrance Whisper"}
        </span>
        <h1 className="text-3xl font-serif tracking-tight text-stone-900 mb-4">{product.name}</h1>

        {/* Badges */}
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center rounded-full bg-stone-100 px-3 py-0.5 text-xs font-medium text-stone-800">
            {product.volumeMl}ml
          </span>
          <span className="inline-flex items-center rounded-full bg-stone-100 px-3 py-0.5 text-xs font-medium text-stone-800">
            {product.gender === "MALE" ? "Men" : product.gender === "FEMALE" ? "Women" : "Unisex"}
          </span>
          {isOutOfStock ? (
            <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-0.5 text-xs font-semibold text-red-700">
              Out of stock
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-0.5 text-xs font-semibold text-amber-800">
              Only {product.stock} left in stock
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-0.5 text-xs font-semibold text-green-700">
              In stock
            </span>
          )}
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-4 mb-8">
          <span className="text-3xl font-bold text-stone-900">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-lg text-stone-400 line-through">{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>

        {/* Add to Cart Actions */}
        {!isOutOfStock && (
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4">
              <span className="text-sm text-stone-500 font-sans">Quantity:</span>
              <div className="flex items-center rounded-md border border-stone-200">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-1 text-sm font-semibold text-stone-900 min-w-[2.5rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Error Feedback */}
            {cartError && (
              <p className="text-sm text-red-600 font-sans">{cartError}</p>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isPending}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-white transition-all shadow-lg shadow-stone-950/10 ${
                  addedToCart
                    ? "bg-green-600 hover:bg-green-600"
                    : "bg-stone-900 hover:bg-stone-800"
                } disabled:opacity-70`}
              >
                {isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</>
                ) : addedToCart ? (
                  <><Check className="h-4 w-4" /> Added to Cart!</>
                ) : (
                  <><ShoppingBag className="h-4 w-4" /> Add to Cart</>
                )}
              </button>
              <button
                type="button"
                className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-stone-200 text-stone-400 hover:text-red-500 hover:bg-red-50/50 transition-colors"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Premium Brand Promises */}
        <div className="border-t border-stone-100 pt-6 space-y-4 text-sm text-stone-500">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <span>Fast Shipping across Pakistan (200 PKR flat, free on orders above 5000 PKR)</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <span>100% Original artisanal oils & premium packaging guaranteed</span>
          </div>
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <span>Safe secure payments with local wallets, cards & bank transfers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
