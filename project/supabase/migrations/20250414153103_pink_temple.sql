/*
  # Fix Profile Completion Logic

  1. Changes
    - Update profile completion check to consider role-specific requirements
    - Add validation for required fields
    - Improve trigger function
*/

-- Drop existing trigger
DROP TRIGGER IF EXISTS check_profile_completion_trigger ON profiles;

-- Update profile completion function
CREATE OR REPLACE FUNCTION check_profile_completion()
RETURNS trigger AS $$
BEGIN
  -- Check common required fields
  IF NEW.full_name IS NULL OR LENGTH(TRIM(NEW.full_name)) = 0 THEN
    NEW.profile_completed := false;
    RETURN NEW;
  END IF;

  -- Role-specific checks
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = NEW.id 
    AND role = 'student'
  ) THEN
    -- Student requirements
    IF NEW.grade_level IS NULL OR NEW.age_group IS NULL THEN
      NEW.profile_completed := false;
      RETURN NEW;
    END IF;
  ELSIF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = NEW.id 
    AND role = 'staff'
  ) THEN
    -- Staff requirements
    IF NEW.specialization IS NULL OR LENGTH(TRIM(NEW.specialization)) = 0 THEN
      NEW.profile_completed := false;
      RETURN NEW;
    END IF;
  END IF;

  -- If all checks pass, mark as complete
  NEW.profile_completed := true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER check_profile_completion_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION check_profile_completion();

-- Update existing profiles
UPDATE profiles
SET updated_at = NOW()
WHERE profile_completed = true;