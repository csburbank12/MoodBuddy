/*
  # Simplify Auth and Profiles

  1. Changes
    - Simplify RLS policies
    - Fix test accounts
    - Add proper indexes
*/

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create simple policies
CREATE POLICY "Users can manage own profile"
  ON profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'staff'
    )
  );

-- Recreate test accounts
DELETE FROM auth.users WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
);

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
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
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'staff@test.edu',
    crypt('Staff123!', gen_salt('bf')),
    '{"provider":"email","providers":["email"]}',
    '{"role":"staff"}',
    now(),
    now()
  );

-- Recreate test profiles
DELETE FROM profiles WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
);

INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  grade_level,
  age_group,
  specialization,
  profile_completed
) VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'student@test.edu',
    'Test Student',
    'student',
    '10th',
    'teens',
    NULL,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'staff@test.edu',
    'Test Staff',
    'staff',
    NULL,
    NULL,
    'School Counselor',
    true
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Refresh statistics
ANALYZE profiles;