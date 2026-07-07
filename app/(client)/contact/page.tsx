import type { Metadata } from 'next';
import ContactContent from './ContactContent';
import { buildSeoMetadata, seoKeywords } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'Liên hệ tư vấn giao diện website, landing page và dự án web',
    description: 'Liên hệ Lương Thế Vinh để được tư vấn giao diện website, landing page, template phù hợp, hỗ trợ chỉnh sửa hoặc triển khai dự án web.',
    path: '/contact',
    keywords: seoKeywords.contact,
    ogTitle: 'Liên hệ tư vấn giao diện website | Web Giá Rẻ - Portfolio',
});

export default function ContactPage() {
    return <ContactContent />;
}
