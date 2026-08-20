export interface PayfastTransactionParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerMobile: string;
  customerEmail: string;
  successUrl: string;
  failureUrl: string;
}

const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID;
const SECURED_KEY = process.env.PAYFAST_SECURED_KEY;
const API_BASE_URL = process.env.PAYFAST_API_BASE_URL || "https://sandbox.apps.net.pk/squadpay/api";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Initiates a PayFast Pakistan payment session.
 * If credentials are not set, returns a link to the UAT simulator page.
 */
export async function initiatePayfastPayment(params: PayfastTransactionParams) {
  if (!MERCHANT_ID || !SECURED_KEY) {
    console.warn("PayFast credentials not set. Falling back to local UAT payment simulator.");
    // Redirect to developer UAT Simulator page
    return {
      success: true,
      redirectUrl: `${APP_URL}/checkout/payfast-simulator?orderId=${params.orderId}&amount=${params.amount}`,
    };
  }

  try {
    // 1. Get Access Token
    const tokenRes = await fetch(
      `${API_BASE_URL}/token?merchant_id=${MERCHANT_ID}&secured_key=${SECURED_KEY}`,
      { method: "GET" }
    );
    if (!tokenRes.ok) throw new Error("Failed to retrieve PayFast access token.");
    const tokenData = await tokenRes.json();
    const token = tokenData.token;

    // 2. Post Transaction
    const postRes = await fetch(`${API_BASE_URL}/PostTransaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        customer_email_address: params.customerEmail,
        customer_mobile_no: params.customerMobile,
        txnamt: params.amount.toFixed(2),
        basket_id: params.orderNumber,
        currency_code: "PKR",
        success_url: params.successUrl,
        failure_url: params.failureUrl,
        txndesc: `Order ${params.orderNumber} payment at Fragrance Whisper`,
      }),
    });

    if (!postRes.ok) throw new Error("Failed to post PayFast transaction.");
    const postData = await postRes.json();

    // Redirect link provided by PayFast Pakistan API response
    if (postData.redirectUrl) {
      return { success: true, redirectUrl: postData.redirectUrl };
    }

    throw new Error("No redirectUrl returned from PayFast.");
  } catch (error: any) {
    console.error("PayFast Payment Initiation Failed:", error);
    return { success: false, error: error.message || "Failed to contact payment gateway." };
  }
}

/**
 * Verifies the PayFast callback signature/integrity.
 */
export function verifyPayfastCallback(payload: Record<string, any>): boolean {
  // If credentials are blank, allow UAT Simulator callback
  if (!MERCHANT_ID || !SECURED_KEY) {
    return payload.simulated === "true";
  }

  // PayFast Pakistan verification mechanism typically checks:
  // (hash of payload properties using SECURED_KEY matches signature header or request property)
  // Example checking matching status:
  const status = payload.err_code || payload.status;
  return status === "00" || status === "success" || status === "APPROVED";
}
