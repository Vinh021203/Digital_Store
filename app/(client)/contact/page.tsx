import { Metadata } from 'next';
import ContactContent from './ContactContent';

export const metadata: Metadata = {
    title: 'Liên hệ',
    description: 'Liên hệ với Shop Web rẻ - Đội ngũ hỗ trợ 24/7 sẵn sàng giải đáp mọi thắc mắc của bạn',
    alternates: {
        canonical: '/contact',
    },
    openGraph: {
        type: 'website',
        url: '/contact',
        title: 'Liên hệ | Shop Web rẻ',
        description: 'Liên hệ với Shop Web rẻ - Đội ngũ hỗ trợ 24/7 sẵn sàng giải đáp mọi thắc mắc của bạn',
        images: ['/thumbnail.jpg'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Liên hệ | Shop Web rẻ',
        description: 'Liên hệ đội ngũ hỗ trợ Shop Web rẻ.',
        images: ['/thumbnail.jpg'],
    },
};

export default function ContactPage() {
    return <ContactContent />;
}
