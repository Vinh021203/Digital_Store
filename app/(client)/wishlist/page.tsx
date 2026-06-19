import { Metadata } from 'next';
import WishlistPage from './WishlistContent';

export const metadata: Metadata = {
    title: 'Sản phẩm yêu thích',
    description: 'Danh sách sản phẩm yêu thích của bạn - Lưu giữ những tài nguyên tuyệt vời',
    robots: {
        index: false,
        follow: false,
    },
    openGraph: {
        title: 'Sản phẩm yêu thích | Shop Web rẻ',
        description: 'Danh sách sản phẩm yêu thích của bạn - Lưu giữ những tài nguyên tuyệt vời',
    }
};

export default function Page() {
    return <WishlistPage />;
}
