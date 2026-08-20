// Store identity
export const STORE_NAME = "Fragrance Whisper";
export const STORE_EMAIL = "orders@fragrancewhisper.com";
export const CURRENCY = "PKR";

// Pricing
export const SHIPPING_FEE = 200; // PKR flat rate
export const TAX_RATE = 0; // 0% — adjust if GST applies
export const FREE_SHIPPING_THRESHOLD = 5000; // PKR

// Pagination
export const PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 20;

// Order statuses (mirrors the Prisma enum, for use in UI)
export const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "FAILED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  PAID: "Paid",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
};

// Payment statuses
export const PAYMENT_STATUSES = ["UNPAID", "PAID", "REFUNDED", "FAILED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// Gender labels
export const GENDER_LABELS = {
  MALE: "Men",
  FEMALE: "Women",
  UNISEX: "Unisex",
} as const;
