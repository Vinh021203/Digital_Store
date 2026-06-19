import { Metadata } from 'next';
import ComparePage from './CompareContent';

export const metadata: Metadata = {
    title: 'So sánh sản phẩm',
    description: 'So sánh tính năng và giá cả giữa các giao diện website - Tìm lựa chọn tốt nhất cho bạn',
    alternates: {
        canonical: '/compare',
    },
    openGraph: {
        type: 'website',
        url: '/compare',
        title: 'So sánh sản phẩm | Shop Web rẻ',
        description: 'So sánh tính năng và giá cả giữa các giao diện website - Tìm lựa chọn tốt nhất cho bạn',
        images: ['/thumbnail.webp'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'So sánh giao diện website | Shop Web rẻ',
        description: 'So sánh tính năng và giá để chọn giao diện phù hợp.',
        images: ['/thumbnail.webp'],
    },
};

export default function Page() {
    return <ComparePage />;
}
