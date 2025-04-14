-- Reset and recreate test accounts properly
DELETE FROM auth.users WHERE email IN ('student@test.edu', 'staff@test.edu');
DELETE FROM profiles WHERE email IN ('student@test.edu', 'staff@test.edu');

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
    '{"role":"student"}',
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
    '{"role":"staff"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
  );

-- Create test profiles with matching IDs
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

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;

-- Create simplified RLS policies
CREATE POLICY "Users can manage own profile"
  ON profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

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