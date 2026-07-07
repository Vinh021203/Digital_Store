import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog - Kiến thức & Tin tức',
    description: 'Cập nhật kiến thức, hướng dẫn, tips & tricks về thiết kế web, phát triển ứng dụng, UI/UX và digital marketing từ Web Giá Rẻ - Portfolio.',
    keywords: ['blog design', 'web development', 'ui ux', 'tutorial', 'tips tricks', 'digital marketing', 'hướng dẫn thiết kế'],
    alternates: {
        canonical: '/blog',
    },
    openGraph: {
        title: 'Blog - Kiến thức & Tin tức | Web Giá Rẻ - Portfolio',
        description: 'Kiến thức, hướng dẫn và tips hữu ích về thiết kế & phát triển web',
        url: '/blog',
        images: ['/thumbnail.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Blog - Kiến thức & Tin tức | Web Giá Rẻ - Portfolio',
        description: 'Kiến thức, hướng dẫn và tips hữu ích',
        images: ['/thumbnail.jpg'],
    },
};

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
