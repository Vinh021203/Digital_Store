'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // IMPORTANT: Wait for auth to finish loading before making redirect decision
    if (isLoading) return;

    // Only redirect if auth is done loading AND user is not admin
    if (!user || !isAdmin) {
      router.push('/login');
    }
  }, [user, isAdmin, isLoading, router]);

  // Show nothing while auth is loading (prevents flash)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  // After loading, if still no user/admin, return null (will redirect)
  if (!user || !isAdmin) return null;

  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}
