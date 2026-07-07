import { Metadata } from 'next';
import AIRecommendationPage from './AIRecommendationContent';
import { buildSeoMetadata, seoKeywords } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'AI tư vấn giao diện website, landing page và dự án web',
    description: 'Dùng AI để gợi ý giao diện website, landing page, UI kit, dashboard hoặc template phù hợp với ngành nghề, công nghệ và ngân sách của bạn.',
    path: '/ai-recommendation',
    keywords: seoKeywords.aiRecommendation,
    ogTitle: 'AI tư vấn chọn giao diện website | Web Giá Rẻ - Portfolio',
});

export default function Page() {
    return <AIRecommendationPage />;
}
