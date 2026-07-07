import { Metadata } from 'next';
import ComparePage from './CompareContent';
import { buildSeoMetadata, seoKeywords } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'So sánh giao diện website, landing page và template',
    description: 'So sánh tính năng, công nghệ, giá tham khảo và demo giữa các giao diện website, landing page và template để chọn mẫu phù hợp với dự án.',
    path: '/compare',
    keywords: seoKeywords.compare,
    ogTitle: 'So sánh giao diện website và landing page | Web Giá Rẻ - Portfolio',
});

export default function Page() {
    return <ComparePage />;
}
