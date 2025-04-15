import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string;
  role?: 'student' | 'staff';
  grade_level?: string;
  age_group?: 'kids' | 'teens' | 'adults';
  specialization?: string;
  profile_completed: boolean;
  email: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  redirectPath: string | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  setRedirectPath: (path: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Auto-create profile if it doesn't exist
  async function ensureProfile(userId: string, email: string) {
    console.log("🔄 Ensuring profile exists for:", email);
    
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("❌ Error fetching profile:", fetchError);
      return null;
    }
    
    if (!existingProfile) {
      console.log("📝 Creating new profile for:", email);
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          email: email,
          full_name: '',
          role: 'student',
          profile_completed: false
        }])
        .select()
        .limit(1)
        .single();

      if (createError) {
        console.error("❌ Error creating profile:", createError);
        return null;
      }

      return newProfile;
    }

    return existingProfile;
  }

  // Simplified profile fetch function
  async function fetchUserProfile(userId: string) {
    console.log("🔍 Fetching profile for user:", userId);

    if (!userId) {
      console.error("❌ No user ID provided for profile fetch");
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("❌ Error fetching profile:", error.code, error.message);
      return null;
    }

    console.log("📋 Profile data:", {
      id: data.id,
      email: data.email,
      role: data.role
    });
    return data;
  }

  useEffect(() => {
    let mounted = true;

    // Reset retry count when component mounts
    setRetryCount(0);

    async function getInitialSession() {
      setLoading(true);
      try {
        console.log("🔍 Getting initial session...");
        const { data: { session } } = await supabase.auth.getSession();
        console.log("✅ Initial session:", {
          email: session?.user?.email || 'No session',
          id: session?.user?.id
        });
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log("👤 Fetching profile for:", session.user.email);
            let profile = await fetchUserProfile(session.user.id, session.user.email ?? "");
            
            if (!profile) {
              console.log("⚠️ No profile found, attempting to create one");
              profile = await ensureProfile(session.user.id, session.user.email);
            }
            
            if (mounted && profile) {
              if (!profile.email) {
                console.log("⚠️ Profile missing email, updating...");
                const { error: updateError } = await supabase
                  .from('profiles')
                  .update({ email: session.user.email })
                  .eq('id', session.user.id);
                
                if (updateError) {
                  console.error("❌ Error updating profile email:", updateError);
                }
                profile.email = session.user.email;
              }

              console.log("📋 Profile found:", profile.full_name);
              setProfile(profile);
            } else {
              console.log("⚠️ No profile found or component unmounted");
              setProfile(null);
            }
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error("❌ Error getting initial session:", error);
        if (mounted) {
          if (retryCount < 3) {
            console.log("🔄 Retrying session fetch...");
            setRetryCount(prev => prev + 1);
            setTimeout(getInitialSession, 1000);
          }
          setLoading(false);
        }
      }
    }

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state change:", {
        event,
        user: session?.user ? { email: session.user.email, id: session.user.id } : null
      });
      
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            console.log("🔑 User authenticated:", session.user.id);
            console.log("👤 Fetching profile after auth change:", session.user.email ?? "");
            let profile = await fetchUserProfile(session.user.id);
            
            if (!profile) {
              console.log("⚠️ No profile found after auth change, creating one");
              profile = await ensureProfile(session.user.id, session.user.email);
            }
            
            if (mounted && profile) {
              console.log("📋 Profile updated:", profile.full_name);
              setProfile(profile);
            } else {
              console.log("⚠️ No profile found after auth change");
              setProfile(null);
            }
          } catch (error) {
            console.error("❌ Profile fetch error:", error);
            setProfile(null);
          }
        } else {
          console.log("👋 User signed out, clearing profile");
          setProfile(null);
        }
      }
    });

    return () => {
      console.log("🧹 Cleaning up auth subscriptions");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      setError(null);
      setIsSigningIn(true);
      setLoading(true);
      console.log("🔑 Starting sign in for:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("❌ Auth error:", error.message);
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        }
        throw error;
      }

      if (!data?.user) {
        console.error("❌ No user data received");
        throw new Error('No user data received');
      }

      console.log("✅ Sign in successful:", {
        id: data.user.id,
        email: data.user.email
      });
      
      setUser(data.user);
      
      let userProfile = await fetchUserProfile(data.user.id);
      
      if (!userProfile) {
        console.log("⚠️ No profile found after sign in, creating one");
        userProfile = await ensureProfile(data.user.id, data.user.email);
        if (!userProfile) {
          throw new Error('Failed to create user profile');
        }
      }
      
      if (userProfile) {
        console.log("📋 Profile loaded:", userProfile.full_name);
        setProfile(userProfile);
      } else {
        console.error("❌ Failed to load or create profile");
        throw new Error('Failed to load user profile');
      }

      return { user: data.user, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      console.error("❌ Sign in error:", errorMessage);
      setError(errorMessage);
      return { user: null, error: new Error(errorMessage) };
    } finally {
      setLoading(false);
      setIsSigningIn(false);
    }
  }

  async function signOut() {
    try {
      setLoading(true);
      console.log("👋 Signing out...");
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setError(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Failed to sign out');
    } finally {
      setLoading(false);
    }
  }

  // For initiating password reset flow
  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }

  // For updating password after reset
  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ 
      password: newPassword 
    });
    if (error) throw error;
  }

  const value = {
    user,
    profile,
    redirectPath,
    session,
    error,
    loading: loading || isSigningIn,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    setRedirectPath
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}