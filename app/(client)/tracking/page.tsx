import { Metadata } from 'next';
import TrackingContent from './TrackingContent';

export const metadata: Metadata = {
    title: 'Theo dõi đơn hàng',
    description: 'Tra cứu và theo dõi trạng thái đơn hàng của bạn tại Shop Web rẻ',
    robots: {
        index: false,
        follow: false,
    },
    openGraph: {
        title: 'Theo dõi đơn hàng | Shop Web rẻ',
        description: 'Tra cứu và theo dõi trạng thái đơn hàng của bạn tại Shop Web rẻ',
    },
};

export default function TrackingPage() {
    return <TrackingContent />;
}
