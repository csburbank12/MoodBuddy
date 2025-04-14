import { z } from 'zod';

// Types
export interface User {
  id: string;
  email: string;
  emailConfirmed: boolean;
}

export interface Profile {
  id: string;
  full_name: string;
  role: 'student' | 'staff';
  grade_level?: string;
  age_group?: 'kids' | 'teens' | 'adults';
  specialization?: string;
  profile_completed: boolean;
}

// Validation schemas
const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  emailConfirmed: z.boolean()
});

const profileSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  role: z.enum(['student', 'staff']),
  grade_level: z.string().optional(),
  age_group: z.enum(['kids', 'teens', 'adults']).optional(),
  specialization: z.string().optional(),
  profile_completed: z.boolean()
});

// Auth service
class AuthService {
  async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      // For demo purposes, accept test accounts
      if (email === 'student@test.edu' && password === 'Student123!') {
        const user = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'student@test.edu',
          emailConfirmed: true
        };
        localStorage.setItem('user', JSON.stringify(user));
        return { user, error: null };
      }

      if (email === 'staff@test.edu' && password === 'Staff123!') {
        const user = {
          id: '00000000-0000-0000-0000-000000000002',
          email: 'staff@test.edu',
          emailConfirmed: true
        };
        localStorage.setItem('user', JSON.stringify(user));
        return { user, error: null };
      }

      throw new Error('Invalid email or password');
    } catch (err) {
      return {
        user: null,
        error: err instanceof Error ? err : new Error('Failed to sign in')
      };
    }
  }

  async signOut(): Promise<void> {
    localStorage.removeItem('user');
  }

  async resetPassword(email: string): Promise<void> {
    // In a real app, this would send a password reset email
    console.log('Password reset requested for:', email);
  }

  getProfile(userId: string): Profile | null {
    const profileData = localStorage.getItem(`profile_${userId}`);
    if (!profileData) return null;
    
    try {
      const profile = JSON.parse(profileData);
      return profileSchema.parse(profile);
    } catch {
      return null;
    }
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem('user');
    if (!userData) return null;

    try {
      const user = JSON.parse(userData);
      return userSchema.parse(user);
    } catch {
      return null;
    }
  }
}

export const auth = new AuthService();