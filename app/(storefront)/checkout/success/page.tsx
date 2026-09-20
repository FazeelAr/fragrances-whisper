import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { STORE_NAME } from "@/src/lib/constants";
import { db } from "@/src/lib/db";
import { formatPrice } from "@/src/lib/utils";
import PaymentDetailsCard from "@/src/features/orders/components/PaymentDetailsCard";

interface SuccessPageProps {
  searchParams: Promise<{
    orderNumber?: string;
  }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const resolvedParams = await searchParams;
  const orderNumber = resolvedParams.orderNumber || "FW-UNKNOWN";

  // Fetch order details
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
    },
  });

  const isWhatsAppOrManualPayment =
    !order?.paymentMethod ||
    order.paymentMethod === "WHATSAPP" ||
    order.paymentMethod === "COD";

  const customerName =
    order?.shippingAddress && typeof order.shippingAddress === "object"
      ? (order.shippingAddress as any).fullName || "Customer"
      : "Customer";

  const customerPhone = order?.phone || "N/A";

  const shippingAddress =
    order?.shippingAddress && typeof order.shippingAddress === "object"
      ? `${(order.shippingAddress as any).address || ""}, ${(order.shippingAddress as any).city || ""}`
      : "N/A";

  const items =
    order?.items.map((i) => ({
      name: i.productName,
      quantity: i.quantity,
    })) || [];

  const rawTotal = order ? Number(order.total) : 0;
  const totalFormatted = order ? formatPrice(order.total.toString()) : "Calculating...";

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 bg-stone-50/50">
      <div className="w-full max-w-xl bg-white p-8 border border-stone-100 rounded-2xl shadow-sm space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600 mx-auto">
            <CheckCircle className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-serif text-stone-900 tracking-tight">Order Registered!</h1>
            <p className="text-sm text-stone-500 font-sans">
              Thank you for shopping at {STORE_NAME}.
            </p>
          </div>
        </div>

        {/* Order Details & Summary */}
        <div className="bg-stone-50 rounded-xl p-5 border border-stone-100 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-stone-200">
            <div>
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                Order Number
              </span>
              <span className="text-stone-800 font-mono font-bold text-base">{orderNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                Total Amount
              </span>
              <span className="text-amber-700 font-bold text-base">
                {totalFormatted}
              </span>
            </div>
          </div>

          {isWhatsAppOrManualPayment && (
            <PaymentDetailsCard
              orderNumber={orderNumber}
              totalFormatted={totalFormatted}
              rawTotal={rawTotal}
              customerName={customerName}
              customerPhone={customerPhone}
              shippingAddress={shippingAddress}
              items={items}
            />
          )}
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/products"
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-stone-900 hover:bg-stone-800 px-4 py-3 text-sm font-semibold text-white transition-colors shadow-sm"
          >
            Continue Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
