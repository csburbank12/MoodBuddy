/*
  # Create Super Admin Account

  1. Creates initial school
  2. Sets up super admin profile
  3. Assigns super admin roles
*/

-- Create initial school if none exists
INSERT INTO schools (name, code, status)
SELECT 
  'Primary School',
  'PS001',
  'active'
WHERE NOT EXISTS (
  SELECT 1 FROM schools LIMIT 1
);

-- Create profile for the super admin
INSERT INTO profiles (
  id,
  full_name,
  profile_completed,
  school_id
)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  'Chris Burbank',
  true,
  id
FROM schools
WHERE code = 'PS001'
ON CONFLICT (id) DO NOTHING;

-- Add super admin role
INSERT INTO user_roles (
  user_id,
  role
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'super_admin'
)
ON CONFLICT (user_id) DO NOTHING;

-- Add school admin role
INSERT INTO school_admins (
  user_id,
  school_id,
  role
)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  id,
  'super_admin'
FROM schools 
WHERE code = 'PS001'
ON CONFLICT (user_id, school_id) DO NOTHING;