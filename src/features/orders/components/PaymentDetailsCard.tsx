"use client";

import { useState } from "react";
import {
  BANK_NAME,
  BANK_ACCOUNT_TITLE,
  BANK_ACCOUNT_NUMBER,
  BANK_IBAN,
  EASYPAISA_NUMBER,
  EASYPAISA_TITLE,
  WHATSAPP_NUMBER,
  WHATSAPP_DISPLAY,
  STORE_NAME,
} from "@/src/lib/constants";
import { Building2, Smartphone, Copy, Check, ExternalLink, ShieldCheck } from "lucide-react";

interface PaymentDetailsCardProps {
  orderNumber: string;
  totalFormatted: string;
  rawTotal: number;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  items: Array<{ name: string; quantity: number }>;
}

export default function PaymentDetailsCard({
  orderNumber,
  totalFormatted,
  rawTotal,
  customerName,
  customerPhone,
  shippingAddress,
  items,
}: PaymentDetailsCardProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const itemsListText = items
    .map((item) => `• ${item.name} (x${item.quantity})`)
    .join("\n");

  const whatsappMessage = `Hello ${STORE_NAME},

I have transferred the payment for my order. Here are the details:

*Order Number:* ${orderNumber}
*Customer:* ${customerName}
*Total Amount:* PKR ${rawTotal.toLocaleString()}
*Phone:* ${customerPhone}
*Shipping Address:* ${shippingAddress}

*Items:*
${itemsListText}

[I have attached the screenshot of my transfer receipt below]`;

  const formattedWhatsAppNumber = WHATSAPP_NUMBER.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${formattedWhatsAppNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="space-y-6 pt-1">
      {/* Notice Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-4 text-xs font-sans text-stone-700 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-amber-900 uppercase tracking-wide">
          <ShieldCheck className="h-4 w-4 text-amber-700" />
          <span>Payment Instructions</span>
        </div>
        <p className="leading-relaxed">
          Please transfer the total amount of{" "}
          <strong className="text-stone-900 font-semibold">{totalFormatted}</strong> using either{" "}
          <strong>Allied Bank</strong> or <strong>Easypaisa</strong>, then share your payment receipt on WhatsApp to confirm your order.
        </p>
      </div>

      {/* Payment Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option 1: Allied Bank */}
        <div className="bg-stone-50/80 border border-stone-200/80 rounded-xl p-4 flex flex-col justify-between space-y-3 relative hover:border-amber-400/60 transition-colors">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                    {BANK_NAME}
                  </h4>
                  <span className="text-[10px] text-stone-500">Bank Transfer</span>
                </div>
              </div>
              <span className="text-[10px] bg-blue-100/80 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                Direct ABL
              </span>
            </div>

            <div className="space-y-2 text-xs font-sans">
              <div>
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
                  Account Title
                </span>
                <span className="font-semibold text-stone-900">{BANK_ACCOUNT_TITLE}</span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider">
                    Account Number
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy("bank_acc", BANK_ACCOUNT_NUMBER)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 hover:text-amber-800"
                  >
                    {copiedKey === "bank_acc" ? (
                      <>
                        <Check className="h-3 w-3 text-green-600" />
                        <span className="text-green-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <span className="font-mono font-bold text-stone-900 text-xs block bg-white px-2 py-1 rounded border border-stone-200/60 mt-0.5 select-all">
                  {BANK_ACCOUNT_NUMBER}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider">IBAN</span>
                  <button
                    type="button"
                    onClick={() => handleCopy("bank_iban", BANK_IBAN)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 hover:text-amber-800"
                  >
                    {copiedKey === "bank_iban" ? (
                      <>
                        <Check className="h-3 w-3 text-green-600" />
                        <span className="text-green-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <span className="font-mono font-bold text-stone-900 text-[11px] block bg-white px-2 py-1 rounded border border-stone-200/60 mt-0.5 select-all break-all">
                  {BANK_IBAN}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Option 2: Easypaisa */}
        <div className="bg-stone-50/80 border border-stone-200/80 rounded-xl p-4 flex flex-col justify-between space-y-3 relative hover:border-emerald-400/60 transition-colors">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                    Easypaisa
                  </h4>
                  <span className="text-[10px] text-stone-500">Mobile Wallet</span>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-100/80 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                Instant Wallet
              </span>
            </div>

            <div className="space-y-2 text-xs font-sans">
              <div>
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
                  Account Title
                </span>
                <span className="font-semibold text-stone-900">{EASYPAISA_TITLE}</span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider">
                    Easypaisa Mobile Number
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy("easypaisa", EASYPAISA_NUMBER)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-800"
                  >
                    {copiedKey === "easypaisa" ? (
                      <>
                        <Check className="h-3 w-3 text-green-600" />
                        <span className="text-green-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <span className="font-mono font-bold text-stone-900 text-sm block bg-white px-2 py-1.5 rounded border border-stone-200/60 mt-0.5 select-all text-emerald-900">
                  {EASYPAISA_NUMBER}
                </span>
              </div>

              <div className="pt-2 text-[11px] text-stone-500 leading-normal">
                Send via Easypaisa App or *786# to mobile account number above.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Action Section */}
      <div className="space-y-3 pt-2 text-center">
        <div className="space-y-1">
          <p className="text-xs font-medium text-stone-700 font-sans">
            Have you completed the transfer?
          </p>
          <p className="text-[11px] text-stone-500 font-sans">
            Click below to send your transfer screenshot to WhatsApp (
            <span className="font-semibold text-stone-700">{WHATSAPP_DISPLAY}</span>).
          </p>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-6 py-3.5 text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.989 3.637 1.51 5.353 1.512 5.464 0 9.91-4.444 9.913-9.913.002-2.65-1.02-5.14-2.877-6.998C17.18 1.895 14.69 1.872 12.01 1.872c-5.467 0-9.913 4.446-9.916 9.913-.001 1.907.493 3.77 1.42 5.41l-.995 3.637 3.528-.928zM17.586 14.39c-.3-.149-1.777-.878-2.05-.976-.272-.1-.47-.149-.667.149-.198.298-.767.977-.94 1.175-.173.197-.347.223-.647.075-.3-.149-1.266-.466-2.41-1.487-.89-.794-1.49-1.775-1.665-2.073-.173-.299-.018-.46.131-.609.135-.133.3-.347.449-.52.149-.174.198-.298.298-.497.1-.2.05-.373-.025-.52-.075-.149-.667-1.61-.915-2.203-.24-.579-.486-.5-.667-.51-.173-.008-.371-.01-.57-.01-.197 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.778-.726 2.025-1.429.247-.702.247-1.306.173-1.429-.074-.124-.272-.198-.57-.347z"/>
          </svg>
          <span>Send Payment Receipt on WhatsApp</span>
          <ExternalLink className="h-4 w-4 ml-1 opacity-80" />
        </a>
      </div>
    </div>
  );
}
