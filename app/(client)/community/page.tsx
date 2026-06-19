import { Metadata } from 'next';
import CommunityPage from './CommunityContent';

export const metadata: Metadata = {
    title: 'Cộng đồng',
    description: 'Tham gia cộng đồng Shop Web rẻ - Kết nối, chia sẻ và học hỏi cùng nhau',
    alternates: {
        canonical: '/community',
    },
    openGraph: {
        type: 'website',
        url: '/community',
        title: 'Cộng đồng | Shop Web rẻ',
        description: 'Tham gia cộng đồng Shop Web rẻ - Kết nối, chia sẻ và học hỏi cùng nhau',
        images: ['/thumbnail.webp'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Cộng đồng | Shop Web rẻ',
        description: 'Kết nối và chia sẻ kiến thức thiết kế, phát triển website.',
        images: ['/thumbnail.webp'],
    },
};

export default function Page() {
    return <CommunityPage />;
}
