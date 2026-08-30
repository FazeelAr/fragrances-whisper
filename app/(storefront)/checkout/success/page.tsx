import Link from "next/link";
import { CheckCircle, ArrowRight, ClipboardCopy } from "lucide-react";
import { STORE_NAME } from "@/src/lib/constants";
import { db } from "@/src/lib/db";
import { WHATSAPP_NUMBER, BANK_NAME, BANK_ACCOUNT_TITLE, BANK_ACCOUNT_NUMBER, BANK_IBAN } from "@/src/lib/constants";
import { formatPrice } from "@/src/lib/utils";

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

  const isWhatsAppPayment = order?.paymentMethod === "WHATSAPP";

  let whatsappUrl = "";
  if (order) {
    const itemsText = order.items
      .map((item) => `- ${item.productName} (x${item.quantity})`)
      .join("\n");
    const message = `Hello ${STORE_NAME},

I have transferred the payment for my order. Here are the details:

*Order Number:* ${order.orderNumber}
*Customer:* ${order.shippingAddress && typeof order.shippingAddress === "object" ? (order.shippingAddress as any).fullName : "Guest"}
*Total Amount:* PKR ${Number(order.total).toLocaleString()}
*Phone:* ${order.phone}
*Shipping Address:* ${order.shippingAddress && typeof order.shippingAddress === "object" ? `${(order.shippingAddress as any).address}, ${(order.shippingAddress as any).city}` : ""}

*Items:*
${itemsText}

[I have attached the screenshot of my transfer receipt below]`;

    const formattedWhatsAppNumber = WHATSAPP_NUMBER.replace(/[^0-9]/g, "");
    whatsappUrl = `https://wa.me/${formattedWhatsAppNumber}?text=${encodeURIComponent(message)}`;
  }

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 bg-stone-50/50">
      <div className="w-full max-w-xl bg-white p-8 border border-stone-100 rounded-xl shadow-sm space-y-6">
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
        <div className="bg-stone-50 rounded-lg p-5 border border-stone-100 space-y-4">
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
                {order ? formatPrice(order.total.toString()) : "Calculating..."}
              </span>
            </div>
          </div>

          {isWhatsAppPayment && (
            <div className="space-y-3 pt-1">
              <div className="bg-amber-50/40 border border-amber-200/60 rounded-md p-4 space-y-3">
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Bank Transfer Details
                </h3>
                <p className="text-xs text-stone-600 font-sans leading-relaxed">
                  Please transfer the total amount of <strong className="text-stone-900">{order ? formatPrice(order.total.toString()) : ""}</strong> to the bank account below:
                </p>
                <div className="grid grid-cols-1 gap-2 text-xs font-sans text-stone-800 pt-1">
                  <div className="flex justify-between py-1 border-b border-stone-200/50">
                    <span className="text-stone-500">Bank Name</span>
                    <span className="font-semibold">{BANK_NAME}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-200/50">
                    <span className="text-stone-500">Account Title</span>
                    <span className="font-semibold">{BANK_ACCOUNT_TITLE}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-200/50">
                    <span className="text-stone-500">Account Number</span>
                    <span className="font-semibold font-mono">{BANK_ACCOUNT_NUMBER}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-stone-500">IBAN</span>
                    <span className="font-semibold font-mono text-[11px]">{BANK_IBAN}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-xs text-stone-500 leading-relaxed font-sans text-center">
                  Once you have made the bank transfer, click the button below to send your payment screenshot/receipt and order details to our WhatsApp number.
                </p>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-6 py-3 text-sm font-semibold text-white transition-colors shadow-md mt-4"
                  >
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.989 3.637 1.51 5.353 1.512 5.464 0 9.91-4.444 9.913-9.913.002-2.65-1.02-5.14-2.877-6.998C17.18 1.895 14.69 1.872 12.01 1.872c-5.467 0-9.913 4.446-9.916 9.913-.001 1.907.493 3.77 1.42 5.41l-.995 3.637 3.528-.928zM17.586 14.39c-.3-.149-1.777-.878-2.05-.976-.272-.1-.47-.149-.667.149-.198.298-.767.977-.94 1.175-.173.197-.347.223-.647.075-.3-.149-1.266-.466-2.41-1.487-.89-.794-1.49-1.775-1.665-2.073-.173-.299-.018-.46.131-.609.135-.133.3-.347.449-.52.149-.174.198-.298.298-.497.1-.2.05-.373-.025-.52-.075-.149-.667-1.61-.915-2.203-.24-.579-.486-.5-.667-.51-.173-.008-.371-.01-.57-.01-.197 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.778-.726 2.025-1.429.247-.702.247-1.306.173-1.429-.074-.124-.272-.198-.57-.347z"/>
                    </svg>
                    I have paid, send order on WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 flex flex-col gap-2">
          <Link
            href="/products"
            className="w-full flex items-center justify-center gap-2 rounded-md bg-stone-900 hover:bg-stone-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm"
          >
            Continue Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

