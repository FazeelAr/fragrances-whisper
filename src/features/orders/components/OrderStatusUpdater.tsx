"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus, updatePaymentStatus } from "@/src/features/orders/admin-actions";
import { Loader2 } from "lucide-react";

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
}

const ORDER_STATUSES = ["PENDING", "PROCESSING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED", "FAILED"];
const PAYMENT_STATUSES = ["UNPAID", "PAID", "REFUNDED", "FAILED"];

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
  currentPaymentStatus,
}: OrderStatusUpdaterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleStatusChange = (newStatus: string) => {
    setMessage(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        setMessage(`Order status updated to ${newStatus}`);
        router.refresh();
      } else {
        setMessage(result.error || "Failed to update status.");
      }
    });
  };

  const handlePaymentStatusChange = (newStatus: string) => {
    setMessage(null);
    startTransition(async () => {
      const result = await updatePaymentStatus(orderId, newStatus);
      if (result.success) {
        setMessage(`Payment status updated to ${newStatus}`);
        router.refresh();
      } else {
        setMessage(result.error || "Failed to update payment status.");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
          Order Status
        </label>
        <div className="flex items-center gap-2">
          <select
            defaultValue={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isPending}
            className="rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none disabled:opacity-50"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-stone-400" />}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
          Payment Status
        </label>
        <div className="flex items-center gap-2">
          <select
            defaultValue={currentPaymentStatus}
            onChange={(e) => handlePaymentStatusChange(e.target.value)}
            disabled={isPending}
            className="rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none disabled:opacity-50"
          >
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-stone-400" />}
        </div>
      </div>

      {message && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
          {message}
        </p>
      )}
    </div>
  );
}
