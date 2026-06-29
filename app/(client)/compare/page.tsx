import { Metadata } from 'next';
import ComparePage from './CompareContent';
import { buildSeoMetadata, seoKeywords } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'So sánh giao diện website và template trước khi mua',
    description: 'So sánh tính năng, công nghệ, giá bán và demo giữa các template website để chọn giao diện phù hợp nhất với dự án của bạn.',
    path: '/compare',
    keywords: seoKeywords.compare,
    ogTitle: 'So sánh template website | Shop Web rẻ',
});

export default function Page() {
    return <ComparePage />;
}
