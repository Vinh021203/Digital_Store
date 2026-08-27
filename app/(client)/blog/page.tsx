import { Metadata } from 'next';
import BlogPage from './BlogContent';
import { buildSeoMetadata, seoKeywords } from '@/lib/seo';
import { getBlogPagePosts } from '@/lib/publicContentData';

export const metadata: Metadata = buildSeoMetadata({
    title: 'Blog thiết kế website, landing page và triển khai dự án web',
    description: 'Kiến thức chọn giao diện website, tối ưu landing page, UI/UX, template HTML/CSS/JS, React, Next.js và kinh nghiệm triển khai dự án web thực tế.',
    path: '/blog',
    keywords: seoKeywords.blog,
    ogTitle: 'Blog thiết kế website và landing page | Web Giá Rẻ - Portfolio',
});

export default async function Page() {
    const posts = await getBlogPagePosts();
    return <BlogPage initialPosts={posts} />;
}
