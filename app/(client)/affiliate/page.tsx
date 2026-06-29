import { Metadata } from 'next';
import AffiliatePage from './AffiliateContent';
import { buildSeoMetadata, seoKeywords } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'Affiliate template website và giao diện web',
    description: 'Tham gia chương trình affiliate của Shop Web rẻ, giới thiệu khách mua template website, landing page và nhận hoa hồng từ đơn hàng thành công.',
    path: '/affiliate',
    keywords: seoKeywords.affiliate,
    ogTitle: 'Kiếm tiền với affiliate template website | Shop Web rẻ',
});

export default function Page() {
    return <AffiliatePage />;
}
