import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    ReactNode,
} from 'react';
import { supabase } from './db';

interface AuthContextProps {
    user: any;
    profile: any;
    loading: boolean;
    session: any;
    setRedirectPath: any;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [session, setSession] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [redirectPath, setRedirectPath] = useState<string | null>(null);

    const fetchUserProfile = async (userId: string) => {
        try {
            const response = await fetch(`/api/profile?userId=${userId}`);
            const profile = await response.json();
            return profile;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    };

    const ensureProfile = async (userId: string, email: string) => {
        try {
            const response = await fetch(`/api/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, email }),
            });
            const profile = await response.json();
            return profile;
        } catch (error) {
             console.error('Error ensuring user profile:', error);
            return null;
        }
    };

    useEffect(() => {
        console.log('AuthContext Mounted');
        let mounted = true;
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
                        console.log("👤 Fetching profile after auth change:", session.user.email);
                        let profile = await fetchUserProfile(session.user.id);

                        if (!profile) {
                            console.log("⚠️ No profile found after auth change, creating one");
                            profile = await ensureProfile(session.user.id, session.user.email);
                        }

                        if (mounted && profile) {
                            console.log("📋 Profile updated:", profile.full_name);
                            setProfile(profile);
                        }
                    } catch (error) {
                        console.error("🛑 Error fetching or creating profile:", error);
                    } finally {
                        setLoading(false);
                    }
                } else {
                   setLoading(false);
                }
            }
        });
        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

// remove the extra useEffect hook.

    return (
        <AuthContext.Provider value={{ user, profile, session, loading, setRedirectPath }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
