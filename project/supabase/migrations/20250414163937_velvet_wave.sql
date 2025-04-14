/*
  # Add role column to profiles table

  1. Changes
    - Add role column to profiles table with default value 'student'
    - Add check constraint to ensure valid role values
    - Add index for role column for better query performance

  2. Security
    - No changes to RLS policies needed as they are already properly configured
*/

-- Add role column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN role text DEFAULT 'student';

    -- Add check constraint for valid roles
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('student', 'staff'));

    -- Create index for role column
    CREATE INDEX IF NOT EXISTS idx_profiles_role 
    ON profiles(role);
  END IF;
END $$;