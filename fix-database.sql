-- Fix Database Setup for SOP Scribe Admin Access
-- Run this in your Supabase SQL Editor

-- 1. Create admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create policy for admins table
CREATE POLICY "Admins can view admin records"
  ON public.admins
  FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.admins));

-- 2. Ensure tribbit@tribbit.gg has admin access
CREATE OR REPLACE FUNCTION public.ensure_tribbit_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tribbit_user_id uuid;
BEGIN
  -- Get the user ID for tribbit@tribbit.gg
  SELECT id INTO tribbit_user_id FROM auth.users WHERE email = 'tribbit@tribbit.gg';
  
  -- If the user exists, make sure they have an admin record
  IF tribbit_user_id IS NOT NULL THEN
    INSERT INTO public.admins (user_id)
    VALUES (tribbit_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Admin access granted to tribbit@tribbit.gg (ID: %)', tribbit_user_id;
  ELSE
    RAISE NOTICE 'User tribbit@tribbit.gg not found in auth.users table';
  END IF;
END;
$$;

-- Execute the function
SELECT ensure_tribbit_admin();

-- 3. Check current admin status
SELECT 
  u.email,
  u.id as user_id,
  CASE WHEN a.user_id IS NOT NULL THEN 'YES' ELSE 'NO' END as is_admin,
  u.created_at as user_created,
  a.created_at as admin_created
FROM auth.users u
LEFT JOIN public.admins a ON u.id = a.user_id
WHERE u.email IN ('tribbit@tribbit.gg', 'Onoki82@gmail.com')
ORDER BY u.email;

-- 4. Set pro-complete subscription for tribbit user (backup method)
CREATE OR REPLACE FUNCTION public.ensure_tribbit_subscription()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tribbit_user_id uuid;
BEGIN
  -- Get the user ID for tribbit@tribbit.gg
  SELECT id INTO tribbit_user_id FROM auth.users WHERE email = 'tribbit@tribbit.gg';
  
  -- If the user exists, ensure they have pro-complete subscription
  IF tribbit_user_id IS NOT NULL THEN
    INSERT INTO public.subscriptions (user_id, status, tier)
    VALUES (tribbit_user_id, 'active', 'pro-complete')
    ON CONFLICT (user_id) DO UPDATE SET
      status = 'active',
      tier = 'pro-complete',
      updated_at = now();
    
    RAISE NOTICE 'Pro-complete subscription granted to tribbit@tribbit.gg';
  END IF;
END;
$$;

-- Execute the subscription function
SELECT ensure_tribbit_subscription();

-- 5. Verify setup
SELECT 'ADMIN CHECK' as check_type, count(*) as count FROM public.admins;
SELECT 'SUBSCRIPTION CHECK' as check_type, count(*) as count FROM public.subscriptions WHERE tier = 'pro-complete';

-- Clean up functions
DROP FUNCTION IF EXISTS public.ensure_tribbit_admin();
DROP FUNCTION IF EXISTS public.ensure_tribbit_subscription(); 