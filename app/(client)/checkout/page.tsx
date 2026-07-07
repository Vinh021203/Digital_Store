import { Metadata } from 'next';
import CheckoutPage from './CheckoutContent';

export const metadata: Metadata = {
    title: 'Yêu cầu tư vấn',
    description: 'Gửi nhu cầu về mẫu giao diện đang quan tâm để được tư vấn triển khai',
    robots: {
        index: false,
        follow: false,
    },
    openGraph: {
        title: 'Yêu cầu tư vấn | Web Giá Rẻ - Portfolio',
        description: 'Gửi nhu cầu về mẫu giao diện đang quan tâm để được tư vấn triển khai',
    }
};

export default function Page() {
    return <CheckoutPage />;
}
