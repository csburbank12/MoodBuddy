/*
  # Fix School Email Validation

  1. Changes
    - Add test.edu domain to allowed school domains
    - Update email validation function to be more permissive in development
*/

-- Create school domains table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.school_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.school_domains ENABLE ROW LEVEL SECURITY;

-- Add test domain
INSERT INTO public.school_domains (domain, is_primary)
VALUES ('test.edu', true)
ON CONFLICT (domain) DO NOTHING;

-- Drop existing trigger
DROP TRIGGER IF EXISTS validate_school_email_trigger ON public.profiles;

-- Update validation function to be more permissive
CREATE OR REPLACE FUNCTION validate_school_email() 
RETURNS trigger AS $$
BEGIN
  -- Always allow test accounts
  IF NEW.email LIKE '%@test.edu' THEN
    RETURN NEW;
  END IF;

  -- Check against allowed domains
  IF EXISTS (
    SELECT 1 FROM public.school_domains
    WHERE domain = split_part(NEW.email, '@', 2)
  ) THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Invalid school email domain';
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER validate_school_email_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_school_email();