import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductBySlug, getRelatedProducts } from "@/src/features/products/queries";
import Price from "@/src/components/shared/Price";
import ProductInteractive from "@/src/features/products/components/ProductInteractive";
import { Sparkles, Compass } from "lucide-react";
import { Metadata } from "next";
import { STORE_NAME } from "@/src/lib/constants";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);
  if (!product) return {};

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];

  return {
    title: `${product.name} | ${STORE_NAME}`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: primaryImage ? [{ url: primaryImage.url }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, product.categoryId, 4);

  // Parse notes safe structure
  const notes = typeof product.fragranceNotes === 'object' && product.fragranceNotes !== null
    ? (product.fragranceNotes as Record<string, string>)
    : { top: "Unknown", middle: "Unknown", base: "Unknown" };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-sans text-stone-400 mb-8 uppercase tracking-widest">
        <Link href="/" className="hover:text-amber-700 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-amber-700 transition-colors">Products</Link>
        <span>/</span>
        <span className="text-stone-500 font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Main product interactive display */}
      <ProductInteractive
        product={{
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price.toString(),
          compareAtPrice: product.compareAtPrice?.toString() || null,
          stock: product.stock,
          volumeMl: product.volumeMl,
          gender: product.gender,
        }}
        images={product.images}
      />

      {/* Product Details, Fragrance Notes & Description */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-stone-100 pt-12">
        {/* Description */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-serif text-stone-900 border-b border-stone-100 pb-3">
            About the Fragrance
          </h2>
          <p className="text-stone-600 font-sans leading-relaxed text-base whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Fragrance Notes */}
        <div className="lg:col-span-1 bg-gradient-to-tr from-stone-50 to-stone-100/50 rounded-lg p-6 border border-stone-100">
          <h3 className="text-lg font-serif text-stone-900 border-b border-stone-200 pb-3 mb-6 flex items-center gap-2">
            <Compass className="h-4 w-4 text-amber-600" />
            Scent Profile
          </h3>
          <div className="space-y-6 font-sans">
            <div>
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-widest block mb-1">
                Top Notes
              </span>
              <p className="text-stone-700 font-medium text-sm">{notes.top}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-widest block mb-1">
                Middle Notes (Heart)
              </span>
              <p className="text-stone-700 font-medium text-sm">{notes.middle}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-widest block mb-1">
                Base Notes
              </span>
              <p className="text-stone-700 font-medium text-sm">{notes.base}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related products widget */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 border-t border-stone-100 pt-16">
          <div className="flex items-center gap-2 mb-10">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="text-2xl font-serif text-stone-900">You May Also Like</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {relatedProducts.map((p) => {
              const pImg = p.images.find((img) => img.isPrimary) || p.images[0];
              return (
                <div key={p.id} className="group relative flex flex-col bg-white rounded-lg border border-stone-100 overflow-hidden hover:shadow-lg transition-all">
                  <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
                    {pImg ? (
                      <Image
                        src={pImg.url}
                        alt={pImg.altText || p.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-stone-400 text-xs sm:text-base">No Image</div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-3 sm:p-5">
                    <span className="text-xs text-stone-400 uppercase tracking-widest mb-1.5">
                      {p.brand || "Fragrance Whisper"}
                    </span>
                    <h3 className="text-base font-serif text-stone-950 mb-2">
                      <Link href={`/products/${p.slug}`} className="hover:text-amber-700 transition-colors">
                        <span aria-hidden="true" className="absolute inset-0" />
                        {p.name}
                      </Link>
                    </h3>
                    <div className="mt-auto flex items-center justify-between">
                      <Price amount={p.price.toString()} compareAtPrice={p.compareAtPrice?.toString()} size="sm" />
                      <span className="text-xs text-stone-400 font-medium">
                        {p.volumeMl}ml
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
