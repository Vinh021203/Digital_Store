import type { Metadata } from 'next';
import ContactContent from './ContactContent';
import { buildSeoMetadata, seoKeywords } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'Liên hệ tư vấn giao diện website và template',
    description: 'Liên hệ Lương Thế Vinh để được tư vấn mua giao diện website, chọn template phù hợp, hỗ trợ sản phẩm hoặc yêu cầu chỉnh sửa landing page.',
    path: '/contact',
    keywords: seoKeywords.contact,
    ogTitle: 'Liên hệ tư vấn template website | Shop Web rẻ',
});

export default function ContactPage() {
    return <ContactContent />;
}
