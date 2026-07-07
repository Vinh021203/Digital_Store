import type { Metadata } from 'next';
import { buildSeoMetadata, seoKeywords } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'Portfolio giao diện website và landing page',
    description: 'Danh sách giao diện website, landing page, UI kit, dashboard và dự án web mẫu dành cho cá nhân, doanh nghiệp và agency tại Việt Nam.',
    path: '/products',
    keywords: seoKeywords.products,
    ogTitle: 'Portfolio giao diện website chuyên nghiệp | Web Giá Rẻ - Portfolio',
});

export default function ProductsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
