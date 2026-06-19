import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import './animations.css';
import './nprogress.css';
import Providers from './providers';
import { NavigationProgress } from '@/components/layout';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shopwebre.vn';
const organizationSchema = [
    {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Shop Web rẻ',
        url: siteUrl,
        logo: `${siteUrl}/logo_webgiare_display.webp`,
        email: 'mailto:veutong961@gmail.com',
        telephone: '+84971386588',
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Hạ Long',
            addressRegion: 'Quảng Ninh',
            addressCountry: 'VN',
        },
    },
    {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Shop Web rẻ',
        url: siteUrl,
        inLanguage: 'vi-VN',
        potentialAction: {
            '@type': 'SearchAction',
            target: `${siteUrl}/products?search={search_term_string}`,
            'query-input': 'required name=search_term_string',
        },
    },
];

const beVietnamPro = Be_Vietnam_Pro({
    subsets: ['latin', 'vietnamese'],
    weight: ['400', '500', '600', '700', '800', '900'],
    display: 'swap',
    variable: '--font-be-vietnam-pro',
});

export const metadata: Metadata = {
    title: {
        default: 'Shop Web rẻ - Giao diện website, template và landing page',
        template: '%s | Shop Web rẻ',
    },
    description: 'Mua giao diện website, template, landing page, UI kit và dashboard chất lượng cao. Xem demo trước khi mua, tải file nhanh, hỗ trợ tận tâm.',
    keywords: [
        'shop web rẻ',
        'mua giao diện website',
        'giao diện website',
        'giao diện website bán hàng',
        'template website',
        'theme website',
        'landing page',
        'landing page bán hàng',
        'ui kit',
        'dashboard template',
        'source code website',
        'mẫu website đẹp',
    ],
    authors: [{ name: 'Đội ngũ Shop Web rẻ' }],
    creator: 'Shop Web rẻ',
    publisher: 'Shop Web rẻ',
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
        siteName: 'Shop Web rẻ',
        title: 'Shop Web rẻ - Giao diện website, template và landing page',
        description: 'Kho giao diện website, template, landing page, UI kit và dashboard chất lượng cao cho thị trường Việt Nam.',
        images: [
            {
                url: '/thumbnail.webp',
                width: 1200,
                height: 630,
                alt: 'Shop Web rẻ - Kho giao diện website, template và landing page',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Shop Web rẻ - Giao diện website, template và landing page',
        description: 'Mua giao diện website, template, landing page và UI kit chất lượng cao. Xem demo trước khi mua và tải file nhanh.',
        images: ['/thumbnail.webp'],
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

function LoadingFallback() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
            </div>
            <p className="mt-6 text-lg font-bold bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 bg-clip-text text-transparent animate-pulse">
                Shop Web rẻ
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
                <link rel="preconnect" href="https://enxndlrdqotqaoatjkvo.supabase.co" />
                <link rel="dns-prefetch" href="https://enxndlrdqotqaoatjkvo.supabase.co" />
                <link rel="preconnect" href="https://images.unsplash.com" />
                <link rel="dns-prefetch" href="https://images.unsplash.com" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
                />
            </head>
            <body className={`${beVietnamPro.variable} font-sans antialiased bg-slate-50`} suppressHydrationWarning>
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
