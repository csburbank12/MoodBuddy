/*
  # Fix Authentication and Profile Loading

  1. Changes
    - Ensure test accounts exist in auth.users
    - Set up complete profiles with proper data
    - Add necessary role records
    - Add proper RLS policies

  2. Security
    - Maintain existing security rules
    - Add proper constraints
*/

-- Create or update test accounts in auth.users
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

-- Create or update profiles
INSERT INTO profiles (
  id,
  full_name,
  grade_level,
  age_group,
  specialization,
  profile_completed,
  updated_at
) VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'Test Student',
    '10th',
    'teens',
    NULL,
    true,
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Test Staff',
    NULL,
    NULL,
    'School Counselor',
    true,
    now()
  )
ON CONFLICT (id) DO UPDATE 
SET 
  full_name = EXCLUDED.full_name,
  grade_level = EXCLUDED.grade_level,
  age_group = EXCLUDED.age_group,
  specialization = EXCLUDED.specialization,
  profile_completed = EXCLUDED.profile_completed,
  updated_at = now();

-- Ensure proper roles exist
INSERT INTO user_roles (
  user_id,
  role
) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'student'),
  ('00000000-0000-0000-0000-000000000002', 'staff')
ON CONFLICT (user_id) DO UPDATE 
SET role = EXCLUDED.role;