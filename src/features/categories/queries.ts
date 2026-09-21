import { db } from "@/src/lib/db";
import { cache } from "react";
import { unstable_cache } from "next/cache";

export const getCategories = cache(
  unstable_cache(
    async () => {
      try {
        return await db.category.findMany({
          orderBy: { name: "asc" },
          include: { _count: { select: { products: true } } },
        });
      } catch (error) {
        console.error("getCategories database fetch error:", error);
        return [];
      }
    },
    ["storefront-categories"],
    { revalidate: 3600, tags: ["categories"] }
  )
);

export const getCategoryBySlug = cache(async (slug: string) => {
  return db.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isPublished: true },
        include: { images: { where: { isPrimary: true }, take: 1 } },
      },
    },
  });
});

export const getCategoryById = cache(async (id: string) => {
  return db.category.findUnique({ where: { id } });
});

