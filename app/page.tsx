'use client';

import React from 'react';
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

const NewsletterPopup = dynamic(() => import('@/components/marketing/NewsletterPopup'), {
    ssr: false,
    loading: () => null,
});

const SocialProofNotifications = dynamic(() => import('@/components/marketing/SocialProofNotifications'), {
    ssr: false,
    loading: () => null,
});

export default function Page() {
    return (
        <MaintenanceGuard>
            <Navbar />

            <main className="min-h-screen" id="main-content" role="main">
                <HomePage />
            </main>

            <Footer />

            <MobileBottomNav />
            <FloatingWidgets />
            <NewsletterPopup />
            <SocialProofNotifications />
        </MaintenanceGuard>
    );
}
