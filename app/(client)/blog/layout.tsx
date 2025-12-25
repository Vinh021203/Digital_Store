import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog - Kiến thức & Tin tức',
    description: 'Cập nhật kiến thức, hướng dẫn, tips & tricks về thiết kế web, phát triển ứng dụng, UI/UX và digital marketing từ DigitalMart.',
    keywords: ['blog design', 'web development', 'ui ux', 'tutorial', 'tips tricks', 'digital marketing', 'hướng dẫn thiết kế'],
    openGraph: {
        title: 'Blog - Kiến thức & Tin tức | DigitalMart',
        description: 'Kiến thức, hướng dẫn và tips hữu ích về thiết kế & phát triển web',
        images: ['/og-blog.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Blog - Kiến thức & Tin tức | DigitalMart',
        description: 'Kiến thức, hướng dẫn và tips hữu ích',
    },
};

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
