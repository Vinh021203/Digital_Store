'use client';

import React, { memo } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Navbar, Footer } from '@/components/layout';
import MaintenanceGuard from '@/components/layout/MaintenanceGuard';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const MobileBottomNav = dynamic(() => import('@/components/layout/MobileBottomNav'), {
  ssr: false,
  loading: () => null,
});

const FloatingWidgets = dynamic(() => import('@/components/widgets/FloatingWidgets'), {
  ssr: false,
  loading: () => null,
});

const NewsletterPopup = dynamic(() => import('@/components/marketing/NewsletterPopup'), {
  ssr: false,
  loading: () => null,
});

const SocialProofNotifications = dynamic(() => import('@/components/marketing/SocialProofNotifications'), {
  ssr: false,
  loading: () => null,
});

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout = ({ children }: ClientLayoutProps) => {
  const pathname = usePathname();

  // Hide navbar/footer on community and affiliate dashboard pages
  const isFullscreenPage = pathname === '/community' || pathname === '/affiliate' || pathname === '/profile/affiliate' || pathname === '/affiliate/dashboard';

  return (
    <MaintenanceGuard>
      <div className="min-h-screen flex flex-col">
        {!isFullscreenPage && <Navbar />}

        <main className="flex-1" id="main-content" role="main">
          <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
            {children}
          </ErrorBoundary>
        </main>

        {!isFullscreenPage && <Footer />}
      </div>

      {!isFullscreenPage && <MobileBottomNav />}
      <FloatingWidgets />
      {!isFullscreenPage && <NewsletterPopup />}
      {!isFullscreenPage && <SocialProofNotifications />}
    </MaintenanceGuard>
  );
};

export default memo(ClientLayout);

