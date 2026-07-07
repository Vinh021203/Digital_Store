import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Wishlist - Mẫu yêu thích',
    description: 'Danh sách giao diện website yêu thích của bạn. Lưu và theo dõi các mẫu quan tâm để tham khảo sau.',
    keywords: ['wishlist', 'yêu thích', 'saved products', 'favorites'],
    openGraph: {
        title: 'Wishlist - Mẫu yêu thích | Web Giá Rẻ - Portfolio',
        description: 'Danh sách mẫu yêu thích của bạn',
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
