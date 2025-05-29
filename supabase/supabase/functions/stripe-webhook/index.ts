
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

// Set up CORS headers for the webhook
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Get the Stripe webhook secret
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeWebhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get the request body as text
    const body = await req.text();
    
    // Get the Stripe signature from the request headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No signature found in request");
    }

    // Verify the signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook signature verification failed: ${err.message}`, { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle specific event types
    console.log(`Processing webhook event: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const customerId = session.customer;
      
      // Extract tier from metadata and validate it
      const tierFromMetadata = session.metadata?.tier || "sopify-business"; // Default fallback
      
      // Validate that tier is one of the expected values
      const validTiers = ["sop-essentials", "sopify-business", "free"];
      const tier = validTiers.includes(tierFromMetadata) ? tierFromMetadata : "sopify-business";
      
      if (!customerId) {
        throw new Error("No customer ID found in checkout session");
      }

      console.log(`Checkout completed for customer: ${customerId}, tier: ${tier}`);
      
      // Find the subscription associated with this customer
      const { data: subscriptionData, error: subscriptionError } = await supabaseClient
        .from("subscriptions")
        .select("*")
        .eq("stripe_customer_id", customerId)
        .single();

      if (subscriptionError && subscriptionError.code !== "PGRST116") { // PGRST116 is "no rows found"
        throw subscriptionError;
      }

      if (!subscriptionData) {
        console.log(`No subscription found for customer ID: ${customerId}, attempting to find by email`);
        
        // Try to find the customer's email to match with our user
        const customer = await stripe.customers.retrieve(customerId.toString());
        
        if (customer.deleted) {
          throw new Error("Customer was deleted");
        }
        
        const customerEmail = customer.email;
        if (!customerEmail) {
          throw new Error("Customer has no email");
        }

        // Find the user by email
        const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers();
        
        if (userError) {
          throw userError;
        }

        // Find the user with matching email
        const user = userData.users.find(u => u.email === customerEmail);
        
        if (!user) {
          throw new Error(`No user found with email: ${customerEmail}`);
        }

        // Create or update the subscription with the correct tier
        const { error: upsertError } = await supabaseClient
          .from("subscriptions")
          .upsert({
            user_id: user.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: session.subscription,
            status: "active",
            tier: tier,
            updated_at: new Date().toISOString()
          });

        if (upsertError) {
          throw upsertError;
        }
        
        console.log(`Created new subscription for user ${user.id} with customer ID ${customerId} and tier ${tier}`);
      } else {
        // Update the existing subscription with the correct tier
        const { error: updateError } = await supabaseClient
          .from("subscriptions")
          .update({
            stripe_subscription_id: session.subscription,
            status: "active",
            tier: tier,
            updated_at: new Date().toISOString()
          })
          .eq("stripe_customer_id", customerId);

        if (updateError) {
          throw updateError;
        }
        
        console.log(`Updated subscription for customer ID ${customerId} to active ${tier} status`);
      }
    }

    // Handle subscription updated or deleted event
    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const status = subscription.status;

      // For subscription updates, we want to preserve the tier if possible
      if (event.type === "customer.subscription.updated" && status === "active") {
        // Try to get the current tier from the subscription metadata
        const tierFromMetadata = subscription.metadata?.tier;
        
        if (tierFromMetadata && ["sop-essentials", "sopify-business"].includes(tierFromMetadata)) {
          // We found a valid tier in the metadata
          const { error: updateError } = await supabaseClient
            .from("subscriptions")
            .update({
              status: "active",
              tier: tierFromMetadata,
              updated_at: new Date().toISOString()
            })
            .eq("stripe_customer_id", customerId);
            
          if (updateError) {
            throw updateError;
          }
          
          console.log(`Updated subscription status for customer ${customerId} to ${status} with tier ${tierFromMetadata}`);
          
          return new Response(JSON.stringify({ received: true }), { 
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      }
      
      // Default update (status only, preserve existing tier)
      const { error: updateError } = await supabaseClient
        .from("subscriptions")
        .update({
          status: status === "active" ? "active" : "inactive", 
          updated_at: new Date().toISOString()
        })
        .eq("stripe_customer_id", customerId);

      if (updateError) {
        throw updateError;
      }
      
      console.log(`Updated subscription status for customer ${customerId} to ${status}`);
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
