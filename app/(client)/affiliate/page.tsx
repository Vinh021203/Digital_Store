import { Metadata } from 'next';
import AffiliatePage from './AffiliateContent';

export const metadata: Metadata = {
    title: 'Chương trình Affiliate | DigitalMart',
    description: 'Kiếm tiền cùng DigitalMart - Hoa hồng lên đến 20% cho mỗi đơn hàng thành công',
    openGraph: {
        title: 'Chương trình Affiliate | DigitalMart',
        description: 'Kiếm tiền cùng DigitalMart - Hoa hồng lên đến 20% cho mỗi đơn hàng thành công',
    }
};

export default function Page() {
    return <AffiliatePage />;
}
