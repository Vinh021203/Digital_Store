import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Đối tác giới thiệu dự án website',
    description: 'Kênh đối tác giới thiệu khách cần tư vấn giao diện website, landing page, dashboard, portfolio và dự án web.',
    keywords: ['đối tác giới thiệu website', 'referral partner website', 'giới thiệu khách tư vấn website', 'landing page', 'dự án web'],
    alternates: {
        canonical: '/affiliate',
    },
    openGraph: {
        title: 'Đối tác giới thiệu dự án website | Web Giá Rẻ - Portfolio',
        description: 'Giới thiệu khách cần tư vấn website, landing page và dự án web.',
        url: '/affiliate',
        images: ['/thumbnail.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Đối tác giới thiệu | Web Giá Rẻ - Portfolio',
        description: 'Giới thiệu khách cần tư vấn website, landing page và dự án web.',
        images: ['/thumbnail.jpg'],
    },
};

export default function AffiliateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
