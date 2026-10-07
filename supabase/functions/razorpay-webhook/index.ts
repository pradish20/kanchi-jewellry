// Supabase Edge Function: razorpay-webhook
// Secure, idempotent webhook listener for asynchronous Razorpay transaction lifecycle updates

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

async function generateHmacSha256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");

    if (!supabaseUrl || !supabaseServiceKey || !webhookSecret) {
      console.error("Missing webhook environment configuration");
      return new Response("Server configuration incomplete", { status: 500 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return new Response("Missing signature header", { status: 400 });
    }

    // 1. Verify webhook signature
    const computedSignature = await generateHmacSha256(webhookSecret, rawBody);
    if (computedSignature !== signature) {
      console.error("Invalid webhook signature received");
      return new Response("Invalid signature", { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.event;
    // Razorpay event ID format e.g. payload.event_id or construct unique identifier
    const eventId = payload.event_id || `${payload.event}_${payload.payload?.payment?.entity?.id || payload.payload?.order?.entity?.id || Date.now()}`;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Idempotency Check: Don't process the same event twice
    const { data: existingLog } = await supabase
      .from("webhook_logs")
      .select("id")
      .eq("event_id", eventId)
      .single();

    if (existingLog) {
      console.log(`Event ${eventId} already processed. Returning 200 OK.`);
      return new Response(JSON.stringify({ status: "already_processed" }), { status: 200 });
    }

    // Record webhook event in webhook_logs
    await supabase.from("webhook_logs").insert({
      event_id: eventId,
      event_name: eventName,
      payload: payload,
    });

    // 3. Process event types
    if (eventName === "order.paid" || eventName === "payment.captured") {
      const razorpayOrderId =
        payload.payload?.order?.entity?.id ||
        payload.payload?.payment?.entity?.order_id;

      if (razorpayOrderId) {
        // Find corresponding order in database
        const { data: order } = await supabase
          .from("orders")
          .select("id, payment_status")
          .eq("razorpay_order_id", razorpayOrderId)
          .single();

        if (order && order.payment_status !== "PAID") {
          await supabase
            .from("orders")
            .update({
              payment_status: "PAID",
              order_status: "CONFIRMED",
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id);

          // Deduct stock if not already deducted
          const { data: orderItems } = await supabase
            .from("order_items")
            .select("product_id, quantity")
            .eq("order_id", order.id);

          if (orderItems) {
            for (const item of orderItems) {
              if (item.product_id) {
                await supabase.rpc("deduct_product_stock", {
                  p_product_id: item.product_id,
                  p_quantity: item.quantity,
                });
              }
            }
          }
        }
      }
    } else if (eventName === "payment.failed") {
      const razorpayOrderId = payload.payload?.payment?.entity?.order_id;
      if (razorpayOrderId) {
        await supabase
          .from("orders")
          .update({
            payment_status: "FAILED",
            updated_at: new Date().toISOString(),
          })
          .eq("razorpay_order_id", razorpayOrderId);
      }
    } else if (eventName === "refund.processed") {
      const razorpayOrderId = payload.payload?.payment?.entity?.order_id;
      if (razorpayOrderId) {
        await supabase
          .from("orders")
          .update({
            payment_status: "REFUNDED",
            updated_at: new Date().toISOString(),
          })
          .eq("razorpay_order_id", razorpayOrderId);
      }
    }

    return new Response(JSON.stringify({ status: "processed", event: eventName }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
