/**
 * Supabase Edge Function: send-whatsapp-order
 * Sends order confirmation via WhatsApp Cloud API when an order is placed.
 *
 * Triggers:
 * - Supabase database webhook on `orders` table INSERT
 * - Or called directly from Cloudflare Worker after Stripe success
 *
 * Required environment variables (set in Supabase Dashboard → Edge Functions):
 * - WHATSAPP_ACCESS_TOKEN: Meta WhatsApp Cloud API access token
 * - WHATSAPP_PHONE_NUMBER_ID: Your WhatsApp Business Account phone number ID
 * - WHATSAPP_TEMPLATE_NAME: Template name approved in Meta (e.g., "order_confirmation")
 * - WHATSAPP_TEMPLATE_LANGUAGE: Language code (e.g., "en_US")
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppOrderPayload {
  reference: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_emirate: string;
  payment_method: string;
  currency: string;
  total_aed: number;
  items_json: Array<{
    product_id: string;
    name: string;
    quantity: number;
    size: string;
    price?: number;
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: WhatsAppOrderPayload = await req.json();

    // Validate required fields
    if (!payload.reference || !payload.customer_phone || !payload.items_json?.length) {
      return new Response(
        JSON.stringify({ error: "Missing required order fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get WhatsApp credentials from environment
    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const templateName = Deno.env.get("WHATSAPP_TEMPLATE_NAME") || "order_confirmation";
    const templateLanguage = Deno.env.get("WHATSAPP_TEMPLATE_LANGUAGE") || "en_US";

    if (!accessToken || !phoneNumberId) {
      console.error("[WhatsApp] Missing credentials - check Supabase Edge Function env vars");
      return new Response(
        JSON.stringify({ error: "WhatsApp credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format phone number for WhatsApp (remove + and spaces)
    const formattedPhone = payload.customer_phone.replace(/[^0-9]/g, "");
    const whatsappPhone = formattedPhone.startsWith("971") ? formattedPhone : `971${formattedPhone}`;

    // Build items summary
    const itemsSummary = payload.items_json
      .map((item) => `• ${item.name} (Size: ${item.size}) × ${item.quantity}`)
      .join("\n");

    // Send via WhatsApp Cloud API using template
    const whatsappUrl = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

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
                { type: "text", text: payload.customer_name.split(" ")[0] }, // First name
                { type: "text", text: payload.reference }, // Order reference
                { type: "text", text: `${payload.currency} ${payload.total_aed.toLocaleString()}` }, // Total
                { type: "text", text: payload.payment_method }, // Payment method
                { type: "text", text: payload.customer_emirate }, // Emirate
                { type: "text", text: itemsSummary }, // Items list
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
      return new Response(
        JSON.stringify({ error: "Failed to send WhatsApp", details: result }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[WhatsApp] Message sent:", result);
    return new Response(
      JSON.stringify({ success: true, messageId: result.messages?.[0]?.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[WhatsApp] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});