import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Liên hệ - Hỗ trợ khách hàng',
    description: 'Liên hệ Web Giá Rẻ - Portfolio để được tư vấn mẫu demo, license và nhu cầu triển khai trong ngày làm việc.',
    keywords: ['liên hệ', 'hỗ trợ', 'contact', 'support', 'customer service'],
    alternates: {
        canonical: '/contact',
    },
    openGraph: {
        title: 'Liên hệ - Hỗ trợ khách hàng | Web Giá Rẻ - Portfolio',
        description: 'Tư vấn mẫu demo và nhu cầu triển khai 24/7',
        url: '/contact',
        images: ['/thumbnail.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary',
        title: 'Liên hệ | Web Giá Rẻ - Portfolio',
        description: 'Hỗ trợ khách hàng 24/7',
        images: ['/thumbnail.jpg'],
    },
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
