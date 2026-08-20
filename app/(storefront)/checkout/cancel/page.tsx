import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

interface CancelPageProps {
  searchParams: Promise<{
    orderNumber?: string;
  }>;
}

export default async function CancelPage({ searchParams }: CancelPageProps) {
  const resolvedParams = await searchParams;
  const orderNumber = resolvedParams.orderNumber || "FW-UNKNOWN";

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 bg-stone-50/50">
      <div className="w-full max-w-md text-center bg-white p-8 border border-stone-100 rounded-xl shadow-sm space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertCircle className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-serif text-stone-900 tracking-tight">Checkout Canceled</h1>
          <p className="text-sm text-stone-500 font-sans">
            Your transaction was not completed.
          </p>
        </div>

        <div className="bg-stone-50 rounded-lg p-4 font-mono text-sm border border-stone-100 flex flex-col items-center">
          <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider block mb-1">
            Order Reference
          </span>
          <span className="text-stone-800 font-semibold">{orderNumber}</span>
        </div>

        <p className="text-xs text-stone-500 font-sans leading-relaxed max-w-xs mx-auto">
          No charges were made to your account. You can return to your cart to change your payment method or try again.
        </p>

        <div className="pt-4 flex flex-col gap-2">
          <Link
            href="/cart"
            className="w-full flex items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 transition-colors shadow-md"
          >
            Return to Cart
          </Link>
          <Link
            href="/products"
            className="w-full flex items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Browse Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
