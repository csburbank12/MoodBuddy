/*
  # Set up initial user records

  This migration creates the necessary database records for the initial admin user.
  Note: The actual user authentication (password) must be set up through the Supabase client.

  1. Creates profile record
  2. Sets up user roles
  3. Configures school admin access
*/

-- Create profile if it doesn't exist
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

-- Set up user roles
INSERT INTO user_roles (
  user_id,
  role
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'super_admin'
)
ON CONFLICT (user_id) DO NOTHING;

-- Configure school admin access
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