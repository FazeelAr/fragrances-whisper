import { db } from "@/src/lib/db";
import { type ProductFilter } from "./schema";
import { Prisma } from "@prisma/client";
import { cache } from "react";

const PAGE_SIZE = 12;

export async function getProducts(filters: ProductFilter = { page: 1 }) {
  const { categorySlug, gender, minPrice, maxPrice, inStockOnly, search, sort, page } = filters;

  const where: Prisma.ProductWhereInput = {
    isPublished: true,
    ...(gender && { gender }),
    ...(minPrice !== undefined && { price: { gte: new Prisma.Decimal(minPrice) } }),
    ...(maxPrice !== undefined && { price: { lte: new Prisma.Decimal(maxPrice) } }),
    ...(inStockOnly && { stock: { gt: 0 } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(categorySlug && { category: { slug: categorySlug } }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc" ? { price: "asc" }
    : sort === "price_desc" ? { price: "desc" }
    : sort === "featured" ? { isFeatured: "desc" }
    : { createdAt: "desc" };

  const currentPage = page ?? 1;

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true, slug: true } },
      },
    }),
    db.product.count({ where }),
  ]);

  return { products, total, page: currentPage, pageSize: PAGE_SIZE, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export async function getFeaturedProducts(limit = 8) {
  return db.product.findMany({
    where: { isPublished: true, isFeatured: true },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
  });
}

export const getProductBySlug = cache(async (slug: string) => {
  return db.product.findUnique({
    where: { slug, isPublished: true },
    include: {
      images: { orderBy: { position: "asc" } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
});

export const getRelatedProducts = cache(async (productId: string, categoryId: string, limit = 4) => {
  return db.product.findMany({
    where: { isPublished: true, categoryId, id: { not: productId } },
    take: limit,
    include: { images: { where: { isPrimary: true }, take: 1 } },
  });
});

// Admin-only queries (no isPublished filter)
export async function getAdminProducts(search?: string, categoryId?: string) {
  const where: Prisma.ProductWhereInput = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(categoryId && { categoryId }),
  };

  return db.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true, slug: true } },
      images: { where: { isPrimary: true }, take: 1 },
    },
  });
}

export async function getAdminProductById(id: string) {
  return db.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}
