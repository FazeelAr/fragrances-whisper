"use client";

import { useTransition, useState } from "react";
import Image from "next/image";
import { updateCartItemQty, removeFromCart } from "@/src/features/cart/actions";
import { formatPrice } from "@/src/lib/utils";
import { Trash2, Loader2 } from "lucide-react";

interface CartItemRowProps {
  item: {
    id: string;
    quantity: number;
    priceAtAdd: string;
    product: {
      id: string;
      name: string;
      slug: string;
      stock: number;
      volumeMl: number | null;
      brand: string | null;
      images: { url: string; altText: string | null }[];
    };
  };
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const [isPending, startTransition] = useTransition();
  const [isRemoving, startRemoving] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const image = item.product.images[0];
  const lineTotal = parseFloat(item.priceAtAdd) * item.quantity;

  const handleQtyChange = (newQty: number) => {
    setError(null);
    startTransition(async () => {
      const result = await updateCartItemQty(item.id, newQty);
      if (!result.success) setError(result.error || "Error updating quantity.");
    });
  };

  const handleRemove = () => {
    setError(null);
    startRemoving(async () => {
      await removeFromCart(item.id);
    });
  };

  return (
    <li className={`flex gap-4 py-6 ${isRemoving ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Product Image */}
      <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100 border border-stone-100">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText || item.product.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-stone-300 text-xs">—</div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-0.5">
              {item.product.brand || "Fragrance Whisper"}
            </p>
            <p className="text-sm font-serif font-medium text-stone-900">{item.product.name}</p>
            <p className="text-xs text-stone-500 mt-0.5">{item.product.volumeMl}ml</p>
          </div>
          <p className="text-sm font-bold text-stone-900 whitespace-nowrap">
            {formatPrice(lineTotal)}
          </p>
        </div>

        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

        {/* Qty Controls & Remove */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center rounded-md border border-stone-200 bg-white">
            <button
              type="button"
              disabled={isPending || item.quantity <= 1}
              onClick={() => handleQtyChange(item.quantity - 1)}
              className="px-2.5 py-1.5 text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-colors text-sm"
            >
              −
            </button>
            <span className="px-3 py-1 text-sm font-semibold text-stone-900 min-w-[2rem] text-center border-x border-stone-200">
              {isPending ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : item.quantity}
            </span>
            <button
              type="button"
              disabled={isPending || item.quantity >= item.product.stock}
              onClick={() => handleQtyChange(item.quantity + 1)}
              className="px-2.5 py-1.5 text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-colors text-sm"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
