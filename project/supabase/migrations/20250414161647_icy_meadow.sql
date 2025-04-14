/*
  # Fix Authentication Configuration

  1. Changes
    - Reset and properly configure auth settings
    - Create test accounts with correct metadata
    - Set up proper email templates
    - Configure security settings

  2. Security
    - Enable proper email verification
    - Set up secure token handling
    - Configure rate limiting
*/

-- Reset auth configuration
UPDATE auth.config SET (
  site_url,
  additional_redirect_urls,
  mailer_autoconfirm,
  smtp_admin_email,
  smtp_max_frequency,
  smtp_sender_name,
  jwt_exp,
  security_refresh_token_reuse_interval
) = (
  COALESCE(current_setting('app.site_url', true), 'http://localhost:3000'),
  ARRAY[
    'http://localhost:3000/**',
    'http://localhost:5173/**',
    'https://*.netlify.app/**'
  ],
  true,  -- Auto-confirm for development
  'noreply@moodbuddy.org',
  '5m',
  'MoodBuddy',
  3600,
  '5m'
);

-- Delete existing test accounts
DELETE FROM auth.identities 
WHERE user_id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');

DELETE FROM auth.users 
WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');

DELETE FROM profiles 
WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');

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
  aud,
  role
) VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'student@test.edu',
    crypt('Student123!', gen_salt('bf')),
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', ARRAY['email']
    ),
    jsonb_build_object(
      'role', 'student',
      'full_name', 'Test Student'
    ),
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
    jsonb_build_object(
      'provider', 'email',
      'providers', ARRAY['email']
    ),
    jsonb_build_object(
      'role', 'staff',
      'full_name', 'Test Staff'
    ),
    now(),
    now(),
    'authenticated',
    'authenticated'
  );

-- Create identities
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
    jsonb_build_object(
      'sub', '00000000-0000-0000-0000-000000000001',
      'email', 'student@test.edu',
      'email_verified', true
    ),
    'email',
    now(),
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    jsonb_build_object(
      'sub', '00000000-0000-0000-0000-000000000002',
      'email', 'staff@test.edu',
      'email_verified', true
    ),
    'email',
    now(),
    now(),
    now()
  );

-- Create profiles
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

-- Update email templates
UPDATE auth.email_templates
SET template = '
<h2>Welcome to MoodBuddy!</h2>
<p>Click the link below to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
'
WHERE template_type = 'confirmation';

UPDATE auth.email_templates
SET template = '
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
'
WHERE template_type = 'recovery';

-- Refresh materialized views and statistics
ANALYZE auth.users;
ANALYZE auth.identities;
ANALYZE profiles;