import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import { verifyPayfastCallback } from "@/src/features/payments/payfast/client";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Verify Callback Signature/Integrity
    const isValid = verifyPayfastCallback(payload);
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }

    const orderId = payload.orderId;
    const amount = payload.amount;
    const transactionId = payload.transactionId || undefined;

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Missing order ID" }, { status: 400 });
    }

    // Process payment in a transaction
    await db.$transaction(async (tx) => {
      // 1. Fetch Order
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error(`Order ${orderId} not found.`);
      }

      // Idempotency check: check if order is already marked as paid
      if (order.paymentStatus === "PAID") {
        return;
      }

      // 2. Decrement stock for each item (since stock wasn't decremented at COD creation)
      for (const item of order.items) {
        if (!item.productId) continue;
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId} at settlement.`);
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 3. Update Order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          status: "PROCESSING",
          payfastTransactionId: transactionId,
        },
      });

      // 4. Create Payment record for audits
      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: new Prisma.Decimal(amount.toString()),
          status: "SUCCESS",
          provider: "PAYFAST",
          rawResponse: payload as any,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PayFast Webhook settlement failed:", error);
    return NextResponse.json({ success: false, error: error.message || "Settlement failed" }, { status: 500 });
  }
}
