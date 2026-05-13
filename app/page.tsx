'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import HomePage from '@/components/pages/HomePage';
import { Navbar, Footer } from '@/components/layout';
import MaintenanceGuard from '@/components/layout/MaintenanceGuard';

const MobileBottomNav = dynamic(() => import('@/components/layout/MobileBottomNav'), {
    ssr: false,
    loading: () => null,
});

const FloatingWidgets = dynamic(() => import('@/components/widgets/FloatingWidgets'), {
    ssr: false,
    loading: () => null,
});

const DeferredHomeChrome = () => {
    const [showMobileNav, setShowMobileNav] = useState(false);
    const [showSupportWidget, setShowSupportWidget] = useState(false);

    useEffect(() => {
        const media = window.matchMedia('(max-width: 767px)');
        const syncMobileNav = () => setShowMobileNav(media.matches);

        syncMobileNav();
        media.addEventListener('change', syncMobileNav);

        const requestIdle = window.requestIdleCallback;
        const cancelIdle = window.cancelIdleCallback;
        const idleCallback =
            typeof requestIdle === 'function'
                ? requestIdle(() => setShowSupportWidget(true), { timeout: 12000 })
                : window.setTimeout(() => setShowSupportWidget(true), 12000);

        return () => {
            media.removeEventListener('change', syncMobileNav);
            if (typeof cancelIdle === 'function') {
                cancelIdle(idleCallback);
            } else {
                window.clearTimeout(idleCallback);
            }
        };
    }, []);

    return (
        <>
            {showMobileNav && <MobileBottomNav />}
            {showSupportWidget && <FloatingWidgets />}
        </>
    );
};

export default function Page() {
    return (
        <MaintenanceGuard>
            <Navbar />

            <main className="min-h-screen" id="main-content" role="main">
                <HomePage />
            </main>

            <Footer />

            <DeferredHomeChrome />
        </MaintenanceGuard>
    );
}
