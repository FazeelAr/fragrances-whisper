import { getCategories } from "@/src/features/categories/queries";
import NewProductForm from "@/src/features/products/components/NewProductForm";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-stone-900">New Product</h1>
        <p className="text-stone-500 text-sm font-sans mt-1">Fill in the details to create a new fragrance product.</p>
      </div>
      <NewProductForm categories={categories} />
    </div>
  );
}
