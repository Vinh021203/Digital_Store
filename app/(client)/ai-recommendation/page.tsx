import { Metadata } from 'next';
import AIRecommendationPage from './AIRecommendationContent';

export const metadata: Metadata = {
    title: 'AI Gợi ý sản phẩm | DigitalMart',
    description: 'Để AI giúp bạn tìm sản phẩm số phù hợp nhất với dự án của bạn',
    openGraph: {
        title: 'AI Gợi ý sản phẩm | DigitalMart',
        description: 'Để AI giúp bạn tìm sản phẩm số phù hợp nhất với dự án của bạn',
    }
};

export default function Page() {
    return <AIRecommendationPage />;
}
