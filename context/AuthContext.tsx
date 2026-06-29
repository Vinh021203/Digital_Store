'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';

interface MappedUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
  cover_image?: string | null;
  phone?: string | null;
  address?: string | null;
  profile_text_color?: string | null;
  role: 'user' | 'admin';
  isAffiliate: boolean;
  affiliateCode?: string;
}

interface AuthContextType {
  user: MappedUser | null;
  logout: () => Promise<void>;
  registerAffiliate: () => Promise<{ error: Error | null }>;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const { user, profile, signOut, loading, registerAffiliate } = useSupabaseAuth();

  const mappedUser = useMemo<MappedUser | null>(() => {
    if (!user || !profile) return null;

    const name = profile.name || user.email || 'User';
    const email = profile.email || user.email || '';

    return {
      id: user.id,
      email,
      name,
      avatar:
        profile.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          name || email || 'User',
        )}`,
      cover_image: profile.cover_image ?? null,
      phone: profile.phone ?? null,
      address: profile.address ?? null,
      profile_text_color: profile.profile_text_color ?? null,
      role: profile.role === 'admin' ? 'admin' : 'user',
      isAffiliate: profile.is_affiliate ?? false,
      affiliateCode: profile.affiliate_code,
    };
  }, [
    user?.id,
    user?.email,
    profile?.email,
    profile?.name,
    profile?.avatar,
    profile?.cover_image,
    profile?.phone,
    profile?.address,
    profile?.profile_text_color,
    profile?.role,
    profile?.is_affiliate,
    profile?.affiliate_code,
  ]);

  const isAdmin = mappedUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user: mappedUser,
        logout: signOut,
        registerAffiliate,
        isAdmin,
        isLoading: loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
