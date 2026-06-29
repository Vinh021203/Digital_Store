import { Metadata } from 'next';
import AIRecommendationPage from './AIRecommendationContent';
import { buildSeoMetadata, seoKeywords } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'AI tư vấn giao diện website theo nhu cầu và ngân sách',
    description: 'Dùng AI để tìm template website, landing page, UI kit hoặc dashboard phù hợp với ngành nghề, công nghệ và ngân sách của bạn.',
    path: '/ai-recommendation',
    keywords: seoKeywords.aiRecommendation,
    ogTitle: 'AI tư vấn chọn template website | Shop Web rẻ',
});

export default function Page() {
    return <AIRecommendationPage />;
}
