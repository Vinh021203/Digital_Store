import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import './animations.css';
import './nprogress.css';
import Providers from './providers';
import { NavigationProgress } from '@/components/layout';

const inter = Inter({
    subsets: ['latin', 'vietnamese'],
    variable: '--font-inter',
    display: 'swap',
});

const playfair = Playfair_Display({
    subsets: ['latin', 'vietnamese'],
    variable: '--font-playfair',
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: 'DigitalMart - Premium Digital Products Marketplace',
        template: '%s | DigitalMart',
    },
    description: 'Marketplace sản phẩm số chất lượng cao. Khám phá themes, landing pages, templates, mini apps và tools cho dự án của bạn. Download ngay!',
    keywords: ['themes', 'templates', 'landing pages', 'mini apps', 'figma', 'wordpress', 'react', 'nextjs', 'digital products', 'sản phẩm số'],
    authors: [{ name: 'DigitalMart Team' }],
    creator: 'DigitalMart',
    publisher: 'DigitalMart',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://digitalmart.vn'),
    alternates: {
        canonical: '/',
        languages: {
            'vi-VN': '/vi',
            'en-US': '/en',
        },
    },
    openGraph: {
        type: 'website',
        locale: 'vi_VN',
        alternateLocale: 'en_US',
        url: 'https://digitalmart.vn',
        siteName: 'DigitalMart - Digital Products Marketplace',
        title: 'DigitalMart - Premium Digital Products',
        description: 'Marketplace sản phẩm số hàng đầu Việt Nam. Themes, Templates, Landing Pages, Mini Apps.',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'DigitalMart - Digital Products Marketplace',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'DigitalMart - Premium Digital Products',
        description: 'Marketplace sản phẩm số hàng đầu Việt Nam. Themes, Templates, Landing Pages.',
        images: ['/og-image.jpg'],
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
    verification: {
        google: 'your-google-verification-code',
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
        <html lang="vi" className={`${inter.variable} ${playfair.variable}`}>
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
