import { Metadata } from 'next';
import FAQContent from './FAQContent';

export const metadata: Metadata = {
    title: 'Câu hỏi thường gặp (FAQ)',
    description: 'Tìm câu trả lời cho các thắc mắc về sản phẩm, thanh toán, license và hỗ trợ tại Shop Web rẻ',
    alternates: {
        canonical: '/faq',
    },
    openGraph: {
        type: 'website',
        url: '/faq',
        title: 'Câu hỏi thường gặp (FAQ) | Shop Web rẻ',
        description: 'Tìm câu trả lời cho các thắc mắc về sản phẩm, thanh toán, license và hỗ trợ tại Shop Web rẻ',
        images: ['/thumbnail.jpg'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Câu hỏi thường gặp | Shop Web rẻ',
        description: 'Giải đáp về giao diện, thanh toán, tải file, license và hỗ trợ.',
        images: ['/thumbnail.jpg'],
    },
};

export default function FAQPage() {
    return <FAQContent />;
}
