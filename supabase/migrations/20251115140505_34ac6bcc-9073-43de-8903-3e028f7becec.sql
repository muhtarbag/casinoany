-- Add email to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text;

-- Create user status enum (only if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;

-- Add status column to user_roles
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS status user_status DEFAULT 'pending';

-- Add approved_at and approved_by columns
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approved_by uuid;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_roles_status ON public.user_roles(status);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Update handle_new_user function to set email and create pending user_role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Insert profile with email
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  
  -- Create pending user role (no role assigned yet)
  INSERT INTO public.user_roles (user_id, role, status)
  VALUES (new.id, 'user', 'pending');
  
  RETURN new;
END;
$$;

-- Update existing profiles with email from auth.users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT au.id, au.email
    FROM auth.users au
    LEFT JOIN public.profiles p ON p.id = au.id
    WHERE p.email IS NULL
  LOOP
    UPDATE public.profiles
    SET email = user_record.email
    WHERE id = user_record.id;
  END LOOP;
END $$;