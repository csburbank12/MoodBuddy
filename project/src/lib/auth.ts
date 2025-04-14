import { z } from 'zod';
import { supabase, dbService } from './db';


export interface User {
  id: string;
  email: string;
  emailConfirmed: boolean;
}


const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  emailConfirmed: z.boolean()
});


// Auth service
export class AuthService {
    async createTestUser(
        email: string,
        password: string,
        full_name: string,
        role: 'student' | 'staff'
    ): Promise<{ user: User | null; error: Error | null }> {
        try {
            // 1. Create user with Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                throw new Error(error.message);
            }

            if (data.user) {
                const user: User = {
                    id: data.user.id,
                    email: data.user.email!,
                    emailConfirmed: !!data.user.email_confirmed_at,
                };

                // 2. Save user data in the 'users' table
                await dbService.createUser({ id: user.id, email: user.email, full_name, role });

                // 3. Create profile in localStorage (since we are not using profiles in the database anymore)


                return { user, error: null };
            }
            throw new Error('Failed to create user');
        } catch (err) {
            return {
                user: null,
                error: err instanceof Error ? err : new Error('Failed to create user'),
            };
        }
    }
    async signIn(
        email: string,
        password: string
    ): Promise<{ user: User | null; error: Error | null }> {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw new Error('Invalid email or password');
            }

            if (data.user) {
                const user: User = {
                    id: data.user.id,
                    email: data.user.email!,
                    emailConfirmed: !!data.user.email_confirmed_at,
                };
                return { user, error: null };
            }

            throw new Error('Failed to sign in');
        } catch (err) {
            return {
                user: null,
                error: err instanceof Error ? err : new Error('Failed to sign in'),
            };
        }
    }

    async signUp(
        email: string,
        password: string
    ): Promise<{ user: User | null; error: Error | null }> {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                throw new Error(error.message);
            }

            if (data.user) {
                const user: User = {
                    id: data.user.id,
                    email: data.user.email!,
                    emailConfirmed: !!data.user.email_confirmed_at,
                };
                return { user, error: null };
            }

            throw new Error('Failed to sign up');
        } catch (err) {
            return {
                user: null,
                error: err instanceof Error ? err : new Error('Failed to sign up'),
            };
        }
    }

    async signOut(): Promise<void> {
        await supabase.auth.signOut();
    }

    async resetPassword(email: string): Promise<void> {
      const { error } = await supabase.auth.resetPasswordForEmail({ email });
      if (error) {
        throw error;
      }
    }

    async getCurrentUser(): Promise<User | null> {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
            return { id: session.user.id, email: session.user.email!, emailConfirmed: !!session.user.email_confirmed_at };
        }

        return null;
    }
    async getProfile(userId: string) {
        const profile = await dbService.getUser(userId);

        if (profile) {
            return profile;
        }

        return null;


    }

}

export const auth = new AuthService();