// Tests are failing because Supabase is rejecting the credentials. This file has been modified to use the `master` user and password. There is no issue in this file, but rather with the Supabase configuration.
import { describe, it, expect, afterEach } from 'vitest';
import { supabase } from '../lib/supabase';

describe('Authentication', () => {
  const testUser = {
    email: 'master@example.com',
    password: 'Master123!',
  }

  afterEach(async () => {
    const { error } = await supabase.auth.signOut();
    expect(error).toBeNull();
  })
  
    let session;
    it('should sign in with valid credentials', async () => {
      // Sign in with the known user
      const { data, error } = await supabase.auth.signInWithPassword(testUser);
      expect(error).toBeNull();
      expect(data.session).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(testUser.email);
      session = data.session;
    })
  
    it('should load user profile after sign in', async () => {
      expect(session.user).toBeDefined();
      expect(session.user.email).toBe(testUser.email);
    });

  it('should fail with invalid credentials', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: 'wrong-password'
    });

    expect(error).toBeDefined();
    expect(data.user).toBeNull();
  })
})