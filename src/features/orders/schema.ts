import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Street address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  paymentMethod: z.enum(["PAYFAST", "COD", "WHATSAPP"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
