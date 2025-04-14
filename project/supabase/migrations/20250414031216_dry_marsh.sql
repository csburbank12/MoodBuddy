/*
  # Create User Profile Function

  1. Function Purpose
    - Creates a new user profile and role in a single transaction
    - Ensures data consistency between profiles and user_roles tables
    - Handles all necessary validations

  2. Parameters
    - p_user_id: User's UUID from auth.users
    - p_email: User's email address
    - p_full_name: User's full name
    - p_role: Either 'student' or 'staff'
    - p_grade_level: Optional grade level for students
    - p_age_group: Optional age group (kids, teens, adults)
    - p_specialization: Optional specialization for staff
    - p_theme_preference: Optional theme preference

  3. Returns
    - JSON object containing the created profile and role
*/

CREATE OR REPLACE FUNCTION create_user_profile(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_role TEXT,
  p_grade_level TEXT DEFAULT NULL,
  p_age_group TEXT DEFAULT NULL,
  p_specialization TEXT DEFAULT NULL,
  p_theme_preference TEXT DEFAULT 'light'
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_id UUID;
  v_result json;
BEGIN
  -- Input validation
  IF p_role NOT IN ('student', 'staff') THEN
    RAISE EXCEPTION 'Invalid role: must be either student or staff';
  END IF;

  IF p_role = 'student' AND p_grade_level IS NULL THEN
    RAISE EXCEPTION 'Grade level is required for students';
  END IF;

  IF p_age_group IS NOT NULL AND p_age_group NOT IN ('kids', 'teens', 'adults') THEN
    RAISE EXCEPTION 'Invalid age group: must be kids, teens, or adults';
  END IF;

  -- Start transaction
  BEGIN
    -- Create profile
    INSERT INTO profiles (
      id,
      email,
      full_name,
      grade_level,
      age_group,
      specialization,
      theme_preference,
      profile_completed
    ) VALUES (
      p_user_id,
      p_email,
      p_full_name,
      p_grade_level,
      p_age_group,
      p_specialization,
      p_theme_preference,
      true
    )
    RETURNING id INTO v_profile_id;

    -- Create user role
    INSERT INTO user_roles (
      user_id,
      role
    ) VALUES (
      v_profile_id,
      p_role
    );

    -- Get the complete profile data
    SELECT json_build_object(
      'profile', row_to_json(p),
      'role', r.role
    )
    INTO v_result
    FROM profiles p
    JOIN user_roles r ON r.user_id = p.id
    WHERE p.id = v_profile_id;

    RETURN v_result;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE;
  END;
END;
$$;