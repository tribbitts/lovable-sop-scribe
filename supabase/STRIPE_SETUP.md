
# Stripe Integration Setup Guide

## Overview
This guide will help you connect your 2 Stripe products to your SOPify application's subscription tiers.

## Step 1: Get Your Stripe Price IDs

In your Stripe Dashboard:

1. Go to **Products** → **Pricing**
2. Find your 2 products and copy their **Price IDs** (they start with `price_`)

You should have:
- **SOP Essentials** product → Price ID: `price_1RSoc8KdlDHwo16BCMoXLuhI`
- **SOPify Business** product → Price ID: `price_1RSocWKdlDHwo16BpnMc4LKG`

## Step 2: Set Environment Variables in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **Edge Functions**
3. Update these environment variables:

```bash
# Remove old variables if they exist:
# STRIPE_PRO_PDF_PRICE_ID
# STRIPE_PRO_HTML_PRICE_ID  
# STRIPE_PRO_COMPLETE_PRICE_ID

# Add new variables:
STRIPE_SOP_ESSENTIALS_PRICE_ID=price_1RSoc8KdlDHwo16BCMoXLuhI
STRIPE_SOPIFY_BUSINESS_PRICE_ID=price_1RSocWKdlDHwo16BpnMc4LKG
```

## Step 3: Verify Webhook Configuration

Ensure your Stripe webhook is configured to send these events to your Supabase edge function:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Webhook URL should be: `https://your-project.supabase.co/functions/v1/stripe-webhook`

## Step 4: Test the Integration

1. Deploy your edge functions:
   ```bash
   supabase functions deploy stripe-webhook
   supabase functions deploy create-checkout
   ```

2. Test each subscription tier by clicking the pricing buttons on your site

## Subscription Tier Mapping

The system now supports these tiers:

| UI Tier | Database Value | Price | Features |
|---------|----------------|-------|----------|
| Free | `free` | $0/month | Basic PDF exports (1/day) |
| SOP Essentials | `sop-essentials` | $25/month | Unlimited PDF exports + basic training |
| SOPify Business | `sopify-business` | $75/month | All features + interactive training |

## Troubleshooting

1. **Check Supabase Edge Function Logs**: Go to your Supabase dashboard → Edge Functions to see any errors
2. **Verify Price IDs**: Make sure the price IDs in your environment variables match exactly with Stripe
3. **Test Webhooks**: Use Stripe's webhook testing tool to verify events are being processed

## Environment Variables Reference

```bash
# Required Stripe configuration
STRIPE_SECRET_KEY=sk_live_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Your webhook signing secret

# New price ID variables
STRIPE_SOP_ESSENTIALS_PRICE_ID=price_1RSoc8KdlDHwo16BCMoXLuhI
STRIPE_SOPIFY_BUSINESS_PRICE_ID=price_1RSocWKdlDHwo16BpnMc4LKG

# Supabase configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## What Changed

1. **Updated tier names**: "Pro" → "SOP Essentials" ($25), "Pro Learning" → "SOPify Business" ($75)
2. **New price IDs**: Updated to use the new Stripe product price IDs
3. **Simplified tiers**: Reduced from 3 paid tiers to 2 paid tiers
4. **Price mapping**: Direct mapping between Stripe price IDs and database tier values
5. **Frontend compatibility**: Internal mapping ensures UI continues to work with existing tier structure

Your subscription system should now work with the new pricing structure! 🎉 
