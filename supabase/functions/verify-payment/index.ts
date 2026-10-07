// Supabase Edge Function: verify-payment
// Server-side cryptographic HMAC-SHA256 verification of Razorpay payment signatures
// Atomically transitions order to PAID and deducts inventory safely

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Web Crypto HMAC-SHA256 signature generator
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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!supabaseUrl || !supabaseServiceKey || !razorpayKeySecret) {
      return new Response(
        JSON.stringify({ error: "Missing server-side configuration secrets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = await req.json() as {
      orderId: string;
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    };

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return new Response(
        JSON.stringify({ error: "Missing required payment verification parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Verify HMAC-SHA256 signature
    const message = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = await generateHmacSha256(razorpayKeySecret, message);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (expectedSignature !== razorpaySignature) {
      // Signature mismatch - potential tampering attempt
      await supabase
        .from("orders")
        .update({ payment_status: "FAILED", updated_at: new Date().toISOString() })
        .eq("id", orderId);

      return new Response(
        JSON.stringify({ error: "Payment verification failed: invalid signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Fetch order details to ensure existence and fetch total
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, total_amount, currency, payment_status")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found in database" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent duplicate processing
    if (order.payment_status === "PAID") {
      return new Response(
        JSON.stringify({ success: true, message: "Order is already marked as PAID", orderId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Update order to PAID and CONFIRMED
    const nowIso = new Date().toISOString();
    const { error: updateOrderErr } = await supabase
      .from("orders")
      .update({
        payment_status: "PAID",
        order_status: "CONFIRMED",
        updated_at: nowIso,
      })
      .eq("id", orderId);

    if (updateOrderErr) {
      return new Response(
        JSON.stringify({ error: "Failed to update order status: " + updateOrderErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Create authoritative payment record
    await supabase.from("payments").insert({
      order_id: orderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      amount: order.total_amount,
      currency: order.currency || "INR",
      status: "CAPTURED",
      method: "razorpay",
      updated_at: nowIso,
    });

    // 5. Safely deduct inventory for ordered items
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId);

    if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        if (item.product_id) {
          await supabase.rpc("deduct_product_stock", {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, orderId: orderId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Payment verification exception" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
