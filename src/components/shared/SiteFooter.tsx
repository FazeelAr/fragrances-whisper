import Link from "next/link";
import { STORE_NAME } from "@/src/lib/constants";
import { getCategories } from "@/src/features/categories/queries";

export default async function SiteFooter() {
  const categories = await getCategories();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <span className="text-xl font-bold font-serif italic text-white tracking-wide">
              {STORE_NAME}
            </span>
            <p className="text-sm text-neutral-400 font-sans leading-relaxed">
              Exquisite niche fragrances, traditional attars, and luxury gift sets curated with refinement for the scent connoisseur.
            </p>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <Link href="/products" className="hover:text-amber-500 transition-colors">
                  Shop All Products
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <Link href={`/categories/${category.slug}`} className="hover:text-amber-500 transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care Column */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Customer Support</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <span className="block">Shipping across Pakistan</span>
              </li>
              <li>
                <span className="block">Delivery within 3-5 business days</span>
              </li>
              <li>
                <a
                  href="https://wa.me/923149448877"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  WhatsApp: 0314 9448877
                </a>
              </li>
              <li>
                <span className="block">Support: support@fragrancewhisper.com</span>
              </li>
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">About Brand</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Based in Pakistan, Fragrance Whisper combines traditional oriental perfumery notes with modern niche composition.
            </p>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
          <p>© {currentYear} {STORE_NAME}. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-neutral-300">Privacy Policy</span>
            <span className="hover:text-neutral-300">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
