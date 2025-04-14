/*
  # Fix Profile RLS Policies

  1. Changes
    - Ensure RLS is enabled
    - Drop existing policies
    - Create comprehensive policies for profile management
    - Add proper role-based access control

  2. Security
    - Maintain data isolation between users
    - Allow staff to view all profiles
    - Restrict profile management to owners
*/

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;

-- Create comprehensive policies
CREATE POLICY "Users can manage own profile"
  ON profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'staff'
  );

-- Refresh materialized views and update statistics
ANALYZE profiles;