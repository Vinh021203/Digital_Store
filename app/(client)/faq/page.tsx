import type { Metadata } from 'next';
import FAQContent from './FAQContent';
import { buildSeoMetadata, seoKeywords } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'Câu hỏi thường gặp khi chọn template website',
    description: 'Giải đáp về cách chọn giao diện website, xem demo, license, cập nhật phiên bản và hỗ trợ sản phẩm tại Shop Web rẻ.',
    path: '/faq',
    keywords: seoKeywords.faq,
    ogTitle: 'FAQ chọn template website | Shop Web rẻ',
});

export default function FAQPage() {
    return <FAQContent />;
}
