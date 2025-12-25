import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cộng đồng - Kết nối & Chia sẻ',
    description: 'Cộng đồng developer & designer Việt Nam. Chia sẻ kiến thức, kết nối và học hỏi cùng nhau về thiết kế web, lập trình và digital products.',
    keywords: ['community', 'developer community', 'designer community', 'forum', 'thảo luận', 'chia sẻ kiến thức', 'cộng đồng lập trình'],
    openGraph: {
        title: 'Cộng đồng Developer & Designer | DigitalMart',
        description: 'Nơi kết nối và chia sẻ kiến thức của cộng đồng developer & designer',
        images: ['/og-community.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Cộng đồng Developer & Designer | DigitalMart',
        description: 'Nơi kết nối và chia sẻ kiến thức',
    },
};

export default function CommunityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
