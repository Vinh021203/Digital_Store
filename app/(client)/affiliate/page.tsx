import { Metadata } from 'next';
import AffiliatePage from './AffiliateContent';

export const metadata: Metadata = {
    title: 'Chương trình Affiliate',
    description: 'Kiếm tiền cùng Shop Web rẻ - Hoa hồng lên đến 20% cho mỗi đơn hàng thành công',
    alternates: {
        canonical: '/affiliate',
    },
    openGraph: {
        type: 'website',
        url: '/affiliate',
        title: 'Chương trình Affiliate | Shop Web rẻ',
        description: 'Kiếm tiền cùng Shop Web rẻ - Hoa hồng lên đến 20% cho mỗi đơn hàng thành công',
        images: ['/thumbnail.jpg'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Chương trình Affiliate | Shop Web rẻ',
        description: 'Giới thiệu khách hàng và nhận hoa hồng từ đơn hàng thành công.',
        images: ['/thumbnail.jpg'],
    },
};

export default function Page() {
    return <AffiliatePage />;
}
