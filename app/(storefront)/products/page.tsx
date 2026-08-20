import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/src/features/products/queries";
import { getCategories } from "@/src/features/categories/queries";
import Price from "@/src/components/shared/Price";
import SortSelector from "@/src/components/shared/SortSelector";
import MobileFilters from "@/src/features/products/components/MobileFilters";
import { GENDER_LABELS } from "@/src/lib/constants";
import { Filter, SlidersHorizontal } from "lucide-react";

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    gender?: string;
    search?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const categories = await getCategories();

  const currentFilters = {
    categorySlug: resolvedParams.category,
    gender: resolvedParams.gender as "MALE" | "FEMALE" | "UNISEX" | undefined,
    search: resolvedParams.search,
    sort: resolvedParams.sort as "price_asc" | "price_desc" | "newest" | "featured" | undefined,
    page: resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1,
  };

  const { products, total, totalPages, page } = await getProducts(currentFilters);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Title */}
      <div className="border-b border-stone-200 pb-5 mb-8">
        <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-stone-900">
          Shop All Fragrances
        </h1>
        <p className="mt-2 text-sm text-stone-500 font-sans">
          Discover our curated collection of luxury scents ({total} results).
        </p>
      </div>

      {/* Mobile Filters Tray */}
      <div className="mb-6 lg:hidden">
        <MobileFilters categories={categories} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters (Desktop only) */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="flex items-center gap-2 font-serif text-lg font-medium text-stone-900 border-b border-stone-100 pb-3">
            <Filter className="h-4 w-4 text-amber-600" />
            Filters
          </div>

          {/* Search bar */}
          <form method="GET" action="/products" className="space-y-2">
            {resolvedParams.category && <input type="hidden" name="category" value={resolvedParams.category} />}
            {resolvedParams.gender && <input type="hidden" name="gender" value={resolvedParams.gender} />}
            {resolvedParams.sort && <input type="hidden" name="sort" value={resolvedParams.sort} />}
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">Search</label>
            <input
              type="text"
              name="search"
              placeholder="Search notes, names..."
              defaultValue={resolvedParams.search || ""}
              className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </form>

          {/* Categories list filter */}
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-3">Categories</span>
            <div className="space-y-2">
              <Link
                href={{
                  pathname: "/products",
                  query: { ...resolvedParams, category: undefined, page: undefined },
                }}
                className={`block text-sm transition-colors ${
                  !resolvedParams.category ? "text-amber-700 font-medium" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                All Categories
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={{
                    pathname: "/products",
                    query: { ...resolvedParams, category: cat.slug, page: undefined },
                  }}
                  className={`block text-sm transition-colors ${
                    resolvedParams.category === cat.slug ? "text-amber-700 font-medium" : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {cat.name} ({cat._count.products})
                </Link>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-3">Gender</span>
            <div className="space-y-2">
              <Link
                href={{
                  pathname: "/products",
                  query: { ...resolvedParams, gender: undefined, page: undefined },
                }}
                className={`block text-sm transition-colors ${
                  !resolvedParams.gender ? "text-amber-700 font-medium" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                All Genders
              </Link>
              {Object.entries(GENDER_LABELS).map(([key, label]) => (
                <Link
                  key={key}
                  href={{
                    pathname: "/products",
                    query: { ...resolvedParams, gender: key, page: undefined },
                  }}
                  className={`block text-sm transition-colors ${
                    resolvedParams.gender === key ? "text-amber-700 font-medium" : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid & Sort */}
        <div className="lg:col-span-3">
          {/* Sorting / Controls header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-4 mb-6 gap-4">
            <div className="text-sm text-stone-500 font-sans">
              Showing <span className="font-semibold text-stone-900">{products.length}</span> of{" "}
              <span className="font-semibold text-stone-900">{total}</span> products
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <SlidersHorizontal className="h-4 w-4 text-stone-400" />
              <SortSelector defaultValue={resolvedParams.sort || ""} />
            </div>
          </div>

          {/* Grid content */}
          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg border border-stone-100 p-8">
              <p className="text-lg text-stone-500 font-serif mb-4">No fragrances found matching those filters.</p>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-md bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800 transition-colors"
              >
                Clear All Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => {
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
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
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
                        <Price amount={product.price.toString()} compareAtPrice={product.compareAtPrice?.toString()} size="sm" />
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

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 border-t border-stone-100 pt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <Link
                  key={pNum}
                  href={{
                    pathname: "/products",
                    query: { ...resolvedParams, page: pNum },
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                    pNum === page
                      ? "bg-stone-900 border-stone-900 text-white"
                      : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  {pNum}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
