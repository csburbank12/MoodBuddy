import { describe, it, expect } from 'vitest';
import { supabase } from '../lib/supabase';

describe('Login Functionality', () => {
  const testAccounts = [
    {
      type: "student",
      email: "student@example.com",
      password: "Student123!",
    },
    {
      type: "staff",
      email: "staff@example.com",
      password: "Staff123!",
    }
  ];
  for (const account of testAccounts) {
    it(`should sign in as ${account.type}`, async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });
      
      if (error) {
        throw new Error(`Failed to sign in as ${account.type}: ${error.message}`);
      }
      
      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(account.email);
      expect(data.session).toBeDefined();
    });
  }

  it('should handle invalid credentials', async () => {
    const { error } = await supabase.auth.signInWithPassword({ email: 'student@example.com', password: 'WrongPassword123!' });
    expect(error).not.toBeNull();
  }); 
});