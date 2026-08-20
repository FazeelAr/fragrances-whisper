import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Conditional class name utility for shadcn/ui
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Pakistani Rupees (PKR).
 * Always pass a number or Decimal — convert at the call site.
 */
export function formatPrice(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Generate a URL-safe slug from a string.
 * Synchronous — no I/O.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Truncate text to a given character limit with ellipsis.
 * Synchronous — no I/O.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900); // 3-digit random number
  return `FW-${timestamp}-${random}`;
}
