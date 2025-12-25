import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Về chúng tôi',
    description: 'DigitalMart - Marketplace sản phẩm số hàng đầu Việt Nam. Cung cấp themes, templates, UI kits chất lượng cao cho developer và designer.',
    keywords: ['về chúng tôi', 'about us', 'digital marketplace vietnam', 'công ty'],
    openGraph: {
        title: 'Về chúng tôi | DigitalMart',
        description: 'Marketplace sản phẩm số hàng đầu Việt Nam',
        type: 'website',
    },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
