'use client';

import React, { memo, useEffect, useState } from 'react';
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
  const [showFloatingWidgets, setShowFloatingWidgets] = useState(false);
  const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);
  const [showSocialProof, setShowSocialProof] = useState(false);

  // Hide navbar/footer on fullscreen client pages, but keep the shared mobile
  // bottom nav available across the client area unless a page owns its own nav.
  const isFullscreenPage = pathname === '/community' || pathname === '/affiliate' || pathname === '/profile/affiliate' || pathname === '/affiliate/dashboard';
  const hasPageOwnedMobileNav = pathname === '/affiliate/dashboard';
  const canShowMarketingWidgets = !isFullscreenPage && pathname !== '/checkout';
  const canShowSocialProof =
    canShowMarketingWidgets &&
    (pathname === '/products' ||
      pathname.startsWith('/product/') ||
      pathname === '/blog' ||
      pathname.startsWith('/blog/'));

  useEffect(() => {
    setShowFloatingWidgets(false);
    setShowNewsletterPopup(false);
    setShowSocialProof(false);

    const timers: number[] = [];
    const idleIds: number[] = [];
    const requestIdle = window.requestIdleCallback;
    const cancelIdle = window.cancelIdleCallback;

    const schedule = (callback: () => void, delay: number, idleTimeout: number) => {
      if (typeof requestIdle === 'function') {
        const idleId = requestIdle(callback, { timeout: idleTimeout });
        idleIds.push(idleId);
        return;
      }

      timers.push(window.setTimeout(callback, delay));
    };

    if (canShowMarketingWidgets) {
      schedule(() => setShowFloatingWidgets(true), 9000, 12000);
    }

    if (canShowMarketingWidgets) {
      schedule(() => setShowNewsletterPopup(true), 8000, 14000);
    }

    if (canShowSocialProof) {
      timers.push(window.setTimeout(() => setShowSocialProof(true), 7000));
    }

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      if (typeof cancelIdle === 'function') {
        idleIds.forEach((idleId) => cancelIdle(idleId));
      }
    };
  }, [canShowMarketingWidgets, canShowSocialProof, pathname]);

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

      {!hasPageOwnedMobileNav && <MobileBottomNav />}
      {canShowMarketingWidgets && showFloatingWidgets && <FloatingWidgets />}
      {showNewsletterPopup && <NewsletterPopup />}
      {showSocialProof && <SocialProofNotifications />}
    </MaintenanceGuard>
  );
};

export default memo(ClientLayout);

