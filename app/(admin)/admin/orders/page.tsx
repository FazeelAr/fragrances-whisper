import { db } from "@/src/lib/db";
import { formatPrice } from "@/src/lib/utils";
import { ORDER_STATUS_LABELS } from "@/src/lib/constants";
import Link from "next/link";
import { Eye, Package } from "lucide-react";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      user: { select: { name: true, email: true } },
    },
  });

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    PAID: "bg-green-100 text-green-800",
    SHIPPED: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-emerald-100 text-emerald-800",
    CANCELLED: "bg-red-100 text-red-800",
    FAILED: "bg-red-200 text-red-900",
  };

  const paymentColors: Record<string, string> = {
    UNPAID: "bg-orange-100 text-orange-800",
    PAID: "bg-green-100 text-green-800",
    REFUNDED: "bg-gray-100 text-gray-700",
    FAILED: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Orders</h1>
          <p className="text-stone-500 text-sm font-sans mt-1">
            Manage and update customer orders.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-stone-100 px-4 py-2 text-sm text-stone-600">
          <Package className="h-4 w-4" />
          {orders.length} total orders
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white py-16">
          <Package className="h-12 w-12 text-stone-300 mb-4" />
          <p className="text-stone-500 font-medium">No orders yet</p>
          <p className="text-stone-400 text-sm mt-1">Orders will appear here once customers start purchasing.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-5 py-3">Order #</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((order) => {
                const shippingAddr = order.shippingAddress as any;
                return (
                  <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-semibold text-stone-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-stone-900">
                        {shippingAddr?.fullName || order.user?.name || "Guest"}
                      </div>
                      <div className="text-xs text-stone-400">{order.email}</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-stone-900">
                      {formatPrice(order.total.toString())}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentColors[order.paymentStatus] || "bg-gray-100 text-gray-700"}`}>
                        {order.paymentStatus}
                      </span>
                      <div className="text-xs text-stone-400 mt-0.5">{order.paymentMethod}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                        {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-stone-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-200 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
