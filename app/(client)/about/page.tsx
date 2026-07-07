import type { Metadata } from 'next';
import AboutPage from './AboutContent';
import { buildSeoMetadata, seoKeywords } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'Giới thiệu Web Giá Rẻ - Portfolio và Lương Thế Vinh',
    description: 'Web Giá Rẻ - Portfolio là dự án cá nhân do Lương Thế Vinh xây dựng, tập trung giới thiệu giao diện website, landing page, template và dự án web cho người dùng Việt Nam.',
    path: '/about',
    keywords: seoKeywords.about,
    type: 'profile',
});

export default function Page() {
    return <AboutPage />;
}
