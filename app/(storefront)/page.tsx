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
      <section className="relative bg-gradient-to-b from-stone-100/80 via-amber-50/20 to-white py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-neutral-150 overflow-hidden">
        {/* Ambient subtle background glow */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200/60 px-3.5 py-1 text-xs font-semibold tracking-wider text-amber-900 uppercase mb-6 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>Artisanal Perfumery • Pure Concentrates</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-stone-900 leading-[1.15] mb-6">
                Whisper Your Presence <br />
                <span className="italic font-normal text-amber-800">Without Saying a Word</span>
              </h1>

              <p className="max-w-xl text-base sm:text-lg text-stone-600 leading-relaxed font-sans mb-8">
                Immerse yourself in our signature collection of long-lasting Eau de Parfums, light Eau de Toilettes, traditional non-alcoholic Attars, and luxury gift sets crafted for the scent connoisseur.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-10">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-stone-900 px-7 py-3.5 text-sm font-semibold text-white hover:bg-stone-800 transition-all shadow-lg shadow-stone-950/15 hover:shadow-xl active:scale-[0.99]"
                >
                  Shop All Fragrances
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#categories"
                  className="inline-flex items-center justify-center rounded-md border border-stone-300 bg-white px-6 py-3.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-xs"
                >
                  Explore Categories
                </a>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-200/80 w-full max-w-lg text-center lg:text-left">
                <div>
                  <span className="block text-lg font-serif font-bold text-stone-900">100%</span>
                  <span className="text-xs text-stone-500 font-sans">Pure Extracts</span>
                </div>
                <div>
                  <span className="block text-lg font-serif font-bold text-stone-900">Up to 18h</span>
                  <span className="text-xs text-stone-500 font-sans">Long-Lasting Sillage</span>
                </div>
                <div>
                  <span className="block text-lg font-serif font-bold text-stone-900">Nationwide</span>
                  <span className="text-xs text-stone-500 font-sans">Swift Delivery</span>
                </div>
              </div>
            </div>

            {/* Right Picture Column */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md sm:max-w-lg">
                {/* Decorative Amber Aura */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/20 via-amber-300/20 to-stone-400/10 rounded-3xl blur-2xl -z-10 transform rotate-1"></div>

                {/* Picture Container */}
                <div className="relative overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-900 shadow-2xl shadow-stone-950/20 aspect-[4/3] group">
                  <Image
                    src="/hero-perfume.jpg"
                    alt="Artisanal Luxury Perfume Bottle with warm golden amber glass"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Subtle Gradient Overlays for Depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-black/10 pointer-events-none"></div>

                  {/* Floating Luxury Tag */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <div className="rounded-lg bg-black/60 backdrop-blur-md border border-white/15 px-3.5 py-2 text-white shadow-lg">
                      <p className="text-[10px] uppercase tracking-widest text-amber-300 font-bold">Signature Series</p>
                      <p className="text-xs font-serif italic text-stone-100">Ambre Étoilé • Artisanal Parfum</p>
                    </div>
                    <div className="hidden sm:block rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-stone-900 shadow-md">
                      Handcrafted
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
