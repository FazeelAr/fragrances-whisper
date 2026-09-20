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

// WhatsApp, Bank Transfer & Mobile Wallet Payment Configuration
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923149448877";
export const WHATSAPP_DISPLAY = "0314 9448877";
export const EASYPAISA_NUMBER = process.env.NEXT_PUBLIC_EASYPAISA_NUMBER || "03149448877";
export const EASYPAISA_TITLE = process.env.NEXT_PUBLIC_EASYPAISA_TITLE || "Abdurrahman Munir";
export const BANK_NAME = process.env.NEXT_PUBLIC_BANK_NAME || "Allied Bank";
export const BANK_ACCOUNT_TITLE = process.env.NEXT_PUBLIC_BANK_ACCOUNT_TITLE || "Abdurrahman Munir";
export const BANK_ACCOUNT_NUMBER = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "0020077501030012";
export const BANK_IBAN = process.env.NEXT_PUBLIC_BANK_IBAN || "PK86ABPA0020077501030012";


