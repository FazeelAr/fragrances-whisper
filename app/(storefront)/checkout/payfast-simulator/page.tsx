import { db } from "@/src/lib/db";
import { notFound } from "next/navigation";
import PayfastSimulatorClient from "./PayfastSimulatorClient";
import { CreditCard } from "lucide-react";
import { formatPrice } from "@/src/lib/utils";

interface SimulatorPageProps {
  searchParams: Promise<{
    orderId?: string;
  }>;
}

export default async function PayfastSimulatorPage({ searchParams }: SimulatorPageProps) {
  const resolvedParams = await searchParams;
  const orderId = resolvedParams.orderId;
  if (!orderId) notFound();

  const order = await db.order.findUnique({
    where: { id: orderId },
  });

  if (!order) notFound();

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 bg-stone-100/50">
      <div className="w-full max-w-md bg-white p-8 border border-stone-200 rounded-xl shadow-lg space-y-6">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-stone-900">PayFast Sandbox</h1>
            <p className="text-xs text-stone-500 font-sans">Pakistan Merchant API UAT Simulator</p>
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-stone-50 rounded-lg p-5 border border-stone-150 space-y-3 text-sm font-sans">
          <div className="flex justify-between">
            <span className="text-stone-500">Order Number</span>
            <span className="font-semibold text-stone-900 font-mono">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Customer</span>
            <span className="font-medium text-stone-900">
              {typeof order.shippingAddress === "object" && order.shippingAddress !== null
                ? (order.shippingAddress as any).fullName || "N/A"
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Amount Due</span>
            <span className="font-bold text-amber-700">{formatPrice(order.total.toString())}</span>
          </div>
        </div>

        <PayfastSimulatorClient
          orderId={order.id}
          orderNumber={order.orderNumber}
          amount={order.total.toString()}
        />
      </div>
    </div>
  );
}
