import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Giỏ hàng',
    description: 'Xem giỏ hàng và thanh toán các sản phẩm số đã chọn. An toàn, nhanh chóng với nhiều phương thức thanh toán.',
    openGraph: {
        title: 'Giỏ hàng | DigitalMart',
        description: 'Hoàn tất đơn hàng của bạn',
    },
    robots: {
        index: false, // Don't index cart page
        follow: true,
    },
};

export default function CartLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
