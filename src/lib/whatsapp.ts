/**
 * WhatsApp Integration for Cloudflare Worker
 *
 * This module can be used to send WhatsApp notifications from the Worker
 * (e.g., after Stripe webhook confirms payment).
 *
 * Requires environment variables (set via `wrangler secret put`):
 * - WHATSAPP_ACCESS_TOKEN: Meta WhatsApp Cloud API token
 * - WHATSAPP_PHONE_NUMBER_ID: Business Account phone number ID
 * - WHATSAPP_TEMPLATE_NAME: Approved template name (default: "order_confirmation")
 * - WHATSAPP_TEMPLATE_LANGUAGE: Language code (default: "en_US")
 */

export interface WhatsAppOrderPayload {
  reference: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_emirate: string;
  payment_method: string;
  currency: string;
  total_aed: number;
  items: Array<{
    product_id: string;
    name: string;
    quantity: number;
    size: string;
    price?: number;
  }>;
}

export async function sendWhatsAppOrderConfirmation(
  env: { WHATSAPP_ACCESS_TOKEN: string; WHATSAPP_PHONE_NUMBER_ID: string; WHATSAPP_TEMPLATE_NAME?: string; WHATSAPP_TEMPLATE_LANGUAGE?: string },
  payload: WhatsAppOrderPayload
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const accessToken = env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = env.WHATSAPP_TEMPLATE_NAME || "order_confirmation";
  const templateLanguage = env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US";

  if (!accessToken || !phoneNumberId) {
    console.warn("[WhatsApp] Credentials not configured — skipping notification");
    return { success: false, error: "WhatsApp credentials not configured" };
  }

  // Format phone number for WhatsApp
  const formattedPhone = payload.customer_phone.replace(/[^0-9]/g, "");
  const whatsappPhone = formattedPhone.startsWith("971") ? formattedPhone : `971${formattedPhone}`;

  // Build items summary
  const itemsSummary = payload.items
    .map((item) => `• ${item.name} (Size: ${item.size}) × ${item.quantity}`)
    .join("\n");

  // Send via WhatsApp Cloud API
  const whatsappUrl = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  try {
    const response = await fetch(whatsappUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: whatsappPhone,
        type: "template",
        template: {
          name: templateName,
          language: { code: templateLanguage },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: payload.customer_name.split(" ")[0] },
                { type: "text", text: payload.reference },
                { type: "text", text: `${payload.currency} ${payload.total_aed.toLocaleString()}` },
                { type: "text", text: payload.payment_method },
                { type: "text", text: payload.customer_emirate },
                { type: "text", text: itemsSummary },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [
                { type: "text", text: `https://sabarbysimran.ae/order/${payload.reference}` },
              ],
            },
          ],
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("[WhatsApp] API error:", result);
      return { success: false, error: result.error?.message || "Failed to send WhatsApp" };
    }

    console.log("[WhatsApp] Message sent:", result);
    return { success: true, messageId: result.messages?.[0]?.id };
  } catch (error) {
    console.error("[WhatsApp] Unexpected error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Alternative: Send a free-form text message (requires conversation window)
 * Only use if you have an active 24-hour customer care window.
 */
export async function sendWhatsAppFreeText(
  env: { WHATSAPP_ACCESS_TOKEN: string; WHATSAPP_PHONE_NUMBER_ID: string },
  to: string,
  body: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const accessToken = env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    return { success: false, error: "WhatsApp credentials not configured" };
  }

  const formattedPhone = to.replace(/[^0-9]/g, "");
  const whatsappPhone = formattedPhone.startsWith("971") ? formattedPhone : `971${formattedPhone}`;

  const whatsappUrl = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  try {
    const response = await fetch(whatsappUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: whatsappPhone,
        type: "text",
        text: { body },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error?.message || "Failed to send" };
    }

    return { success: true, messageId: result.messages?.[0]?.id };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}