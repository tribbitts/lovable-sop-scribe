# Stripe Integration Setup Guide

## Overview
This guide will help you connect your 3 Stripe products to your SOP application's subscription tiers.

## Step 1: Get Your Stripe Price IDs

In your Stripe Dashboard:

1. Go to **Products** → **Pricing**
2. Find your 3 products and copy their **Price IDs** (they start with `price_`)

You should have:
- **Pro PDF** product → Price ID (e.g., `price_1Abc123...`)
- **Pro HTML** product → Price ID (e.g., `price_1Def456...`) 
- **Pro Complete** product → Price ID (e.g., `price_1Ghi789...`)

## Step 2: Set Environment Variables in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **Edge Functions**
3. Add these environment variables:

```bash
STRIPE_PRO_PDF_PRICE_ID=price_your_pro_pdf_price_id_here
STRIPE_PRO_HTML_PRICE_ID=price_your_pro_html_price_id_here  
STRIPE_PRO_COMPLETE_PRICE_ID=price_your_pro_complete_price_id_here
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

| UI Tier | Database Value | Features |
|---------|----------------|----------|
| Free | `free` | Basic PDF exports (1/day) |
| Pro PDF | `pro-pdf` | Unlimited PDF exports |
| Pro HTML | `pro-html` | HTML exports + progress tracking |
| Pro Complete | `pro-complete` | All features |

## Troubleshooting

1. **Check Supabase Edge Function Logs**: Go to your Supabase dashboard → Edge Functions to see any errors
2. **Verify Price IDs**: Make sure the price IDs in your environment variables match exactly with Stripe
3. **Test Webhooks**: Use Stripe's webhook testing tool to verify events are being processed

## Environment Variables Reference

```bash
# Required Stripe configuration
STRIPE_SECRET_KEY=sk_live_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Your webhook signing secret

# New price ID variables (add these)
STRIPE_PRO_PDF_PRICE_ID=price_...
STRIPE_PRO_HTML_PRICE_ID=price_...
STRIPE_PRO_COMPLETE_PRICE_ID=price_...

# Supabase configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## What Changed

1. **create-checkout function**: Now accepts a `tier` parameter and maps it to the correct Stripe price ID
2. **stripe-webhook function**: Extracts tier information from checkout session metadata and assigns correct subscription tier
3. **Pricing component**: Already sends the correct tier when calling the checkout function

Your subscription system should now work with all 3 tiers! 🎉 