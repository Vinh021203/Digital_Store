import type { Metadata } from 'next';
import { buildSeoMetadata, seoKeywords } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'Sản phẩm',
    description: 'Kho template website, landing page, UI kit, dashboard và source code cho dự án web tại Việt Nam.',
    path: '/products',
    keywords: seoKeywords.products,
    ogTitle: 'Kho giao diện website chuyên nghiệp | Shop Web rẻ',
});

export default function ProductsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
