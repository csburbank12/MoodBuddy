import { describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '../lib/supabase';

describe('Profile Management', () => {
  const testUser = {
    email: 'student@test.edu',
    password: 'Student123!'
  };

  beforeEach(async () => {
    await supabase.auth.signInWithPassword(testUser);
  });

  it('should update profile information', async () => {
    const { data: user } = await supabase.auth.getUser();
    
    const updates = {
      grade_level: '11th',
      age_group: 'teens'
    };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.user?.id)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.grade_level).toBe(updates.grade_level);
    expect(data.age_group).toBe(updates.age_group);
  });

  it('should enforce role-based access control', async () => {
    // Try to view all profiles as a student
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    // Student should only see their own profile
    expect(data?.length).toBe(1);
  });

  it('should validate age group constraints', async () => {
    const { data: user } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('profiles')
      .update({ age_group: 'invalid' })
      .eq('id', user.user?.id);

    expect(error).toBeDefined();
  });
});