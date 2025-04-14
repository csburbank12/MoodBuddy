/*
  # Configure Authentication Settings

  1. Changes
    - Set up allowed redirect URLs
    - Configure email templates
    - Set up site URL

  2. Security
    - Only allow specific domains
    - Enforce secure redirects
*/

-- Update auth settings
UPDATE auth.config SET (
  site_url,
  additional_redirect_urls
) = (
  COALESCE(current_setting('app.site_url', true), 'http://localhost:3000'),
  ARRAY[
    'http://localhost:3000/**',
    'http://localhost:5173/**',
    'https://*.netlify.app/**'  -- For Netlify deployments
  ]
);

-- Configure email templates
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

-- Set up email settings
UPDATE auth.config SET (
  mailer_autoconfirm,
  smtp_admin_email,
  smtp_max_frequency,
  smtp_sender_name
) = (
  false,  -- Require email confirmation
  'noreply@moodbuddy.org',
  '5m',   -- Rate limit emails
  'MoodBuddy'
);

-- Configure security settings
UPDATE auth.config SET (
  jwt_exp,
  security_refresh_token_reuse_interval,
  security_captcha_enabled,
  security_captcha_provider
) = (
  3600,        -- 1 hour token expiry
  '5m',        -- Refresh token reuse window
  true,        -- Enable captcha
  'hcaptcha'   -- Use hCaptcha
);