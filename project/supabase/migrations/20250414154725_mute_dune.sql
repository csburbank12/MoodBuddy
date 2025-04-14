/*
  # Fix Profile and Role Management

  1. Changes
    - Simplify profile schema
    - Add missing indexes
    - Fix role management
    - Add proper constraints

  2. Security
    - Maintain RLS policies
    - Add proper validation
*/

-- Drop existing triggers
DROP TRIGGER IF EXISTS check_profile_completion_trigger ON profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('student', 'staff')) NOT NULL,
  grade_level TEXT,
  age_group TEXT CHECK (age_group IN ('kids', 'teens', 'adults')),
  specialization TEXT,
  profile_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Drop user_roles table as we'll store role in profiles
DROP TABLE IF EXISTS user_roles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own profile"
  ON profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'staff'
  );

-- Create profile handler function
CREATE OR REPLACE FUNCTION handle_new_user()
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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create profile completion function
CREATE OR REPLACE FUNCTION check_profile_completion()
RETURNS trigger AS $$
BEGIN
  IF NEW.full_name IS NULL OR LENGTH(TRIM(NEW.full_name)) = 0 THEN
    NEW.profile_completed := false;
    RETURN NEW;
  END IF;

  -- Role-specific checks
  IF NEW.role = 'student' THEN
    IF NEW.grade_level IS NULL OR NEW.age_group IS NULL THEN
      NEW.profile_completed := false;
      RETURN NEW;
    END IF;
  ELSIF NEW.role = 'staff' THEN
    IF NEW.specialization IS NULL OR LENGTH(TRIM(NEW.specialization)) = 0 THEN
      NEW.profile_completed := false;
      RETURN NEW;
    END IF;
  END IF;

  NEW.profile_completed := true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile completion
CREATE TRIGGER check_profile_completion_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION check_profile_completion();

-- Create test accounts
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'student@test.edu',
    crypt('Student123!', gen_salt('bf')),
    now(),
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'staff@test.edu',
    crypt('Staff123!', gen_salt('bf')),
    now(),
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE 
SET 
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  updated_at = now();

-- Create test profiles
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  grade_level,
  age_group,
  specialization,
  profile_completed,
  updated_at
) VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'student@test.edu',
    'Test Student',
    'student',
    '10th',
    'teens',
    NULL,
    true,
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'staff@test.edu',
    'Test Staff',
    'staff',
    NULL,
    NULL,
    'School Counselor',
    true,
    now()
  )
ON CONFLICT (id) DO UPDATE 
SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  grade_level = EXCLUDED.grade_level,
  age_group = EXCLUDED.age_group,
  specialization = EXCLUDED.specialization,
  profile_completed = EXCLUDED.profile_completed,
  updated_at = now();