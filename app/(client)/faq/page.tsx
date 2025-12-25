import { Metadata } from 'next';
import FAQContent from './FAQContent';

export const metadata: Metadata = {
    title: 'Câu hỏi thường gặp (FAQ) | DigitalMart',
    description: 'Tìm câu trả lời cho các thắc mắc về sản phẩm, thanh toán, license và hỗ trợ tại DigitalMart',
    openGraph: {
        title: 'Câu hỏi thường gặp (FAQ) | DigitalMart',
        description: 'Tìm câu trả lời cho các thắc mắc về sản phẩm, thanh toán, license và hỗ trợ tại DigitalMart',
    }
};

export default function FAQPage() {
    return <FAQContent />;
}
