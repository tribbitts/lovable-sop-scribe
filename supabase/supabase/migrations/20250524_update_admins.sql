
-- Remove superuser function since we're no longer using it
DROP FUNCTION IF EXISTS public.confirm_super_user();

-- Insert the new admin account
INSERT INTO public.admins (user_id)
SELECT id FROM auth.users
WHERE email = 'Onoki82@gmail.com'
ON CONFLICT DO NOTHING;

-- Just in case, let's make sure the admin record gets created even if it doesn't exist yet
-- by creating a function that will create an admin record for this specific email
CREATE OR REPLACE FUNCTION public.ensure_admin_for_email()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Get the user ID for the email
  SELECT id INTO user_id FROM auth.users WHERE email = 'Onoki82@gmail.com';
  
  -- If the user exists but doesn't have an admin record, create one
  IF user_id IS NOT NULL THEN
    INSERT INTO public.admins (user_id)
    VALUES (user_id)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- Execute the function
SELECT ensure_admin_for_email();

-- We don't need the function anymore after execution
DROP FUNCTION IF EXISTS public.ensure_admin_for_email();
