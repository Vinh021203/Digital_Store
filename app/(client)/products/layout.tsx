import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sản phẩm - DigitalMart',
    description: 'Khám phá kho sản phẩm số đa dạng: Themes, Templates, Landing Pages, UI Kits, Mini Apps. Chất lượng cao, giá cạnh tranh, hỗ trợ tận tâm.',
    keywords: ['themes', 'templates', 'landing pages', 'ui kits', 'wordpress themes', 'react templates', 'figma ui kits', 'sản phẩm số'],
    openGraph: {
        title: 'Sản phẩm số chuyên nghiệp | DigitalMart',
        description: 'Khám phá hàng ngàn sản phẩm số chất lượng cao cho dự án của bạn',
        images: ['/og-products.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Sản phẩm số chuyên nghiệp | DigitalMart',
        description: 'Khám phá hàng ngàn sản phẩm số chất lượng cao',
    },
};

export default function ProductsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
