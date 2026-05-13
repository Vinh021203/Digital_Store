import { Metadata } from 'next';
import TrackingContent from './TrackingContent';

export const metadata: Metadata = {
    title: 'Theo dõi đơn hàng',
    description: 'Tra cứu và theo dõi trạng thái đơn hàng của bạn tại DigitalMart',
    openGraph: {
        title: 'Theo dõi đơn hàng | DigitalMart',
        description: 'Tra cứu và theo dõi trạng thái đơn hàng của bạn tại DigitalMart',
    }
};

export default function TrackingPage() {
    return <TrackingContent />;
}
