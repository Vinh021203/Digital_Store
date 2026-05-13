import { Metadata } from 'next';
import ComparePage from './CompareContent';

export const metadata: Metadata = {
    title: 'So sánh sản phẩm',
    description: 'So sánh tính năng và giá cả giữa các sản phẩm số - Tìm lựa chọn tốt nhất cho bạn',
    openGraph: {
        title: 'So sánh sản phẩm | DigitalMart',
        description: 'So sánh tính năng và giá cả giữa các sản phẩm số - Tìm lựa chọn tốt nhất cho bạn',
    }
};

export default function Page() {
    return <ComparePage />;
}
