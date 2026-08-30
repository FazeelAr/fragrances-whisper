"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/src/lib/db";
import { requireAdmin } from "@/src/features/auth/guards";
import { productSchema, updateProductSchema, type ProductInput, type UpdateProductInput } from "./schema";
import { Prisma } from "@prisma/client";
import { uploadProductImage } from "@/src/lib/cloudinary";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function createProduct(data: ProductInput) {
  try {
    await requireAdmin();
    const parsed = productSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const {
      name, slug, description, brand, price, compareAtPrice,
      sku, stock, fragranceNotes, volumeMl, gender,
      isPublished, isFeatured, categoryId,
    } = parsed.data;

    // Check for duplicate slug / SKU
    const [slugExists, skuExists] = await Promise.all([
      db.product.findUnique({ where: { slug } }),
      db.product.findUnique({ where: { sku } }),
    ]);
    if (slugExists) return { success: false, error: "A product with this slug already exists." };
    if (skuExists) return { success: false, error: "A product with this SKU already exists." };

    const product = await db.product.create({
      data: {
        name,
        slug,
        description,
        brand,
        price: new Prisma.Decimal(price),
        compareAtPrice: compareAtPrice != null ? new Prisma.Decimal(compareAtPrice) : null,
        sku,
        stock,
        fragranceNotes,
        volumeMl,
        gender,
        isPublished,
        isFeatured,
        categoryId,
      },
    });

    if (parsed.data.images && parsed.data.images.length > 0) {
      await Promise.all(
        parsed.data.images.map(async (base64, index) => {
          try {
            const { url } = await uploadProductImage(base64, slug);
            await db.productImage.create({
              data: {
                productId: product.id,
                url,
                isPrimary: index === 0,
                position: index,
              },
            });
          } catch (err) {
            console.error("Failed to upload image during product creation", err);
          }
        })
      );
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");
    return {
      success: true,
      data: {
        ...product,
        price: product.price.toString(),
        compareAtPrice: product.compareAtPrice?.toString() ?? null,
      },
    };
  } catch (e: any) {
    if (e.message?.includes("Unauthorized")) return { success: false, error: e.message };
    console.error("createProduct error:", e);
    return { success: false, error: "Failed to create product." };
  }
}

export async function updateProduct(id: string, data: UpdateProductInput) {
  try {
    await requireAdmin();
    const parsed = updateProductSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { price, compareAtPrice, images, ...rest } = parsed.data;

    const updateData: Prisma.ProductUpdateInput = {
      ...rest,
      ...(price !== undefined && { price: new Prisma.Decimal(price) }),
      ...(compareAtPrice !== undefined && {
        compareAtPrice: compareAtPrice != null ? new Prisma.Decimal(compareAtPrice) : null,
      }),
    };

    const product = await db.product.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/products");
    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/products");
    revalidatePath("/");
    return {
      success: true,
      data: {
        ...product,
        price: product.price.toString(),
        compareAtPrice: product.compareAtPrice?.toString() ?? null,
      },
    };
  } catch (e: any) {
    if (e.message?.includes("Unauthorized")) return { success: false, error: e.message };
    console.error("updateProduct error:", e);
    return { success: false, error: "Failed to update product." };
  }
}

export async function updateProductPrice(id: string, price: number) {
  try {
    await requireAdmin();
    if (price <= 0) return { success: false, error: "Price must be a positive number." };

    const product = await db.product.update({
      where: { id },
      data: { price: new Prisma.Decimal(price) },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/products/${product.slug}`);
    return {
      success: true,
      data: {
        ...product,
        price: product.price.toString(),
        compareAtPrice: product.compareAtPrice?.toString() ?? null,
      },
    };
  } catch (e: any) {
    if (e.message?.includes("Unauthorized")) return { success: false, error: e.message };
    console.error("updateProductPrice error:", e);
    return { success: false, error: "Failed to update price." };
  }
}

export async function togglePublishProduct(id: string) {
  try {
    await requireAdmin();
    const product = await db.product.findUnique({ where: { id }, select: { isPublished: true, slug: true } });
    if (!product) return { success: false, error: "Product not found." };

    const updated = await db.product.update({
      where: { id },
      data: { isPublished: !product.isPublished },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/products");
    revalidatePath("/");
    return {
      success: true,
      data: {
        ...updated,
        price: updated.price.toString(),
        compareAtPrice: updated.compareAtPrice?.toString() ?? null,
      },
    };
  } catch (e: any) {
    if (e.message?.includes("Unauthorized")) return { success: false, error: e.message };
    console.error("togglePublishProduct error:", e);
    return { success: false, error: "Failed to toggle publish status." };
  }
}

export async function deleteProduct(id: string) {
  try {
    await requireAdmin();

    // Check for order history — use soft delete (unpublish) instead of hard delete
    const orderItemCount = await db.orderItem.count({ where: { productId: id } });
    if (orderItemCount > 0) {
      // Soft delete: unpublish the product so it's not visible, but keep the data for order history
      const product = await db.product.update({
        where: { id },
        data: { isPublished: false },
      });
      revalidatePath("/admin/products");
      return {
        success: true,
        data: product,
        warning: "Product has order history and was unpublished instead of deleted to preserve data integrity.",
      };
    }

    await db.product.delete({ where: { id } });
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true };
  } catch (e: any) {
    if (e.message?.includes("Unauthorized")) return { success: false, error: e.message };
    console.error("deleteProduct error:", e);
    return { success: false, error: "Failed to delete product." };
  }
}
