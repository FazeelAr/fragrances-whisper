"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/src/lib/db";
import { requireAdmin } from "@/src/features/auth/guards";
import { categorySchema, updateCategorySchema, type CategoryInput, type UpdateCategoryInput } from "./schema";

export async function createCategory(data: CategoryInput) {
  try {
    await requireAdmin();
    const parsed = categorySchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { name, slug, description, imageUrl } = parsed.data;

    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) {
      return { success: false, error: "A category with this slug already exists." };
    }

    const category = await db.category.create({
      data: { name, slug, description, imageUrl: imageUrl || null },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true, data: category };
  } catch (e: any) {
    if (e.message?.includes("Unauthorized")) return { success: false, error: e.message };
    console.error("createCategory error:", e);
    return { success: false, error: "Failed to create category." };
  }
}

export async function updateCategory(id: string, data: UpdateCategoryInput) {
  try {
    await requireAdmin();
    const parsed = updateCategorySchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const category = await db.category.update({
      where: { id },
      data: {
        ...parsed.data,
        imageUrl: parsed.data.imageUrl || null,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true, data: category };
  } catch (e: any) {
    if (e.message?.includes("Unauthorized")) return { success: false, error: e.message };
    console.error("updateCategory error:", e);
    return { success: false, error: "Failed to update category." };
  }
}

export async function deleteCategory(id: string) {
  try {
    await requireAdmin();

    // Check for products in this category
    const productCount = await db.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return {
        success: false,
        error: `Cannot delete category: it has ${productCount} product(s) associated with it.`,
      };
    }

    await db.category.delete({ where: { id } });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (e: any) {
    if (e.message?.includes("Unauthorized")) return { success: false, error: e.message };
    console.error("deleteCategory error:", e);
    return { success: false, error: "Failed to delete category." };
  }
}
