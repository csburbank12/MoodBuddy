/*
  # Add Test Accounts

  1. Creates test accounts for:
    - Student account
    - Staff account

  2. Sets up:
    - Profile records
    - Proper roles
    - Complete profiles
*/

-- Create test student profile
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  grade_level,
  age_group,
  profile_completed
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'student@test.edu',
  'Test Student',
  'student',
  '10th',
  'teens',
  true
) ON CONFLICT (id) DO UPDATE 
SET 
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  grade_level = EXCLUDED.grade_level,
  age_group = EXCLUDED.age_group,
  profile_completed = EXCLUDED.profile_completed;

-- Create test staff profile
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  specialization,
  profile_completed
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'staff@test.edu',
  'Test Staff',
  'staff',
  'School Counselor',
  true
) ON CONFLICT (id) DO UPDATE 
SET 
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  specialization = EXCLUDED.specialization,
  profile_completed = EXCLUDED.profile_completed;