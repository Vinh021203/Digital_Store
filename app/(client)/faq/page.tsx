import type { Metadata } from 'next';
import FAQContent from './FAQContent';

export const metadata: Metadata = {
    title: 'Câu hỏi thường gặp',
    description: 'Giải đáp về giao diện website, thanh toán, tải file, giấy phép và hỗ trợ sản phẩm tại Shop Web rẻ.',
    alternates: {
        canonical: '/faq',
    },
    openGraph: {
        type: 'website',
        url: '/faq',
        title: 'Câu hỏi thường gặp | Shop Web rẻ',
        description: 'Tìm câu trả lời về sản phẩm, thanh toán, tải file và giấy phép tại Shop Web rẻ.',
        images: ['/thumbnail.jpg'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Câu hỏi thường gặp | Shop Web rẻ',
        description: 'Giải đáp nhanh trước và sau khi mua sản phẩm số.',
        images: ['/thumbnail.jpg'],
    },
};

export default function FAQPage() {
    return <FAQContent />;
}
