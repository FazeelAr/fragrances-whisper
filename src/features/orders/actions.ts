"use server";

import { db } from "@/src/lib/db";
import { auth } from "@/src/lib/auth";
import { cookies } from "next/headers";
import { getCartWithItems, getCartTotals } from "@/src/features/cart/queries";
import { clearCart } from "@/src/features/cart/actions";
import { checkoutSchema, type CheckoutInput } from "./schema";
import { generateOrderNumber } from "@/src/lib/utils";
import { initiatePayfastPayment } from "@/src/features/payments/payfast/client";
import { revalidatePath } from "next/cache";

export async function placeOrder(data: CheckoutInput) {
  const parsed = checkoutSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    // 1. Fetch Cart from cookie
    const cart = await getCartWithItems();
    if (!cart || cart.items.length === 0) {
      return { success: false, error: "Your cart is empty." };
    }

    // 2. Validate Stock and Re-calculate Totals
    interface OrderItemData {
      productId: string;
      productName: string;
      productImage: string | null;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }
    const orderItemsData: OrderItemData[] = [];
    const totals = getCartTotals(cart.items.map((i) => ({ priceAtAdd: i.priceAtAdd, quantity: i.quantity })));

    // Re-verify current DB values for each item
    for (const item of cart.items) {
      const product = await db.product.findUnique({
        where: { id: item.productId, isPublished: true },
        include: { images: true },
      });

      if (!product) {
        return { success: false, error: `Product "${item.product.name}" is no longer available.` };
      }

      if (product.stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${item.product.name}". Only ${product.stock} available.`,
        };
      }

      const primaryImage = product.images.find(img => img.isPrimary)?.url || product.images[0]?.url || null;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        productImage: primaryImage,
        quantity: item.quantity,
        unitPrice: Number(product.price),
        lineTotal: Number(product.price) * item.quantity,
      });
    }

    const orderNumber = generateOrderNumber();

    // 3. Create Order in Database
    const order = await db.$transaction(async (tx) => {
      // Create Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderNumber,
          phone: parsed.data.phone,
          email: parsed.data.email,
          paymentMethod: parsed.data.paymentMethod,
          paymentStatus: "UNPAID",
          status: "PENDING",
          subtotal: totals.subtotal,
          shippingFee: totals.shipping,
          tax: totals.tax,
          total: totals.total,
          shippingAddress: {
            fullName: parsed.data.fullName,
            address: parsed.data.address,
            city: parsed.data.city,
          },
          items: {
            create: orderItemsData.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              productImage: item.productImage,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            })),
          },
        },
      });

      // If COD or WHATSAPP, decrement stock immediately
      if (parsed.data.paymentMethod === "COD" || parsed.data.paymentMethod === "WHATSAPP") {
        for (const item of orderItemsData) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return newOrder;
    });

    // Clear the cart cookie
    await clearCart();

    revalidatePath("/cart");
    revalidatePath("/admin/products");

    // 4. Handle Redirections
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (parsed.data.paymentMethod === "COD" || parsed.data.paymentMethod === "WHATSAPP") {
      return {
        success: true,
        redirectUrl: `/checkout/success?orderNumber=${order.orderNumber}`,
      };
    } else {
      // PayFast Flow
      const paymentInit = await initiatePayfastPayment({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: totals.total,
        customerEmail: parsed.data.email,
        customerMobile: parsed.data.phone,
        successUrl: `${appUrl}/checkout/success?orderNumber=${order.orderNumber}`,
        failureUrl: `${appUrl}/checkout/cancel?orderNumber=${order.orderNumber}`,
      });

      if (paymentInit.success && paymentInit.redirectUrl) {
        return { success: true, redirectUrl: paymentInit.redirectUrl };
      }

      return {
        success: false,
        error: paymentInit.error || "Failed to initiate PayFast payment session.",
      };
    }
  } catch (error: any) {
    console.error("placeOrder error:", error);
    return { success: false, error: "An unexpected error occurred while placing your order." };
  }
}
