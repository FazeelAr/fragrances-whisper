"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortSelector({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("sort", val);
    } else {
      params.delete("sort");
    }
    params.delete("page"); // reset page on sort change
    router.push(`/products?${params.toString()}`);
  };

  return (
    <select
      onChange={(e) => handleSortChange(e.target.value)}
      defaultValue={defaultValue}
      className="rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
    >
      <option value="">Sort By (Default)</option>
      <option value="featured">Featured First</option>
      <option value="newest">New Arrivals</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
    </select>
  );
}
