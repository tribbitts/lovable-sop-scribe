-- Fix Database Setup for SOP Scribe Admin Access - FINAL VERSION
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

-- Create policy for admins table (drop first if exists)
DROP POLICY IF EXISTS "Admins can view admin records" ON public.admins;
CREATE POLICY "Admins can view admin records"
  ON public.admins
  FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.admins));

-- 2. Fix subscriptions table - add unique constraint if it doesn't exist
DO $$
BEGIN
  -- Try to add the unique constraint, ignore if it already exists
  ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);
EXCEPTION
  WHEN duplicate_table THEN
    -- Constraint already exists, that's fine
    NULL;
  WHEN others THEN
    -- Some other error, but continue
    NULL;
END $$;

-- 3. Simple function to ensure tribbit admin access
DO $$
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
END $$;

-- 4. Simple subscription setup for tribbit user
DO $$
DECLARE
  tribbit_user_id uuid;
  subscription_count integer;
BEGIN
  -- Get the user ID for tribbit@tribbit.gg
  SELECT id INTO tribbit_user_id FROM auth.users WHERE email = 'tribbit@tribbit.gg';
  
  IF tribbit_user_id IS NOT NULL THEN
    -- Check if subscription already exists
    SELECT COUNT(*) INTO subscription_count FROM public.subscriptions WHERE user_id = tribbit_user_id;
    
    IF subscription_count > 0 THEN
      -- Update existing subscription
      UPDATE public.subscriptions 
      SET status = 'active', tier = 'pro-complete', updated_at = now()
      WHERE user_id = tribbit_user_id;
      RAISE NOTICE 'Updated existing subscription for tribbit@tribbit.gg';
    ELSE
      -- Create new subscription
      INSERT INTO public.subscriptions (user_id, status, tier)
      VALUES (tribbit_user_id, 'active', 'pro-complete');
      RAISE NOTICE 'Created new pro-complete subscription for tribbit@tribbit.gg';
    END IF;
  ELSE
    RAISE NOTICE 'User tribbit@tribbit.gg not found in auth.users table';
  END IF;
END $$;

-- 5. Check current admin status
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

-- 6. Check subscription status
SELECT 
  u.email,
  COALESCE(s.tier, 'none') as tier,
  COALESCE(s.status, 'none') as status,
  s.created_at as subscription_created
FROM auth.users u
LEFT JOIN public.subscriptions s ON u.id = s.user_id
WHERE u.email IN ('tribbit@tribbit.gg', 'Onoki82@gmail.com')
ORDER BY u.email;

-- 7. Verify final setup
SELECT 'ADMIN COUNT' as check_type, count(*) as count FROM public.admins;
SELECT 'PRO SUBSCRIPTION COUNT' as check_type, count(*) as count FROM public.subscriptions WHERE tier = 'pro-complete';

-- 8. Show all users for verification
SELECT 'ALL USERS' as info, email, id, created_at FROM auth.users ORDER BY created_at; 