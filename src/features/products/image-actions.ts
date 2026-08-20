"use server";

import { db } from "@/src/lib/db";
import { requireAdmin } from "@/src/features/auth/guards";
import { uploadProductImage, deleteProductImage } from "@/src/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function addProductImage(
  productId: string,
  fileBase64: string,
  altText?: string,
  isPrimary?: boolean
) {
  try {
    await requireAdmin();

    const product = await db.product.findUnique({ where: { id: productId }, select: { slug: true } });
    if (!product) return { success: false, error: "Product not found." };

    const { url } = await uploadProductImage(fileBase64, product.slug);

    // If this is primary, clear existing primary flags first
    if (isPrimary) {
      await db.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }

    const maxPosition = await db.productImage.aggregate({
      where: { productId },
      _max: { position: true },
    });
    const nextPosition = (maxPosition._max.position ?? -1) + 1;

    const image = await db.productImage.create({
      data: { productId, url, altText, isPrimary: isPrimary ?? false, position: nextPosition },
    });

    revalidatePath(`/admin/products/${productId}/edit`);
    return { success: true, data: image };
  } catch (e: any) {
    if (e.message?.includes("Unauthorized")) return { success: false, error: e.message };
    console.error("addProductImage error:", e);
    return { success: false, error: "Failed to upload image." };
  }
}

export async function deleteProductImageAction(imageId: string) {
  try {
    await requireAdmin();

    const image = await db.productImage.findUnique({ where: { id: imageId } });
    if (!image) return { success: false, error: "Image not found." };

    // Extract public ID from URL (format: .../upload/v1234/folder/filename.ext)
    const urlParts = image.url.split("/upload/");
    if (urlParts.length > 1) {
      const publicIdWithExt = urlParts[1].replace(/^v\d+\//, "");
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");
      try {
        await deleteProductImage(publicId);
      } catch {
        // Log but don't block DB cleanup
        console.warn("Could not delete image from Cloudinary:", publicId);
      }
    }

    await db.productImage.delete({ where: { id: imageId } });

    // If we deleted the primary image, promote the first remaining one
    if (image.isPrimary) {
      const nextImage = await db.productImage.findFirst({
        where: { productId: image.productId },
        orderBy: { position: "asc" },
      });
      if (nextImage) {
        await db.productImage.update({ where: { id: nextImage.id }, data: { isPrimary: true } });
      }
    }

    revalidatePath(`/admin/products/${image.productId}/edit`);
    return { success: true };
  } catch (e: any) {
    if (e.message?.includes("Unauthorized")) return { success: false, error: e.message };
    console.error("deleteProductImageAction error:", e);
    return { success: false, error: "Failed to delete image." };
  }
}

export async function setPrimaryImage(imageId: string, productId: string) {
  try {
    await requireAdmin();

    await db.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
    await db.productImage.update({ where: { id: imageId }, data: { isPrimary: true } });

    revalidatePath(`/admin/products/${productId}/edit`);
    return { success: true };
  } catch (e: any) {
    if (e.message?.includes("Unauthorized")) return { success: false, error: e.message };
    console.error("setPrimaryImage error:", e);
    return { success: false, error: "Failed to set primary image." };
  }
}
