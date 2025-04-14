/*
  # Fix Profile and Role Management

  1. Changes
    - Add missing policies for profile management
    - Improve role handling
    - Add profile completion tracking

  2. Security
    - Maintain RLS
    - Add proper policies for profile creation
*/

-- Drop existing policies to clean up
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create comprehensive profile policies
CREATE POLICY "Users can manage own profile"
  ON profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_profiles_completion ON profiles(id) WHERE (profile_completed = false);

-- Create or replace the profile creation function
CREATE OR REPLACE FUNCTION create_initial_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    profile_completed
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure we have the right trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_initial_profile();

-- Add function to update profile completion
CREATE OR REPLACE FUNCTION check_profile_completion()
RETURNS trigger AS $$
BEGIN
  IF NEW.full_name IS NOT NULL AND LENGTH(NEW.full_name) > 0 
     AND NEW.role IS NOT NULL 
     AND (
       (NEW.role = 'student' AND NEW.grade_level IS NOT NULL)
       OR 
       (NEW.role = 'staff' AND NEW.specialization IS NOT NULL)
     )
  THEN
    NEW.profile_completed := true;
  ELSE
    NEW.profile_completed := false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for profile completion check
CREATE TRIGGER check_profile_completion_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION check_profile_completion();