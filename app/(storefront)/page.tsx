import Link from "next/link";
import Image from "next/image";
import { db } from "@/src/lib/db";
import ProductTabs from "@/src/features/products/components/ProductTabs";
import { Sparkles, ArrowRight } from "lucide-react";

export const revalidate = 3600; // Cache homepage for 1 hour

export default async function Homepage() {
  const [categoriesData, featuredProductsData] = await Promise.all([
    db.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: true } },
        products: {
          where: { isPublished: true },
          include: { images: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        },
      },
    }),
    db.product.findMany({
      where: { isPublished: true },
      include: { images: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const serializeProduct = (product: any) => ({
    ...product,
    price: product.price.toString(),
    compareAtPrice: product.compareAtPrice?.toString() ?? null,
  });

  const categories = categoriesData.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    imageUrl: cat.imageUrl,
    _count: cat._count,
    products: cat.products.map(serializeProduct),
  }));

  const allProducts = featuredProductsData.map(serializeProduct);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center bg-gradient-to-tr from-stone-100 to-stone-50 py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b border-neutral-100 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-4xl text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold tracking-wider text-amber-800 uppercase mb-6 animate-fade-in">
            <Sparkles className="h-3 w-3" />
            Artisanal Perfumery
          </div>
          <h1 className="text-4xl sm:text-6xl font-serif tracking-tight text-stone-900 leading-tight mb-6">
            Whisper Your Presence <br />
            <span className="italic font-normal text-amber-700">Without Saying a Word</span>
          </h1>
          <p className="max-w-2xl text-lg text-stone-600 leading-relaxed font-sans mb-10">
            Immerse yourself in our signature collection of long-lasting Eau de Parfums, light Eau de Toilettes, traditional non-alcoholic Attars, and luxury gift sets crafted for the scent connoisseur.
          </p>
          <div className="flex gap-4">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-md bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-800 transition-colors shadow-lg shadow-stone-950/15"
            >
              Shop All Fragrances
            </Link>
            <a
              href="#categories"
              className="inline-flex items-center justify-center rounded-md border border-stone-200 bg-white px-6 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Explore Categories
            </a>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section id="categories" className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif tracking-tight text-stone-900 mb-3">Shop by Category</h2>
            <p className="text-stone-500 font-sans">Find your perfect perfume concentration or style</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative flex flex-col justify-end overflow-hidden rounded-lg bg-stone-100 aspect-[4/3] p-6 hover:shadow-xl transition-all"
              >
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 to-stone-50/5"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/65 via-stone-950/20 to-transparent"></div>
                <div className="relative">
                  <h3 className="text-lg font-serif text-white mb-1 group-hover:text-amber-400 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-stone-300 font-sans flex items-center gap-1">
                    {category._count.products} Products <ArrowRight className="h-3 w-3" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-stone-50 px-4 sm:px-6 lg:px-8 border-t border-b border-stone-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
            <div>
              <h2 className="text-3xl font-serif tracking-tight text-stone-900 mb-3">Our Signature Collection</h2>
              <p className="text-stone-500 font-sans">Handpicked exquisite scents crafted to perfection</p>
            </div>
            <Link
              href="/products?sort=featured"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1 text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors"
            >
              View Featured Grid <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <ProductTabs allProducts={allProducts} categories={categories} />
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-24 bg-white text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 mb-6 italic">
            "Scent is the most intense form of memory."
          </h2>
          <p className="text-stone-600 font-sans leading-relaxed text-base mb-8">
            Fragrance Whisper was founded to bring luxurious, deep-scented oriental notes and light fresh western accords to Pakistani fragrance enthusiasts. By working directly with master distillers and perfumers, we bottle the purest oils to give you a long-lasting olfactory experience that stays with you.
          </p>
          <div className="h-px w-24 bg-amber-500 mx-auto"></div>
        </div>
      </section>
    </div>
  );
}
