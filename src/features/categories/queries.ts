import { db } from "@/src/lib/db";

export async function getCategories() {
  return db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isPublished: true },
        include: { images: { where: { isPrimary: true }, take: 1 } },
      },
    },
  });
}

export async function getCategoryById(id: string) {
  return db.category.findUnique({ where: { id } });
}
