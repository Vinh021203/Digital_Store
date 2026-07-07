import type { Metadata } from 'next';
import AffiliatePage from './AffiliateContent';
import { buildSeoMetadata, seoKeywords } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'Đối tác giới thiệu dự án website, landing page và mẫu demo',
    description: 'Tham gia kênh đối tác giới thiệu của Web Giá Rẻ - Portfolio. Chia sẻ mẫu demo, ghi nhận lead tư vấn và đối soát quyền lợi thủ công theo dự án xác nhận.',
    path: '/affiliate',
    keywords: seoKeywords.affiliate,
    ogTitle: 'Đối tác giới thiệu dự án website | Web Giá Rẻ - Portfolio',
});

export default function Page() {
    return <AffiliatePage />;
}
