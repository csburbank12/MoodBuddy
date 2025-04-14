import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { supabase } from '../lib/supabase';

describe('Authentication', () => {
  const testUser = {
    email: 'student@test.edu',
    password: 'Student123!'
  };

  it('should sign in with valid credentials', async () => {
    const { data, error } = await supabase.auth.signInWithPassword(testUser);
    
    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user?.email).toBe(testUser.email);
  });

  it('should fail with invalid credentials', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: 'wrong-password'
    });
    
    expect(error).toBeDefined();
    expect(data.user).toBeNull();
  });

  it('should load user profile after sign in', async () => {
    const { data: authData } = await supabase.auth.signInWithPassword(testUser);
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user?.id)
      .single();
    
    expect(profile).toBeDefined();
    expect(profile.email).toBe(testUser.email);
    expect(profile.role).toBe('student');
    expect(profile.profile_completed).toBe(true);
  });

  it('should enforce school email validation', async () => {
    const { error } = await supabase.auth.signUp({
      email: 'test@invalid-domain.com',
      password: 'Test123!',
    });
    
    expect(error).toBeDefined();
  });
});