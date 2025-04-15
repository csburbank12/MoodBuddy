import { expect, test, describe } from 'vitest';
import { auth } from '../lib/auth';
import { supabase } from '../lib/db';

describe('Auth Service', () => {
  test('should reset password for a user', async () => {
    // Create a test user (or use an existing one)
    const testUser = {
      email: 'testresetpassword@example.com',
      password: 'TestPassword123!',
    };

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Failed to create test user');
    }

    // Reset the user's password
    await auth.resetPassword(testUser.email);

    // Attempt to sign in with the old password (should fail)
    try {
      await auth.signIn(testUser.email, testUser.password);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Invalid email or password');
    }
    //clean up
    await supabase.auth.admin.deleteUser(data.user.id);
  });
});