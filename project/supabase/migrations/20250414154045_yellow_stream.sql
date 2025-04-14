/*
  # Fix Profile Access Policies

  1. Changes
    - Add proper RLS policies for profiles table
    - Ensure users can read their own profile
    - Maintain existing security model

  2. Security
    - Users can only access their own profile data
    - Staff can view profiles they have permission to see
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;

-- Create comprehensive profile policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add policy for staff to view student profiles
CREATE POLICY "Staff can view student profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'staff'
    )
  );

-- Refresh existing profile data
UPDATE profiles SET updated_at = NOW();