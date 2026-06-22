import type { Metadata } from 'next';
import ContactContent from './ContactContent';

export const metadata: Metadata = {
    title: 'Liên hệ',
    description: 'Liên hệ trực tiếp với Lương Thế Vinh để được tư vấn giao diện website, hỗ trợ sản phẩm và kiểm tra đơn hàng tại Shop Web rẻ.',
    alternates: {
        canonical: '/contact',
    },
    openGraph: {
        type: 'website',
        url: '/contact',
        title: 'Liên hệ | Shop Web rẻ',
        description: 'Trao đổi trực tiếp về giao diện website, sản phẩm số và các yêu cầu hỗ trợ tại Shop Web rẻ.',
        images: ['/thumbnail.jpg'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Liên hệ | Shop Web rẻ',
        description: 'Liên hệ trực tiếp để được tư vấn giao diện và hỗ trợ sản phẩm.',
        images: ['/thumbnail.jpg'],
    },
};

export default function ContactPage() {
    return <ContactContent />;
}
