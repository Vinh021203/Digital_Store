import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Về chúng tôi',
    description: 'Shop Web rẻ - Kho giao diện website hàng đầu Việt Nam. Cung cấp themes, templates, UI kits chất lượng cao cho developer và designer.',
    keywords: ['về chúng tôi', 'about us', 'digital marketplace vietnam', 'công ty'],
    alternates: {
        canonical: '/about',
    },
    openGraph: {
        title: 'Về chúng tôi | Shop Web rẻ',
        description: 'Kho giao diện website hàng đầu Việt Nam',
        url: '/about',
        images: ['/thumbnail.webp'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Về chúng tôi | Shop Web rẻ',
        description: 'Kho giao diện website, template và landing page dành cho thị trường Việt Nam',
        images: ['/thumbnail.webp'],
    },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
