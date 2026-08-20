import { z } from "zod";

const fragranceNotesSchema = z.object({
  top: z.string().min(1, "Top notes are required"),
  middle: z.string().min(1, "Middle notes are required"),
  base: z.string().min(1, "Base notes are required"),
});

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  brand: z.string().optional(),
  price: z.coerce.number().positive("Price must be a positive number"),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  sku: z.string().min(1, "SKU is required"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  fragranceNotes: fragranceNotesSchema,
  volumeMl: z.coerce.number().int().positive("Volume must be a positive integer"),
  gender: z.enum(["MALE", "FEMALE", "UNISEX"]),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string()).optional(),
});

export const updateProductSchema = productSchema.partial().extend({
  name: z.string().min(2).optional(),
});

export const productFilterSchema = z.object({
  categorySlug: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "UNISEX"]).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  inStockOnly: z.boolean().optional(),
  search: z.string().optional(),
  sort: z.enum(["price_asc", "price_desc", "newest", "featured"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export type ProductInput = z.infer<typeof productSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilter = z.infer<typeof productFilterSchema>;
