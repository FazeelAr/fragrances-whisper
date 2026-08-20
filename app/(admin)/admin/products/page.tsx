import Link from "next/link";
import Image from "next/image";
import { getAdminProducts } from "@/src/features/products/queries";
import { getCategories } from "@/src/features/categories/queries";
import { togglePublishProduct, deleteProduct } from "@/src/features/products/actions";
import { formatPrice } from "@/src/lib/utils";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

interface AdminProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const resolvedParams = await searchParams;
  const [products, categories] = await Promise.all([
    getAdminProducts(resolvedParams.search, resolvedParams.category),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Products</h1>
          <p className="text-stone-500 text-sm font-sans mt-1">{products.length} total products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {/* Filters Bar */}
      <form method="GET" action="/admin/products" className="flex flex-col sm:flex-row gap-3 bg-white border border-stone-100 rounded-xl p-4 shadow-sm">
        <input
          type="text"
          name="search"
          placeholder="Search products by name or SKU..."
          defaultValue={resolvedParams.search || ""}
          className="flex-1 rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none"
        />
        <select
          name="category"
          defaultValue={resolvedParams.category || ""}
          className="rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Products Table */}
      <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-20 text-stone-400 font-sans">
            <p className="text-lg mb-4">No products found.</p>
            <Link href="/admin/products/new" className="text-amber-700 font-semibold hover:underline">Add your first product</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider hidden sm:table-cell">SKU</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider hidden lg:table-cell">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((product) => {
                  const primaryImage = product.images?.[0];
                  return (
                    <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 flex-shrink-0 rounded-md overflow-hidden bg-stone-100 border border-stone-200">
                            {primaryImage ? (
                              <Image src={primaryImage.url} alt={product.name} fill className="object-cover" sizes="40px" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-stone-300 text-xs">—</div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-stone-900">{product.name}</p>
                            <p className="text-xs text-stone-400 font-sans">{product.volumeMl}ml</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="font-mono text-xs text-stone-600">{product.sku}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-stone-600">{product.category.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-semibold text-stone-900">{formatPrice(product.price.toString())}</span>
                          {product.compareAtPrice && (
                            <span className="text-xs text-stone-400 line-through ml-1 block">{formatPrice(product.compareAtPrice.toString())}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          product.stock === 0 ? "bg-red-50 text-red-700" :
                          product.stock <= 5 ? "bg-amber-50 text-amber-800" :
                          "bg-green-50 text-green-700"
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          product.isPublished ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-600"
                        }`}>
                          {product.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {/* Publish Toggle */}
                          <form action={async () => {
                            "use server";
                            await togglePublishProduct(product.id);
                          }}>
                            <button
                              type="submit"
                              title={product.isPublished ? "Unpublish" : "Publish"}
                              className={`p-1.5 rounded-md transition-colors ${
                                product.isPublished
                                  ? "text-green-600 hover:bg-green-50"
                                  : "text-stone-400 hover:bg-stone-100"
                              }`}
                            >
                              {product.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                          </form>
                          {/* Edit */}
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-1.5 rounded-md text-stone-500 hover:bg-stone-100 transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          {/* Delete */}
                          <form action={async () => {
                            "use server";
                            await deleteProduct(product.id);
                          }}>
                            <button
                              type="submit"
                              title="Delete"
                              className="p-1.5 rounded-md text-red-400 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
