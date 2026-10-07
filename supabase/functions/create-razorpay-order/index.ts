// Supabase Edge Function: create-razorpay-order
// Follows Deno runtime standards for Supabase Functions
// Calculates authoritative total strictly from PostgreSQL database, creates pending order & Razorpay order

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItemInput {
  productId: string;
  quantity: number;
}

interface CustomerDetailsInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration missing: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(
        JSON.stringify({ error: "Server configuration missing: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { items, customer, userId } = await req.json() as {
      items: CartItemInput[];
      customer: CustomerDetailsInput;
      userId?: string;
    };

    if (!items || !items.length) {
      return new Response(
        JSON.stringify({ error: "Cart is empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address || !customer?.pincode) {
      return new Response(
        JSON.stringify({ error: "Incomplete shipping information provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize privileged admin client for server-authoritative pricing and order persistence
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch verified products directly from database
    const productIds = items.map((i) => i.productId);
    const { data: dbProducts, error: prodErr } = await supabase
      .from("products")
      .select("id, name, sku, price, discount_price, stock_quantity, is_active")
      .in("id", productIds);

    if (prodErr || !dbProducts) {
      return new Response(
        JSON.stringify({ error: "Failed to verify catalog items: " + prodErr?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Server-side calculation & stock check
    let subtotal = 0;
    let totalDiscount = 0;
    const verifiedOrderItems: Array<{
      product_id: string;
      product_name: string;
      product_sku: string;
      quantity: number;
      unit_price: number;
      discount_amount: number;
      subtotal: number;
    }> = [];

    for (const item of items) {
      const dbProd = dbProducts.find((p) => p.id === item.productId);
      if (!dbProd) {
        return new Response(
          JSON.stringify({ error: `Product ID ${item.productId} was not found in catalog` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!dbProd.is_active) {
        return new Response(
          JSON.stringify({ error: `Product "${dbProd.name}" is no longer active` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (dbProd.stock_quantity < item.quantity) {
        return new Response(
          JSON.stringify({
            error: `Insufficient stock for "${dbProd.name}". Available: ${dbProd.stock_quantity}, requested: ${item.quantity}`,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const regularPrice = Number(dbProd.price);
      const effectivePrice = dbProd.discount_price ? Number(dbProd.discount_price) : regularPrice;
      const discountPerUnit = regularPrice - effectivePrice;
      const lineSubtotal = effectivePrice * item.quantity;

      subtotal += regularPrice * item.quantity;
      totalDiscount += discountPerUnit * item.quantity;

      verifiedOrderItems.push({
        product_id: dbProd.id,
        product_name: dbProd.name,
        product_sku: dbProd.sku,
        quantity: item.quantity,
        unit_price: regularPrice,
        discount_amount: discountPerUnit * item.quantity,
        subtotal: lineSubtotal,
      });
    }

    // Server calculates shipping: free above ₹50,000, else ₹500
    const finalProductTotal = subtotal - totalDiscount;
    const shippingAmount = finalProductTotal >= 50000 ? 0 : 500;
    const authoritativeTotal = finalProductTotal + shippingAmount;

    // Create unique order number
    const timestamp = Date.now().toString().slice(-6);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `KJ-${timestamp}-${randomSuffix}`;

    // 1. Create Razorpay order first
    const rzpAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${rzpAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(authoritativeTotal * 100), // in paise
        currency: "INR",
        receipt: orderNumber,
        notes: {
          customer_email: customer.email,
          customer_name: customer.name,
        },
      }),
    });

    if (!rzpRes.ok) {
      const errText = await rzpRes.text();
      return new Response(
        JSON.stringify({ error: `Razorpay Order Creation Failed: ${errText}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rzpOrder = await rzpRes.json();

    // 2. Insert order in Supabase with pending status
    const { data: newOrder, error: orderInsertErr } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: userId || null,
        subtotal: subtotal,
        discount_amount: totalDiscount,
        shipping_amount: shippingAmount,
        total_amount: authoritativeTotal,
        currency: "INR",
        payment_status: "PENDING",
        order_status: "PENDING",
        shipping_name: customer.name,
        shipping_phone: customer.phone,
        shipping_email: customer.email,
        shipping_address: customer.address,
        shipping_city: customer.city,
        shipping_state: customer.state,
        shipping_pincode: customer.pincode,
        razorpay_order_id: rzpOrder.id,
      })
      .select("id")
      .single();

    if (orderInsertErr || !newOrder) {
      return new Response(
        JSON.stringify({ error: `Order persistence failed: ${orderInsertErr?.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Insert order items
    const orderItemsToInsert = verifiedOrderItems.map((item) => ({
      ...item,
      order_id: newOrder.id,
    }));

    const { error: itemsInsertErr } = await supabase.from("order_items").insert(orderItemsToInsert);
    if (itemsInsertErr) {
      console.error("Order items error:", itemsInsertErr);
    }

    // Return Razorpay order details and public key to frontend
    return new Response(
      JSON.stringify({
        orderId: newOrder.id,
        orderNumber: orderNumber,
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        keyId: razorpayKeyId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
