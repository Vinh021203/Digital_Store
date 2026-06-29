import { Metadata } from 'next';
import BlogPage from './BlogContent';
import { buildSeoMetadata, seoKeywords } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'Blog thiết kế website, landing page và template',
    description: 'Kiến thức chọn giao diện website, tối ưu landing page, UI/UX, template HTML/CSS/JS, React, Next.js và kinh nghiệm triển khai web.',
    path: '/blog',
    keywords: seoKeywords.blog,
    ogTitle: 'Blog thiết kế website và template | Shop Web rẻ',
});

export default function Page() {
    return <BlogPage />;
}
