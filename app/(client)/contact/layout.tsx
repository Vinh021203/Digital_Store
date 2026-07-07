import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Liên hệ - Hỗ trợ khách hàng',
    description: 'Liên hệ với đội ngũ hỗ trợ Web Giá Rẻ - Portfolio. Email, Hotline, LiveChat sẵn sàng giúp đỡ bạn 24/7.',
    keywords: ['liên hệ', 'hỗ trợ', 'contact', 'support', 'customer service'],
    alternates: {
        canonical: '/contact',
    },
    openGraph: {
        title: 'Liên hệ - Hỗ trợ khách hàng | Web Giá Rẻ - Portfolio',
        description: 'Liên hệ với đội ngũ hỗ trợ 24/7',
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
