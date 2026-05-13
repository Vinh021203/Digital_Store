import { Metadata } from 'next';
import OrderSuccessPage from './OrderSuccessContent';

export const metadata: Metadata = {
    title: 'Đặt hàng thành công',
    description: 'Cảm ơn bạn đã mua hàng - Đơn hàng của bạn đã được xác nhận',
    robots: {
        index: false,
        follow: false,
    },
    openGraph: {
        title: 'Đặt hàng thành công | DigitalMart',
        description: 'Cảm ơn bạn đã mua hàng - Đơn hàng của bạn đã được xác nhận',
    }
};

export default function Page() {
    return <OrderSuccessPage />;
}
