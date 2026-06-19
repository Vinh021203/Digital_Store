import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Wishlist - Sản phẩm yêu thích',
    description: 'Danh sách giao diện website yêu thích của bạn. Lưu và theo dõi các sản phẩm quan tâm để mua sau.',
    keywords: ['wishlist', 'yêu thích', 'saved products', 'favorites'],
    openGraph: {
        title: 'Wishlist - Sản phẩm yêu thích | Shop Web rẻ',
        description: 'Danh sách sản phẩm yêu thích của bạn',
    },
    robots: {
        index: false,
        follow: true,
    },
};

export default function WishlistLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
