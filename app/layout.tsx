import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import './animations.css';
import './nprogress.css';
import Providers from './providers';
import { NavigationProgress } from '@/components/layout';
import { getSiteUrl, getSocialImageUrl } from '@/lib/site-url';
import { seoKeywords } from '@/lib/seo';

const siteUrl = getSiteUrl();
const socialImageUrl = getSocialImageUrl();

const organizationSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Web Giá Rẻ - Portfolio',
    url: siteUrl,
    logo: `${siteUrl}/logo_webgiare_display.webp`,
    email: 'mailto:veutong961@gmail.com',
    telephone: '+84971386588',
    sameAs: [
      'https://www.facebook.com/Ltvinh212',
      'https://www.youtube.com/@VINHDEV_0212',
      'https://www.instagram.com/luongvinh_0212?igsh=MWxtM2RlNm16ZjM2MA==',
      'https://www.linkedin.com/in/vinh-l%C6%B0%C6%A1ng-th%E1%BA%BF-69640734b?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    ],
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
    name: 'Web Giá Rẻ - Portfolio',
    url: siteUrl,
    inLanguage: 'vi-VN',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/products?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
];

export const metadata: Metadata = {
  title: {
    default: 'Web Giá Rẻ - Portfolio giao diện website, landing page và dự án web chuyên nghiệp',
    template: '%s | Web Giá Rẻ - Portfolio',
  },
  description:
    'Portfolio giao diện website, landing page, template, UI kit và dự án web chuyên nghiệp. Xem demo, tham khảo mẫu phù hợp và nhận tư vấn triển khai.',
  keywords: seoKeywords.home,
  authors: [{ name: 'Lương Thế Vinh' }],
  creator: 'Web Giá Rẻ - Portfolio',
  publisher: 'Web Giá Rẻ - Portfolio',
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
    siteName: 'Web Giá Rẻ - Portfolio',
    title: 'Web Giá Rẻ - Portfolio giao diện website, landing page và dự án web chuyên nghiệp',
    description:
      'Portfolio giao diện website, landing page, template, UI kit và dự án web cho thị trường Việt Nam. Xem demo và nhận tư vấn theo nhu cầu.',
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: 'Web Giá Rẻ - Portfolio giao diện website, landing page và dự án web chuyên nghiệp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web Giá Rẻ - Portfolio giao diện website, landing page và dự án web chuyên nghiệp',
    description:
      'Tham khảo portfolio giao diện website, landing page, template và UI kit chuyên nghiệp. Xem demo và nhận tư vấn triển khai.',
    images: [socialImageUrl],
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="relative">
        <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 opacity-50 blur-xl" />
        <div className="relative h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-orange-600" />
      </div>
      <p className="mt-6 animate-pulse bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 bg-clip-text text-lg font-bold text-transparent">
        Web Giá Rẻ - Portfolio
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
      <body className="bg-slate-50 font-sans antialiased" suppressHydrationWarning>
        <NavigationProgress />
        <Providers>
          <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
        </Providers>
      </body>
    </html>
  );
}
