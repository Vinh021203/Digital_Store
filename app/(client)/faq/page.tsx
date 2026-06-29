import type { Metadata } from 'next';
import FAQContent from './FAQContent';
import { buildSeoMetadata, seoKeywords } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'Câu hỏi thường gặp khi mua template website',
    description: 'Giải đáp về cách mua giao diện website, thanh toán, tải file, license, cập nhật phiên bản và hỗ trợ sản phẩm tại Shop Web rẻ.',
    path: '/faq',
    keywords: seoKeywords.faq,
    ogTitle: 'FAQ mua template website | Shop Web rẻ',
});

export default function FAQPage() {
    return <FAQContent />;
}
