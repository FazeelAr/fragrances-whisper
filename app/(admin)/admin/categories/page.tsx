import { getCategories } from "@/src/features/categories/queries";
import { createCategory, updateCategory, deleteCategory } from "@/src/features/categories/actions";
import { Edit, Plus, Trash2 } from "lucide-react";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Categories</h1>
          <p className="text-stone-500 text-sm font-sans mt-1">{categories.length} total categories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Category Form */}
        <div className="bg-white border border-stone-100 rounded-xl shadow-sm p-6">
          <h2 className="font-serif text-lg font-medium text-stone-900 border-b border-stone-100 pb-3 mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-amber-600" /> New Category
          </h2>
          <form
            action={async (formData: FormData) => {
              "use server";
              await createCategory({
                name: formData.get("name") as string,
                slug: formData
                  .get("name")!
                  .toString()
                  .toLowerCase()
                  .replace(/[^\w\s-]/g, "")
                  .replace(/\s+/g, "-")
                  .replace(/-+/g, "-")
                  .trim(),
                description: formData.get("description") as string || undefined,
                imageUrl: formData.get("imageUrl") as string || undefined,
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="name">
                Category Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
                placeholder="e.g. Eau de Parfum"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
                placeholder="Brief description of this category..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="imageUrl">
                Image URL
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 transition-colors"
            >
              Create Category
            </button>
          </form>
        </div>

        {/* Existing Categories List */}
        <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="font-serif text-lg font-medium text-stone-900">Existing Categories</h2>
          </div>
          {categories.length === 0 ? (
            <div className="px-6 py-10 text-center text-stone-400 text-sm">No categories yet.</div>
          ) : (
            <ul className="divide-y divide-stone-100">
              {categories.map((category) => (
                <li key={category.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-stone-900">{category.name}</p>
                      <p className="text-xs text-stone-400 font-mono">{category.slug}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{category._count.products} products</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Delete */}
                      <form
                        action={async () => {
                          "use server";
                          await deleteCategory(category.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="p-1.5 rounded-md text-red-400 hover:bg-red-50 transition-colors"
                          title="Delete category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-xs text-stone-500 mt-2 leading-relaxed">{category.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
