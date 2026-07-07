import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Chương trình đối tác giới thiệu giao diện website',
    description: 'Chương trình đối tác Web Giá Rẻ - Portfolio dành cho người giới thiệu khách cần tư vấn giao diện website, landing page và dự án web.',
    keywords: ['đối tác giới thiệu website', 'affiliate giao diện website', 'giới thiệu khách tư vấn website', 'landing page', 'dự án web'],
    alternates: {
        canonical: '/affiliate',
    },
    openGraph: {
        title: 'Chương trình đối tác giới thiệu giao diện website | Web Giá Rẻ - Portfolio',
        description: 'Giới thiệu khách cần tư vấn giao diện website, landing page và dự án web',
        url: '/affiliate',
        images: ['/thumbnail.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Chương trình đối tác | Web Giá Rẻ - Portfolio',
        description: 'Giới thiệu khách cần tư vấn giao diện website, landing page và dự án web',
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
