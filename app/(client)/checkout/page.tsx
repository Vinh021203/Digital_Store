import { Metadata } from 'next';
import CheckoutPage from './CheckoutContent';

export const metadata: Metadata = {
    title: 'Thanh toán',
    description: 'Hoàn tất đơn hàng của bạn - Thanh toán an toàn và bảo mật',
    robots: {
        index: false,
        follow: false,
    },
    openGraph: {
        title: 'Thanh toán | DigitalMart',
        description: 'Hoàn tất đơn hàng của bạn - Thanh toán an toàn và bảo mật',
    }
};

export default function Page() {
    return <CheckoutPage />;
}
