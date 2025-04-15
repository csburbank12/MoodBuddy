import { describe, it, expect } from 'vitest';
import { supabase } from '../lib/supabase';

describe('Login Functionality', () => {
  it('should sign in as master', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "master@example.com",
        password: "Master123!",
      });

      const account = {
        type: "master",
        email: "master@example.com",
        password: "Master123!"
      }
      
      if (error) {
        throw new Error(`Failed to sign in as ${account.type}: ${error.message}`);
      }
      
      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(account.email);
      expect(data.session).toBeDefined();
    });

  it('should handle invalid credentials', async () => {
    const { error } = await supabase.auth.signInWithPassword({ email: 'student@example.com', password: 'WrongPassword123!' });
    expect(error).not.toBeNull();
  }); 
});