import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Liên hệ - Hỗ trợ khách hàng',
    description: 'Liên hệ với đội ngũ hỗ trợ DigitalMart. Email, Hotline, LiveChat sẵn sàng giúp đỡ bạn 24/7.',
    keywords: ['liên hệ', 'hỗ trợ', 'contact', 'support', 'customer service'],
    openGraph: {
        title: 'Liên hệ - Hỗ trợ khách hàng | DigitalMart',
        description: 'Liên hệ với đội ngũ hỗ trợ 24/7',
        type: 'website',
    },
    twitter: {
        card: 'summary',
        title: 'Liên hệ | DigitalMart',
        description: 'Hỗ trợ khách hàng 24/7',
    },
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
