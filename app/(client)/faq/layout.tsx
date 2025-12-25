import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'FAQ - Câu hỏi thường gặp',
    description: 'Câu trả lời cho các thắc mắc phổ biến về sản phẩm, thanh toán, license, hỗ trợ kỹ thuật và chính sách tại DigitalMart.',
    keywords: ['faq', 'câu hỏi thường gặp', 'help', 'support', 'hướng dẫn'],
    openGraph: {
        title: 'FAQ - Câu hỏi thường gặp | DigitalMart',
        description: 'Tìm câu trả lời cho các thắc mắc phổ biến',
        type: 'website',
    },
};

export default function FAQLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
