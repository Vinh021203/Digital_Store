import type { Metadata } from 'next';
import TrackingContent from './TrackingContent';
import { buildSeoMetadata } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'Tra cứu yêu cầu và đơn hàng',
    description: 'Tra cứu mã yêu cầu, giấy phép và quyền truy cập sản phẩm số tại Shop Web rẻ.',
    path: '/tracking',
    noIndex: true,
});

export default function TrackingPage() {
    return <TrackingContent />;
}
