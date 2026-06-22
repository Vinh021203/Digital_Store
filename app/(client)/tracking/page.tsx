import type { Metadata } from 'next';
import TrackingContent from './TrackingContent';

export const metadata: Metadata = {
    title: 'Tra cứu đơn hàng',
    description: 'Tra cứu trạng thái thanh toán, giấy phép và quyền tải sản phẩm số tại Shop Web rẻ.',
    robots: {
        index: false,
        follow: false,
    },
    openGraph: {
        title: 'Tra cứu đơn hàng | Shop Web rẻ',
        description: 'Kiểm tra trạng thái thanh toán và quyền tải sản phẩm số tại Shop Web rẻ.',
    },
};

export default function TrackingPage() {
    return <TrackingContent />;
}
