'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || !isAdmin) {
        router.push('/login');
    }
  }, [user, isAdmin, router]);

  if (!user || !isAdmin) return null;

  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}
