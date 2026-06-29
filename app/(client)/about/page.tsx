import type { Metadata } from 'next';
import AboutPage from './AboutContent';
import { buildSeoMetadata, seoKeywords } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'Giới thiệu Shop Web rẻ và Lương Thế Vinh',
    description: 'Shop Web rẻ là dự án cá nhân do Lương Thế Vinh xây dựng từ năm 2025, cung cấp giao diện website, template và mã nguồn cho người dùng Việt Nam.',
    path: '/about',
    keywords: seoKeywords.about,
    type: 'profile',
});

export default function Page() {
    return <AboutPage />;
}
