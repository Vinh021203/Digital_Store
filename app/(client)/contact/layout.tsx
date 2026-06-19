import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Liên hệ - Hỗ trợ khách hàng',
    description: 'Liên hệ với đội ngũ hỗ trợ Shop Web rẻ. Email, Hotline, LiveChat sẵn sàng giúp đỡ bạn 24/7.',
    keywords: ['liên hệ', 'hỗ trợ', 'contact', 'support', 'customer service'],
    alternates: {
        canonical: '/contact',
    },
    openGraph: {
        title: 'Liên hệ - Hỗ trợ khách hàng | Shop Web rẻ',
        description: 'Liên hệ với đội ngũ hỗ trợ 24/7',
        url: '/contact',
        images: ['/thumbnail.webp'],
        type: 'website',
    },
    twitter: {
        card: 'summary',
        title: 'Liên hệ | Shop Web rẻ',
        description: 'Hỗ trợ khách hàng 24/7',
        images: ['/thumbnail.webp'],
    },
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
