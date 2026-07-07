import { Metadata } from 'next';
import AffiliatePage from './AffiliateContent';
import { buildSeoMetadata, seoKeywords } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'Chương trình đối tác giới thiệu giao diện website',
    description: 'Tham gia chương trình đối tác của Web Giá Rẻ - Portfolio, giới thiệu khách cần tư vấn giao diện website, landing page và dự án web.',
    path: '/affiliate',
    keywords: seoKeywords.affiliate,
    ogTitle: 'Chương trình đối tác giới thiệu giao diện website | Web Giá Rẻ - Portfolio',
});

export default function Page() {
    return <AffiliatePage />;
}
