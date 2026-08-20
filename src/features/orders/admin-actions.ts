"use server";

import { db } from "@/src/lib/db";
import { requireAdmin } from "@/src/features/auth/guards";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    await requireAdmin();

    const validStatuses = ["PENDING", "PROCESSING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED", "FAILED"];
    if (!validStatuses.includes(status)) {
      return { success: false, error: "Invalid status value." };
    }

    const order = await db.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true, orderNumber: order.orderNumber };
  } catch (e: any) {
    if (e.message?.includes("Unauthorized")) return { success: false, error: e.message };
    console.error("updateOrderStatus error:", e);
    return { success: false, error: "Failed to update order status." };
  }
}

export async function updatePaymentStatus(orderId: string, paymentStatus: string) {
  try {
    await requireAdmin();

    const validStatuses = ["UNPAID", "PAID", "REFUNDED", "FAILED"];
    if (!validStatuses.includes(paymentStatus)) {
      return { success: false, error: "Invalid payment status." };
    }

    const order = await db.order.update({
      where: { id: orderId },
      data: { paymentStatus: paymentStatus as any },
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true, orderNumber: order.orderNumber };
  } catch (e: any) {
    if (e.message?.includes("Unauthorized")) return { success: false, error: e.message };
    console.error("updatePaymentStatus error:", e);
    return { success: false, error: "Failed to update payment status." };
  }
}
