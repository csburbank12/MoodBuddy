/*
  # Initial Database Setup

  This migration sets up the complete database schema for the MoodBuddy application.

  1. Tables
    - profiles: User profiles with role-based access
    - notifications: User notifications system
    - messages: User-to-user messaging
    - achievements: User achievements and badges
    - mood_entries: User mood tracking
    - behavior_records: Student behavior tracking
    - support_groups: Support group management
    - weekly_summaries: User progress summaries

  2. Security
    - RLS enabled on all tables
    - Role-based access control
    - Proper data isolation

  3. Functions and Triggers
    - Automatic profile creation
    - Timestamp management
    - Data validation
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('student', 'staff')) NOT NULL,
  grade_level TEXT,
  age_group TEXT CHECK (age_group IN ('kids', 'teens', 'adults')),
  specialization TEXT,
  profile_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  type TEXT NOT NULL CHECK (type IN ('achievement', 'goal_complete', 'streak_milestone', 'check_in_reminder', 'meeting_scheduled', 'report_published', 'support_needed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  receiver_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ,
  CONSTRAINT messages_check CHECK (sender_id <> receiver_id)
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  criteria JSONB NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  badge_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create mood_entries table
CREATE TABLE public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  mood_level INTEGER CHECK (mood_level BETWEEN 1 AND 5),
  mood_type TEXT CHECK (mood_type IN ('great', 'good', 'okay', 'down', 'bad')),
  notes TEXT,
  activities TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create weekly_summaries table
CREATE TABLE public.weekly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  mood_average NUMERIC(3,2),
  top_activities TEXT[],
  highlights TEXT[],
  suggestions TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Create support_groups table
CREATE TABLE public.support_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('academic_support', 'emotional_wellbeing', 'social_skills', 'stress_management', 'peer_support')),
  facilitator_id UUID REFERENCES public.profiles(id),
  max_participants INTEGER DEFAULT 12,
  meeting_schedule JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create group_memberships table
CREATE TABLE public.group_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.support_groups(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id),
  join_date TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  UNIQUE(group_id, student_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles
CREATE POLICY "Users can manage own profile"
  ON public.profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Staff can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'staff'
    )
  );

-- Notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Messages
CREATE POLICY "Users can read their messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Achievements
CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (true);

-- Mood Entries
CREATE POLICY "Users can manage own entries"
  ON public.mood_entries FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view student entries"
  ON public.mood_entries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'staff'
    )
  );

-- Weekly Summaries
CREATE POLICY "Users can view their summaries"
  ON public.weekly_summaries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Support Groups
CREATE POLICY "Users can view active groups"
  ON public.support_groups FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Staff can manage support groups"
  ON public.support_groups FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'staff'
    )
  );

-- Group Memberships
CREATE POLICY "Users can manage own memberships"
  ON public.group_memberships FOR ALL
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Create functions and triggers

-- Profile update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- New user handler function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, profile_completed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_mood_entries_timestamp
  BEFORE UPDATE ON public.mood_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create indexes
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_messages_participants ON public.messages(sender_id, receiver_id);
CREATE INDEX idx_mood_entries_user_date ON public.mood_entries(user_id, created_at DESC);
CREATE INDEX idx_weekly_summaries_user_date ON public.weekly_summaries(user_id, week_start DESC);
CREATE INDEX idx_group_memberships_group ON public.group_memberships(group_id);
CREATE INDEX idx_group_memberships_student ON public.group_memberships(student_id);

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
    '{"provider":"email","providers":["email"]}',
    '{"role":"student"}',
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
    '{"provider":"email","providers":["email"]}',
    '{"role":"staff"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
  );

-- Create test profiles
INSERT INTO public.profiles (
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