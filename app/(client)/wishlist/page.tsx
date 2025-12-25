import { Metadata } from 'next';
import WishlistPage from './WishlistContent';

export const metadata: Metadata = {
    title: 'Sản phẩm yêu thích | DigitalMart',
    description: 'Danh sách sản phẩm yêu thích của bạn - Lưu giữ những tài nguyên tuyệt vời',
    openGraph: {
        title: 'Sản phẩm yêu thích | DigitalMart',
        description: 'Danh sách sản phẩm yêu thích của bạn - Lưu giữ những tài nguyên tuyệt vời',
    }
};

export default function Page() {
    return <WishlistPage />;
}
