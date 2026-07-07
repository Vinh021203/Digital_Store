import { Metadata } from 'next';
import AffiliateDashboardPage from './DashboardContent';

export const metadata: Metadata = {
    title: 'Dashboard Affiliate',
    description: 'Quản lý chương trình affiliate của bạn - Theo dõi hoa hồng, referrals và rút tiền',
    openGraph: {
        title: 'Dashboard Affiliate | Web Giá Rẻ - Portfolio',
        description: 'Quản lý chương trình affiliate của bạn - Theo dõi hoa hồng, referrals và rút tiền',
    }
};

export default function Page() {
    return <AffiliateDashboardPage />;
}
