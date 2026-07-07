import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cộng đồng - Kết nối & Chia sẻ',
    description: 'Cộng đồng developer & designer Việt Nam. Chia sẻ kiến thức, kết nối và học hỏi cùng nhau về thiết kế web, lập trình và giao diện website.',
    keywords: ['community', 'developer community', 'designer community', 'forum', 'thảo luận', 'chia sẻ kiến thức', 'cộng đồng lập trình'],
    alternates: {
        canonical: '/community',
    },
    openGraph: {
        title: 'Cộng đồng Developer & Designer | Web Giá Rẻ - Portfolio',
        description: 'Nơi kết nối và chia sẻ kiến thức của cộng đồng developer & designer',
        url: '/community',
        images: ['/thumbnail.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Cộng đồng Developer & Designer | Web Giá Rẻ - Portfolio',
        description: 'Nơi kết nối và chia sẻ kiến thức',
        images: ['/thumbnail.jpg'],
    },
};

export default function CommunityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
