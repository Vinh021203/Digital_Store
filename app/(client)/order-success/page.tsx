import { Metadata } from 'next';
import OrderSuccessPage from './OrderSuccessContent';

export const metadata: Metadata = {
    title: 'Yêu cầu tư vấn đã được ghi nhận',
    description: 'Yêu cầu của bạn đã được ghi nhận để đội ngũ tư vấn phản hồi',
    robots: {
        index: false,
        follow: false,
    },
    openGraph: {
        title: 'Yêu cầu đã được ghi nhận | Web Giá Rẻ - Portfolio',
        description: 'Yêu cầu của bạn đã được ghi nhận để đội ngũ tư vấn phản hồi',
    }
};

export default function Page() {
    return <OrderSuccessPage />;
}
