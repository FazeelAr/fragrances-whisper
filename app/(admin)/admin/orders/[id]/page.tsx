import { db } from "@/src/lib/db";
import { notFound } from "next/navigation";
import { formatPrice } from "@/src/lib/utils";
import { ORDER_STATUS_LABELS } from "@/src/lib/constants";
import Link from "next/link";
import { ArrowLeft, MapPin, CreditCard, User } from "lucide-react";
import OrderStatusUpdater from "@/src/features/orders/components/OrderStatusUpdater";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      payments: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!order) notFound();

  const shippingAddr = order.shippingAddress as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Orders
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Order {order.orderNumber}
          </h1>
          <p className="text-stone-500 text-sm font-sans">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-PK", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100">
              <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">Order Items</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Qty</th>
                  <th className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {item.productImage && (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="h-10 w-10 rounded-md object-cover bg-stone-100"
                          />
                        )}
                        <span className="font-medium text-stone-900">{item.productName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-stone-600">
                      {formatPrice(item.unitPrice.toString())}
                    </td>
                    <td className="px-5 py-3 text-stone-600">{item.quantity}</td>
                    <td className="px-5 py-3 text-right font-semibold text-stone-900">
                      {formatPrice(item.lineTotal.toString())}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-stone-100 px-5 py-4 space-y-1.5">
              <div className="flex justify-between text-sm text-stone-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal.toString())}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-600">
                <span>Shipping</span>
                <span>{formatPrice(order.shippingFee.toString())}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-600">
                <span>Tax</span>
                <span>{formatPrice(order.tax.toString())}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-100">
                <span>Total</span>
                <span>{formatPrice(order.total.toString())}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <div className="rounded-xl border border-stone-200 bg-white shadow-sm p-5">
            <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-4">Update Status</h3>
            <OrderStatusUpdater
              orderId={order.id}
              currentStatus={order.status}
              currentPaymentStatus={order.paymentStatus}
            />
          </div>

          {/* Customer Info */}
          <div className="rounded-xl border border-stone-200 bg-white shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-stone-400" />
              Customer
            </h3>
            <div className="text-sm text-stone-700">
              <p className="font-medium">{shippingAddr?.fullName || order.user?.name || "Guest"}</p>
              <p className="text-stone-500">{order.email}</p>
              <p className="text-stone-500">{order.phone}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl border border-stone-200 bg-white shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="h-4 w-4 text-stone-400" />
              Shipping Address
            </h3>
            <div className="text-sm text-stone-600 space-y-0.5">
              {shippingAddr ? (
                <>
                  <p>{shippingAddr.fullName}</p>
                  <p>{shippingAddr.address}</p>
                  <p>{shippingAddr.city}</p>
                </>
              ) : (
                <p className="text-stone-400 italic">No address data</p>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-xl border border-stone-200 bg-white shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-stone-400" />
              Payment
            </h3>
            <div className="text-sm text-stone-600 space-y-1">
              <p><span className="text-stone-400">Method:</span> {order.paymentMethod}</p>
              <p><span className="text-stone-400">Status:</span> {order.paymentStatus}</p>
              {order.payfastTransactionId && (
                <p><span className="text-stone-400">PayFast ID:</span> <code className="text-xs bg-stone-100 px-1.5 py-0.5 rounded">{order.payfastTransactionId}</code></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
