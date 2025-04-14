/*
  # Fix authentication and profiles setup

  This migration ensures proper setup of authentication and profiles:
  
  1. Cleanup and Setup
    - Removes any existing test accounts
    - Enables RLS on profiles table
    - Creates simplified policies
  
  2. Test Accounts
    - Creates test student and staff accounts
    - Sets up proper auth identities
    - Creates matching profile records
  
  3. Verification
    - Adds verification checks
    - Creates performance indexes
*/

-- Reset existing test accounts
DELETE FROM auth.users WHERE email IN ('student@test.edu', 'staff@test.edu');
DELETE FROM profiles WHERE email IN ('student@test.edu', 'staff@test.edu');

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create simplified RLS policies
CREATE POLICY "Users can manage own profile"
  ON profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create test accounts in auth.users
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
  aud,
  role
) VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'student@test.edu',
    crypt('Student123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    'authenticated',
    'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'staff@test.edu',
    crypt('Staff123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    'authenticated',
    'authenticated'
  );

-- Create identities for the users
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '{"sub":"00000000-0000-0000-0000-000000000001","email":"student@test.edu"}',
    'email',
    now(),
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    '{"sub":"00000000-0000-0000-0000-000000000002","email":"staff@test.edu"}',
    'email',
    now(),
    now(),
    now()
  );

-- Create test profiles
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Verify the setup
DO $$
BEGIN
  -- Check if users exist
  ASSERT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'student@test.edu'
  ), 'Student user not found';

  ASSERT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'staff@test.edu'
  ), 'Staff user not found';

  -- Check if profiles exist and match user IDs
  ASSERT EXISTS (
    SELECT 1 FROM profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE p.email = 'student@test.edu'
  ), 'Student profile not found or ID mismatch';

  ASSERT EXISTS (
    SELECT 1 FROM profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE p.email = 'staff@test.edu'
  ), 'Staff profile not found or ID mismatch';
END $$;