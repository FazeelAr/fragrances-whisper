"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface SimulatorClientProps {
  orderId: string;
  orderNumber: string;
  amount: string;
}

export default function PayfastSimulatorClient({ orderId, orderNumber, amount }: SimulatorClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSimulateSuccess = () => {
    setError(null);
    startTransition(async () => {
      try {
        // Trigger server-to-server webhook callback
        const response = await fetch("/api/webhooks/payfast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            simulated: "true",
            status: "success",
            err_code: "00",
            orderId,
            orderNumber,
            amount,
            transactionId: `TXN-SIM-${Date.now()}`,
          }),
        });

        if (!response.ok) {
          throw new Error("Webhook processing failed.");
        }

        // Webhook processed successfully, redirect client to storefront success page
        router.push(`/checkout/success?orderNumber=${orderNumber}`);
      } catch (err: any) {
        setError(err.message || "Failed to trigger webhook simulator.");
      }
    });
  };

  const handleSimulateCancel = () => {
    // Direct cancel redirect
    router.push(`/checkout/cancel?orderNumber=${orderNumber}`);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleSimulateSuccess}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 rounded-md bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-850 transition-colors shadow-md disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-green-400" />
        )}
        Simulate Successful Payment
      </button>

      <button
        onClick={handleSimulateCancel}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-60"
      >
        <XCircle className="h-4 w-4 text-red-400" />
        Simulate Canceled Payment
      </button>
    </div>
  );
}
