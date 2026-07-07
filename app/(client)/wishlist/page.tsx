import { Metadata } from 'next';
import WishlistPage from './WishlistContent';

export const metadata: Metadata = {
    title: 'Mẫu yêu thích',
    description: 'Danh sách mẫu giao diện bạn đã lưu để tham khảo demo và gửi nhu cầu tư vấn khi cần.',
    robots: {
        index: false,
        follow: false,
    },
    openGraph: {
        title: 'Mẫu yêu thích | Web Giá Rẻ - Portfolio',
        description: 'Danh sách mẫu giao diện bạn đã lưu để tham khảo demo và gửi nhu cầu tư vấn khi cần.',
    }
};

export default function Page() {
    return <WishlistPage />;
}
