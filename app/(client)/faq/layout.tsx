import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'FAQ - Câu hỏi thường gặp',
    description: 'Câu trả lời cho các thắc mắc phổ biến về sản phẩm, thanh toán, license, hỗ trợ kỹ thuật và chính sách tại Shop Web rẻ.',
    keywords: ['faq', 'câu hỏi thường gặp', 'help', 'support', 'hướng dẫn'],
    openGraph: {
        title: 'FAQ - Câu hỏi thường gặp | Shop Web rẻ',
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
