import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Chương trình Affiliate - Kiếm tiền Online',
    description: 'Tham gia chương trình Affiliate DigitalMart, kiếm hoa hồng lên đến 30% cho mỗi đơn hàng. Công cụ marketing đầy đủ, thanh toán nhanh chóng.',
    keywords: ['affiliate program', 'kiếm tiền online', 'affiliate marketing', 'hoa hồng', 'passive income', 'kiếm tiền thụ động'],
    openGraph: {
        title: 'Chương trình Affiliate - Kiếm đến 30% hoa hồng | DigitalMart',
        description: 'Tham gia Affiliate, kiếm hoa hồng lên đến 30% mỗi đơn hàng',
        images: ['/og-affiliate.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Chương trình Affiliate | DigitalMart',
        description: 'Kiếm hoa hồng lên đến 30% mỗi đơn hàng',
    },
};

export default function AffiliateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
