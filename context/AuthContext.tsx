'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';

interface MappedUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
  cover_image?: string | null;
  phone?: string | null;
  address?: string | null;
  role: 'user' | 'seller' | 'admin';
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

  let mappedUser: MappedUser | null = null;

  if (user && profile) {
    const name = profile.name || user.email || 'User';
    const email = profile.email || user.email || '';

    mappedUser = {
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
      role: profile.role as 'user' | 'seller' | 'admin',
      isAffiliate: profile.is_affiliate ?? false,
      affiliateCode: profile.affiliate_code,
    };
  }

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
