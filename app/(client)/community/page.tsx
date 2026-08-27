import { Metadata } from 'next';
import CommunityPage from './CommunityContent';
import { buildSeoMetadata, seoKeywords } from '@/lib/seo';
import { getCommunityPagePosts } from '@/lib/publicContentData';

export const metadata: Metadata = buildSeoMetadata({
    title: 'Cộng đồng thiết kế website và developer Việt Nam',
    description: 'Tham gia cộng đồng Web Giá Rẻ - Portfolio để chia sẻ template website, hỏi đáp lập trình, UI/UX và kinh nghiệm triển khai dự án web.',
    path: '/community',
    keywords: seoKeywords.community,
    ogTitle: 'Cộng đồng thiết kế website | Web Giá Rẻ - Portfolio',
});

export default async function Page() {
    const posts = await getCommunityPagePosts();
    return <CommunityPage initialPosts={posts} />;
}
