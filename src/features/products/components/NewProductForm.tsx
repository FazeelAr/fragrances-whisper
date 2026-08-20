"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/src/features/products/actions";
import { slugify } from "@/src/lib/utils";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

export default function NewProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      name: fd.get("name") as string,
      slug: fd.get("slug") as string,
      description: fd.get("description") as string,
      brand: fd.get("brand") as string || undefined,
      price: parseFloat(fd.get("price") as string),
      compareAtPrice: fd.get("compareAtPrice") ? parseFloat(fd.get("compareAtPrice") as string) : null,
      sku: fd.get("sku") as string,
      stock: parseInt(fd.get("stock") as string, 10),
      fragranceNotes: {
        top: fd.get("notesTop") as string,
        middle: fd.get("notesMiddle") as string,
        base: fd.get("notesBase") as string,
      },
      volumeMl: parseInt(fd.get("volumeMl") as string, 10),
      gender: fd.get("gender") as "MALE" | "FEMALE" | "UNISEX",
      isPublished: fd.get("isPublished") === "on",
      isFeatured: fd.get("isFeatured") === "on",
      categoryId: fd.get("categoryId") as string,
    };

    startTransition(async () => {
      const result = await createProduct(payload);
      if (!result.success) {
        setError(result.error || "Failed to create product.");
      } else {
        router.push("/admin/products");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <section className="bg-white border border-stone-100 rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-serif text-lg font-medium text-stone-900 border-b border-stone-100 pb-3">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="name">
              Product Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
              placeholder="e.g. Imperial Oud Eau de Parfum"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="slug">
              URL Slug *
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none font-mono"
              placeholder="auto-generated-from-name"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="description">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
            placeholder="Describe the fragrance, its character, and best occasions to wear it..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="brand">
              Brand
            </label>
            <input
              id="brand"
              name="brand"
              type="text"
              defaultValue="Fragrance Whisper"
              className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="sku">
              SKU *
            </label>
            <input
              id="sku"
              name="sku"
              type="text"
              required
              className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 font-mono focus:border-amber-500 focus:outline-none"
              placeholder="FW-EDP-XXX-001"
            />
          </div>
        </div>
      </section>

      {/* Pricing & Inventory */}
      <section className="bg-white border border-stone-100 rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-serif text-lg font-medium text-stone-900 border-b border-stone-100 pb-3">Pricing & Inventory</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="price">
              Price (PKR) *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              required
              min="0"
              step="0.01"
              className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
              placeholder="5000"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="compareAtPrice">
              Compare At Price (PKR)
            </label>
            <input
              id="compareAtPrice"
              name="compareAtPrice"
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
              placeholder="Optional sale price"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="stock">
              Stock *
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              required
              min="0"
              defaultValue={0}
              className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="volumeMl">
              Volume (ml) *
            </label>
            <input
              id="volumeMl"
              name="volumeMl"
              type="number"
              required
              min="1"
              className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
              placeholder="50"
            />
          </div>
        </div>
      </section>

      {/* Categorization */}
      <section className="bg-white border border-stone-100 rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-serif text-lg font-medium text-stone-900 border-b border-stone-100 pb-3">Categorization</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="categoryId">
              Category *
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="gender">
              Gender *
            </label>
            <select
              id="gender"
              name="gender"
              required
              className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
            >
              <option value="UNISEX">Unisex</option>
              <option value="MALE">Men</option>
              <option value="FEMALE">Women</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
            <input type="checkbox" name="isPublished" className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
            Publish immediately
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
            <input type="checkbox" name="isFeatured" className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
            Feature on homepage
          </label>
        </div>
      </section>

      {/* Fragrance Notes */}
      <section className="bg-white border border-stone-100 rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-serif text-lg font-medium text-stone-900 border-b border-stone-100 pb-3">Fragrance Notes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="notesTop">Top Notes *</label>
            <input
              id="notesTop"
              name="notesTop"
              type="text"
              required
              className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
              placeholder="e.g. Bergamot, Pink Pepper"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="notesMiddle">Middle Notes *</label>
            <input
              id="notesMiddle"
              name="notesMiddle"
              type="text"
              required
              className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
              placeholder="e.g. Oud, Rose, Patchouli"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="notesBase">Base Notes *</label>
            <input
              id="notesBase"
              name="notesBase"
              type="text"
              required
              className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
              placeholder="e.g. Amber, Vanilla, Sandalwood"
            />
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 transition-colors disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Creating..." : "Create Product"}
        </button>
      </div>
    </form>
  );
}
