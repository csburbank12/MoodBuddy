/*
  # Fix Test Account Setup

  1. Changes
    - Properly set up test accounts with complete profiles
    - Add necessary role records
    - Ensure profile completion criteria are met

  2. Security
    - Maintain existing RLS policies
    - Keep test account data secure
*/

-- Create test student profile
INSERT INTO profiles (
  id,
  full_name,
  grade_level,
  age_group,
  profile_completed,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test Student',
  '10th',
  'teens',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE 
SET 
  full_name = EXCLUDED.full_name,
  grade_level = EXCLUDED.grade_level,
  age_group = EXCLUDED.age_group,
  profile_completed = EXCLUDED.profile_completed,
  updated_at = EXCLUDED.updated_at;

-- Create test staff profile
INSERT INTO profiles (
  id,
  full_name,
  specialization,
  profile_completed,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Test Staff',
  'School Counselor',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE 
SET 
  full_name = EXCLUDED.full_name,
  specialization = EXCLUDED.specialization,
  profile_completed = EXCLUDED.profile_completed,
  updated_at = EXCLUDED.updated_at;

-- Ensure proper roles are set
INSERT INTO user_roles (
  user_id,
  role
) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'student'),
  ('00000000-0000-0000-0000-000000000002', 'staff')
ON CONFLICT (user_id) DO UPDATE 
SET role = EXCLUDED.role;