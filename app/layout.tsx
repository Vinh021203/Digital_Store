import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import './animations.css';
import './nprogress.css';
import Providers from './providers';
import { NavigationProgress } from '@/components/layout';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://martdigitalhub.vercel.app';

export const metadata: Metadata = {
    title: {
        default: 'DigitalMart - Marketplace Template, Theme và Sản Phẩm Số',
        template: '%s | DigitalMart',
    },
    description: 'Marketplace sản phẩm số chất lượng cao. Mua template, theme, landing page, UI kit, dashboard và source code để triển khai dự án chuyên nghiệp nhanh hơn.',
    keywords: ['themes', 'templates', 'landing pages', 'ui kits', 'dashboard template', 'figma', 'wordpress', 'react', 'nextjs', 'digital products', 'sản phẩm số'],
    authors: [{ name: 'DigitalMart Team' }],
    creator: 'DigitalMart',
    publisher: 'DigitalMart',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL(siteUrl),
    alternates: {
        canonical: '/',
    },
    openGraph: {
        type: 'website',
        locale: 'vi_VN',
        url: siteUrl,
        siteName: 'DigitalMart',
        title: 'DigitalMart - Marketplace Template, Theme và Sản Phẩm Số',
        description: 'Mua template, theme, landing page, UI kit và dashboard chất lượng cao. Xem demo trước khi mua, tải file nhanh.',
        images: [
            {
                url: '/og-digitalmart-marketplace.png',
                width: 1200,
                height: 630,
                alt: 'DigitalMart - Marketplace template, theme và UI kit',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'DigitalMart - Marketplace Template, Theme và Sản Phẩm Số',
        description: 'Mua template, theme, landing page, UI kit và dashboard chất lượng cao.',
        images: ['/og-digitalmart-marketplace.webp'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/favicon.png',
        shortcut: '/favicon.png',
        apple: '/icon.png',
    },
};

// Loading fallback for Suspense
function LoadingFallback() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
            </div>
            <p className="mt-6 text-lg font-bold bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 bg-clip-text text-transparent animate-pulse">
                DigitalMart
            </p>
        </div>
    );
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi">
            <head>
                {/* Preconnect to critical origins for faster loading */}
                <link rel="preconnect" href="https://enxndlrdqotqaoatjkvo.supabase.co" />
                <link rel="dns-prefetch" href="https://enxndlrdqotqaoatjkvo.supabase.co" />
                <link rel="preconnect" href="https://images.unsplash.com" />
                <link rel="dns-prefetch" href="https://images.unsplash.com" />
            </head>
            <body className="font-sans antialiased bg-slate-50" suppressHydrationWarning>
                <NavigationProgress />
                <Providers>
                    <Suspense fallback={<LoadingFallback />}>
                        {children}
                    </Suspense>
                </Providers>
            </body>
        </html>
    );
}
