import type { Metadata } from 'next';
import TrackingContent from './TrackingContent';
import { buildSeoMetadata } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'Tra cứu yêu cầu tư vấn và quyền truy cập mẫu',
    description: 'Tra cứu mã yêu cầu, trạng thái tư vấn, giấy phép và quyền truy cập mẫu giao diện tại Web Giá Rẻ - Portfolio.',
    path: '/tracking',
    noIndex: true,
});

export default function TrackingPage() {
    return <TrackingContent />;
}
