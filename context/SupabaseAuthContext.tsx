'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';
import { logUserLogin, logUserLogout, logLoginFailed, createActivityLog } from '@/lib/activityLogs';
import { createWelcomeNotification } from '@/lib/notifications';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  cover_image?: string;
  role: 'user' | 'seller' | 'admin';
  is_affiliate: boolean;
  affiliate_code?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

interface SupabaseAuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithGithub: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<Omit<UserProfile, 'id' | 'email' | 'role' | 'created_at'>>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  registerAffiliate: () => Promise<{ error: Error | null }>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

interface SupabaseAuthProviderProps {
  children: ReactNode;
}

export function SupabaseAuthProvider({ children }: SupabaseAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  const supabase = getSupabaseClient();

  useEffect(() => {
    setIsConfigured(supabase !== null);
    if (!supabase) setLoading(false);
  }, [supabase]);

  const fetchProfile = useCallback(
    async (userId: string): Promise<UserProfile | null> => {
      if (!supabase) return null;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (error) {
          console.error('Error fetching profile:', error);
          return null;
        }
        return data as UserProfile;
      } catch (err) {
        console.error('Error in fetchProfile:', err);
        return null;
      }
    },
    [supabase],
  );

  useEffect(() => {
    if (!supabase) return;

    const initAuth = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        setSession(currentSession ?? null);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const userProfile = await fetchProfile(currentSession.user.id);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, newSession: Session | null) => {
        console.log('Auth event:', event);

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          fetchProfile(newSession.user.id).then((userProfile) => {
            setProfile(userProfile);
          });
        } else {
          setProfile(null);
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signUp = async (
    email: string,
    password: string,
    name: string,
  ): Promise<{ error: Error | null }> => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role: 'user' },
        },
      });
      if (error) return { error };
      console.log('SignUp successful, user:', data.user?.id);

      // Log user registration
      if (data.user) {
        await createActivityLog({
          user_id: data.user.id,
          action: 'Create',
          entity: 'user',
          entity_name: name || email,
          details: 'Đăng ký tài khoản mới',
          severity: 'success',
        });

        // Send welcome notifications to new user
        await createWelcomeNotification(data.user.id, name);
      }

      return { error: null };
    } catch (err) {
      console.error('SignUp error:', err);
      return { error: err as Error };
    }
  };

  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ error: Error | null }> => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        // Log failed login attempt
        await logLoginFailed(email);
        return { error };
      }

      // Log successful login
      if (data.user) {
        await logUserLogin(data.user.id, data.user.email || email);
      }

      return { error: null };
    } catch (err) {
      await logLoginFailed(email);
      return { error: err as Error };
    }
  };

  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };


  const signInWithGithub = async (): Promise<{ error: Error | null }> => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    // Log logout before clearing state
    if (user) {
      await logUserLogout(user.id, profile?.name || user.email || 'User');
    }

    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateProfile = async (
    updates: Partial<Omit<UserProfile, 'id' | 'email' | 'role' | 'created_at'>>,
  ): Promise<{ error: Error | null }> => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    if (!user) return { error: new Error('Not authenticated') };
    try {
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (!error) {
        setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      }
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchProfile(user.id);
      setProfile(userProfile);
    }
  };

  // Register user as affiliate
  const registerAffiliate = async (): Promise<{ error: Error | null }> => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // Generate unique affiliate code
      const affiliateCode = `AFF${user.id.slice(0, 8).toUpperCase()}`;

      const { error } = await supabase
        .from('profiles')
        .update({
          is_affiliate: true,
          affiliate_code: affiliateCode
        })
        .eq('id', user.id);

      if (!error) {
        setProfile(prev => prev ? {
          ...prev,
          is_affiliate: true,
          affiliate_code: affiliateCode
        } : null);
      }
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const value: SupabaseAuthContextType = {
    user,
    profile,
    session,
    loading,
    isConfigured,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
    registerAffiliate,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}

export function useUser() {
  const { user, profile, loading } = useSupabaseAuth();
  return { user, profile, loading };
}

export function useSession() {
  const { session, loading } = useSupabaseAuth();
  return { session, loading };
}

export function useIsAuthenticated() {
  const { user, loading } = useSupabaseAuth();
  return { isAuthenticated: !!user, loading };
}

export function useIsAdmin() {
  const { profile, loading } = useSupabaseAuth();
  return { isAdmin: profile?.role === 'admin', loading };
}
