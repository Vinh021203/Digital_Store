import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sản phẩm',
    description: 'Khám phá kho giao diện website đa dạng: Themes, Templates, Landing Pages, UI Kits, Mini Apps. Chất lượng cao, giá cạnh tranh, hỗ trợ tận tâm.',
    keywords: ['themes', 'templates', 'landing pages', 'ui kits', 'react templates', 'next.js templates', 'figma ui kits', 'giao diện website'],
    alternates: {
        canonical: '/products',
    },
    openGraph: {
        title: 'Giao diện website chuyên nghiệp | Shop Web rẻ',
        description: 'Khám phá hàng ngàn giao diện website chất lượng cao cho dự án của bạn',
        url: '/products',
        images: ['/thumbnail.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Giao diện website chuyên nghiệp | Shop Web rẻ',
        description: 'Khám phá hàng ngàn giao diện website chất lượng cao',
        images: ['/thumbnail.jpg'],
    },
};

export default function ProductsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
