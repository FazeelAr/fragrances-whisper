"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { placeOrder } from "@/src/features/orders/actions";
import { formatPrice } from "@/src/lib/utils";
import { Loader2, CreditCard, Truck } from "lucide-react";

interface CheckoutFormProps {
  initialUser?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  totals: {
    subtotal: number;
    shipping: number;
    total: number;
  };
}

export default function CheckoutForm({ initialUser, totals }: CheckoutFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"PAYFAST" | "COD" | "WHATSAPP">("WHATSAPP");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      fullName: fd.get("fullName") as string,
      email: fd.get("email") as string,
      phone: fd.get("phone") as string,
      address: fd.get("address") as string,
      city: fd.get("city") as string,
      paymentMethod,
    };

    startTransition(async () => {
      const result = await placeOrder(payload);
      if (!result.success) {
        setError(result.error || "Failed to place order.");
      } else if (result.redirectUrl) {
        router.push(result.redirectUrl);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Shipping details */}
      <div className="lg:col-span-2 space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-6 space-y-4">
          <h2 className="font-serif text-lg font-medium text-stone-900 border-b border-stone-100 pb-3">
            Shipping Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="fullName">
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                defaultValue={initialUser?.name || ""}
                className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="email">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={initialUser?.email || ""}
                className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="phone">
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                defaultValue={initialUser?.phone || ""}
                className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
                placeholder="03001234567"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="city">
                City *
              </label>
              <input
                id="city"
                name="city"
                type="text"
                required
                className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
                placeholder="e.g. Lahore, Karachi, Islamabad"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="address">
              Street Address *
            </label>
            <input
              id="address"
              name="address"
              type="text"
              required
              className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none"
              placeholder="House #, Street name, Sector/Area"
            />
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-6 space-y-4">
          <h2 className="font-serif text-lg font-medium text-stone-900 border-b border-stone-100 pb-3">
            Payment Method
          </h2>

          <div className="rounded-lg border border-amber-200 bg-amber-50/20 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-md bg-amber-100 text-amber-800 flex-shrink-0 mt-0.5">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-stone-900">Bank Transfer (WhatsApp Verification)</p>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  Transfer the order amount to our bank account. On the next page, you will get our bank details and a direct link to send the payment screenshot & order details on WhatsApp to confirm your order.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary column */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-6 space-y-4 sticky top-24">
          <h2 className="font-serif text-lg font-medium text-stone-900 border-b border-stone-100 pb-3">
            Summary
          </h2>

          <div className="space-y-3 font-sans text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span className="font-medium">{formatPrice(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Shipping</span>
              {totals.shipping === 0 ? (
                <span className="text-green-600 font-semibold">FREE</span>
              ) : (
                <span className="font-medium">{formatPrice(totals.shipping)}</span>
              )}
            </div>
            <div className="border-t border-stone-100 pt-3 flex justify-between font-bold text-stone-900 text-base">
              <span>Total</span>
              <span>{formatPrice(totals.total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-800 transition-colors shadow-md disabled:opacity-60"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending
              ? "Placing Order..."
              : "Place Order & Pay via WhatsApp"}
          </button>
        </div>
      </div>
    </form>
  );
}
