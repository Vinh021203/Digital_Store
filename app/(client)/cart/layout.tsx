import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Giỏ hàng',
    description: 'Xem giỏ hàng và thanh toán các giao diện website đã chọn. An toàn, nhanh chóng với nhiều phương thức thanh toán.',
    openGraph: {
        title: 'Giỏ hàng | Shop Web rẻ',
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
