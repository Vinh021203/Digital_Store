import { Metadata } from 'next';
import CartPage from './CartContent';

export const metadata: Metadata = {
    title: 'Giỏ hàng',
    description: 'Giỏ hàng của bạn - Xem và quản lý sản phẩm trước khi thanh toán',
    robots: {
        index: false,
        follow: false,
    },
    openGraph: {
        title: 'Giỏ hàng | DigitalMart',
        description: 'Giỏ hàng của bạn - Xem và quản lý sản phẩm trước khi thanh toán',
    }
};

export default function Page() {
    return <CartPage />;
}
