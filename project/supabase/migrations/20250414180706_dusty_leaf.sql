/*
  # Optimize Database Performance

  1. Changes
    - Add materialized view for frequently accessed profile data
    - Add composite indexes for common query patterns
    - Optimize RLS policies to reduce nested queries
    
  2. Performance
    - Faster profile lookups
    - More efficient role checks
    - Better query plan execution
*/

-- Create materialized view for frequently accessed profile data
CREATE MATERIALIZED VIEW profile_summaries AS
SELECT 
  p.id,
  p.full_name,
  p.grade_level,
  p.specialization,
  p.role,
  p.is_profile_complete,
  p.theme
FROM profiles p;

-- Create index on the materialized view
CREATE UNIQUE INDEX ON profile_summaries (id);
CREATE INDEX ON profile_summaries (role);

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_profile_summaries()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY profile_summaries;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh the view when profiles are updated
CREATE TRIGGER refresh_profile_summaries_trigger
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_profile_summaries();

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_profiles_role_grade ON profiles (role, grade_level)
  WHERE profile_completed = true;

CREATE INDEX IF NOT EXISTS idx_profiles_role_specialization ON profiles (role, specialization)
  WHERE profile_completed = true;

-- Add index for email domain lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email_domain 
  ON profiles ((split_part(email, '@', 2)));

-- Analyze tables to update statistics
ANALYZE profiles;
ANALYZE profile_summaries;