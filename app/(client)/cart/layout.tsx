import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Danh sách mẫu quan tâm',
    description: 'Xem các giao diện website đã chọn để tham khảo demo hoặc gửi nhu cầu tư vấn.',
    openGraph: {
        title: 'Danh sách mẫu quan tâm | Web Giá Rẻ - Portfolio',
        description: 'Hoàn tất yêu cầu tư vấn của bạn',
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
