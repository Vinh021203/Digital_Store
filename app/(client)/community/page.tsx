import { Metadata } from 'next';
import CommunityPage from './CommunityContent';
import { buildSeoMetadata, seoKeywords } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'Cộng đồng thiết kế website và developer Việt Nam',
    description: 'Tham gia cộng đồng Shop Web rẻ để chia sẻ template website, hỏi đáp lập trình, UI/UX và kinh nghiệm triển khai website.',
    path: '/community',
    keywords: seoKeywords.community,
    ogTitle: 'Cộng đồng thiết kế website | Shop Web rẻ',
});

export default function Page() {
    return <CommunityPage />;
}
