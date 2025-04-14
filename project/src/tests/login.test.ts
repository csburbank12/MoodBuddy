import { describe, it, expect } from 'vitest';
import { supabase } from '../lib/supabase';

describe('Login Functionality', () => {
  const testAccounts = [
    {
      type: 'student',
      email: 'student@test.edu',
      password: 'Student123!'
    },
    {
      type: 'staff',
      email: 'staff@test.edu',
      password: 'Staff123!'
    }
  ];

  for (const account of testAccounts) {
    it(`should sign in as ${account.type}`, async () => {
      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      // Verify successful login
      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(account.email);

      // Verify profile is loaded
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user?.id)
        .single();

      expect(profile).toBeDefined();
      expect(profile.email).toBe(account.email);
      expect(profile.role).toBe(account.type);
      expect(profile.profile_completed).toBe(true);

      // Sign out after test
      await supabase.auth.signOut();
    });
  }

  it('should handle invalid credentials', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'student@test.edu',
      password: 'WrongPassword123!'
    });

    expect(error).toBeDefined();
    expect(data.user).toBeNull();
  });
});