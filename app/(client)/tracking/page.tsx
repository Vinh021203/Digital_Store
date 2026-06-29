import type { Metadata } from 'next';
import TrackingContent from './TrackingContent';
import { buildSeoMetadata } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'Tra cứu đơn hàng',
    description: 'Tra cứu trạng thái thanh toán, giấy phép và quyền tải sản phẩm số tại Shop Web rẻ.',
    path: '/tracking',
    noIndex: true,
});

export default function TrackingPage() {
    return <TrackingContent />;
}
