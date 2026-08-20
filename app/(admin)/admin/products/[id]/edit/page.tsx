import { notFound } from "next/navigation";
import { getAdminProductById } from "@/src/features/products/queries";
import { getCategories } from "@/src/features/categories/queries";
import EditProductForm from "@/src/features/products/components/EditProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const resolvedParams = await params;
  const [product, categories] = await Promise.all([
    getAdminProductById(resolvedParams.id),
    getCategories(),
  ]);

  if (!product) notFound();

  const notes = product.fragranceNotes as Record<string, string>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-stone-900">Edit Product</h1>
        <p className="text-stone-500 text-sm font-sans mt-1">Editing: <span className="font-medium text-stone-700">{product.name}</span></p>
      </div>
      <EditProductForm
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          brand: product.brand,
          price: product.price.toString(),
          compareAtPrice: product.compareAtPrice?.toString() ?? null,
          sku: product.sku,
          stock: product.stock,
          fragranceNotes: {
            top: notes.top ?? "",
            middle: notes.middle ?? "",
            base: notes.base ?? "",
          },
          volumeMl: product.volumeMl,
          gender: product.gender,
          isPublished: product.isPublished,
          isFeatured: product.isFeatured,
          categoryId: product.categoryId,
          images: product.images,
        }}
        categories={categories}
      />
    </div>
  );
}
