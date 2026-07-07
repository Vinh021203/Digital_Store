import { Metadata } from 'next';
import CartPage from './CartContent';

export const metadata: Metadata = {
    title: 'Danh sách mẫu quan tâm',
    description: 'Xem và quản lý các mẫu giao diện bạn đang quan tâm trong chế độ portfolio/demo',
    robots: {
        index: false,
        follow: false,
    },
    openGraph: {
        title: 'Danh sách mẫu quan tâm | Web Giá Rẻ - Portfolio',
        description: 'Xem và quản lý các mẫu giao diện bạn đang quan tâm trong chế độ portfolio/demo',
    }
};

export default function Page() {
    return <CartPage />;
}
