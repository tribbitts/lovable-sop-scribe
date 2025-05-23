
-- Function to directly confirm the super user's email in the auth.users table
CREATE OR REPLACE FUNCTION public.confirm_super_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the email_confirmed_at field for the super user
  UPDATE auth.users
  SET email_confirmed_at = NOW(),
      updated_at = NOW()
  WHERE email = 'tribbit@tribbit.gg' 
    AND email_confirmed_at IS NULL;
END;
$$;
