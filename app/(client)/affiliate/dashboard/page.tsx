import type { Metadata } from 'next';
import AffiliateDashboardPage from './DashboardContent';

export const metadata: Metadata = {
    title: 'Dashboard Đối Tác Giới Thiệu',
    description: 'Quản lý kênh đối tác giới thiệu - theo dõi link, lead tư vấn, ghi nhận đối tác và lịch sử đối soát.',
    openGraph: {
        title: 'Dashboard Đối Tác Giới Thiệu | Web Giá Rẻ - Portfolio',
        description: 'Theo dõi link giới thiệu, lead tư vấn và ghi nhận đối tác.',
    },
};

export default function Page() {
    return <AffiliateDashboardPage />;
}
