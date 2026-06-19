import { Metadata } from 'next';
import AIRecommendationPage from './AIRecommendationContent';

export const metadata: Metadata = {
    title: 'AI Gợi ý sản phẩm',
    description: 'Để AI giúp bạn tìm giao diện website phù hợp nhất với dự án của bạn',
    alternates: {
        canonical: '/ai-recommendation',
    },
    openGraph: {
        type: 'website',
        url: '/ai-recommendation',
        title: 'AI Gợi ý sản phẩm | Shop Web rẻ',
        description: 'Để AI giúp bạn tìm giao diện website phù hợp nhất với dự án của bạn',
        images: ['/thumbnail.webp'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AI Gợi ý giao diện | Shop Web rẻ',
        description: 'Tìm giao diện website phù hợp theo nhu cầu, công nghệ và ngân sách.',
        images: ['/thumbnail.webp'],
    },
};

export default function Page() {
    return <AIRecommendationPage />;
}
