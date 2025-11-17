-- Add 'site_owner' role to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'site_owner';

-- Update has_role function to include site_owner role check
-- (Already defined correctly, just ensuring it works with new role)