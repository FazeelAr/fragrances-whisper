import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCategoryBySlug } from "@/src/features/categories/queries";
import Price from "@/src/components/shared/Price";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import { STORE_NAME } from "@/src/lib/constants";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const category = await getCategoryBySlug(resolvedParams.slug);
  if (!category) return {};

  return {
    title: `${category.name} | ${STORE_NAME}`,
    description: category.description || `Browse our fine selection of ${category.name}`,
    openGraph: {
      title: category.name,
      description: category.description || `Browse our fine selection of ${category.name}`,
      images: category.imageUrl ? [{ url: category.imageUrl }] : [],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const category = await getCategoryBySlug(resolvedParams.slug);

  if (!category) {
    notFound();
  }

  const products = category.products;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Shop All
        </Link>
      </div>

      {/* Category Banner */}
      <div className="relative rounded-xl bg-gradient-to-tr from-stone-900 to-stone-850 p-8 sm:p-12 mb-12 overflow-hidden text-white shadow-xl shadow-stone-950/10">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        {category.imageUrl && (
          <div className="absolute inset-0 opacity-20">
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-amber-300 uppercase mb-4">
            <Sparkles className="h-3 w-3" />
            Collection
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif tracking-tight mb-4">{category.name}</h1>
          {category.description && (
            <p className="text-stone-300 font-sans text-sm sm:text-base leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-stone-100 p-8">
          <p className="text-lg text-stone-500 font-serif mb-4">No fragrances found in this collection yet.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800 transition-colors"
          >
            Browse Other Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-stone-400">No Image</div>
                  )}
                  {product.compareAtPrice && (
                    <span className="absolute top-3 left-3 bg-amber-600 text-white text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Sale
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
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
    </div>
  );
}
