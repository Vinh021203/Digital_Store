import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Chương trình Affiliate - Kiếm tiền Online',
    description: 'Tham gia chương trình Affiliate Shop Web rẻ, kiếm hoa hồng lên đến 30% cho mỗi đơn hàng. Công cụ marketing đầy đủ, thanh toán nhanh chóng.',
    keywords: ['affiliate program', 'kiếm tiền online', 'affiliate marketing', 'hoa hồng', 'passive income', 'kiếm tiền thụ động'],
    alternates: {
        canonical: '/affiliate',
    },
    openGraph: {
        title: 'Chương trình Affiliate - Kiếm đến 30% hoa hồng | Shop Web rẻ',
        description: 'Tham gia Affiliate, kiếm hoa hồng lên đến 30% mỗi đơn hàng',
        url: '/affiliate',
        images: ['/thumbnail.webp'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Chương trình Affiliate | Shop Web rẻ',
        description: 'Kiếm hoa hồng lên đến 30% mỗi đơn hàng',
        images: ['/thumbnail.webp'],
    },
};

export default function AffiliateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
