/*
  # Fix Test Accounts and RLS

  1. Changes
    - Recreate test accounts with proper auth setup
    - Ensure profiles have correct data
    - Fix RLS policies
    - Add proper indexes

  2. Security
    - Maintain RLS
    - Proper policy enforcement
*/

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;

-- Create proper policies
CREATE POLICY "Users can manage own profile"
  ON profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p2
      WHERE p2.id = auth.uid()
      AND p2.role = 'staff'
    )
  );

-- Create test accounts
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'student@test.edu',
    crypt('Student123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"student"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'staff@test.edu',
    crypt('Staff123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"staff"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
ON CONFLICT (id) DO UPDATE 
SET 
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
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
  created_at,
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
    now(),
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
    now(),
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Refresh statistics
ANALYZE profiles;