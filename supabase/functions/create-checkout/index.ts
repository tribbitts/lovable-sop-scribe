
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Updated price ID mapping for new subscription tiers
const PRICE_ID_MAP = {
  'sop-essentials': 'price_1RSoc8KdlDHwo16BCMoXLuhI',
  'sopify-business': 'price_1RSocWKdlDHwo16BpnMc4LKG',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    console.log("Starting checkout process");
    
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify the user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    if (error || !user) {
      console.error("Authentication error:", error);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    console.log(`Authenticated user: ${user.email}`);

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("Missing STRIPE_SECRET_KEY");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Parse request body
    const requestData = await req.json();
    const tier = requestData.tier || "sopify-business";
    
    // Validate tier and get corresponding price ID
    const priceId = PRICE_ID_MAP[tier];
    if (!priceId) {
      console.error(`Invalid tier: ${tier}`);
      return new Response(
        JSON.stringify({ error: `Invalid tier: ${tier}. Valid tiers are: ${Object.keys(PRICE_ID_MAP).join(', ')}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Creating checkout session for tier: ${tier} with price ID: ${priceId}`);

    // Check if user already has a Stripe customer ID
    const { data: subscriptionData } = await supabaseClient
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = subscriptionData?.stripe_customer_id;

    // If no customer ID exists, create one
    if (!customerId) {
      console.log("No customer ID found, creating new customer");
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
      console.log(`Created new customer with ID: ${customerId}`);

      // Save the customer ID
      await supabaseClient
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          tier: "free",
          status: "inactive",
          updated_at: new Date().toISOString(),
        });
    }

    // Create checkout session with the correct price ID
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/app?success=true&tier=${tier}`,
      cancel_url: `${req.headers.get("origin")}/app?canceled=true`,
      metadata: {
        tier: tier,
        user_id: user.id,
      },
    });

    console.log(`Checkout session created: ${session.id}`);

    // Return the checkout URL
    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
