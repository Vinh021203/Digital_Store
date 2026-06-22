import type { Metadata } from 'next';
import AboutPage from './AboutContent';

export const metadata: Metadata = {
    title: 'Giới thiệu Shop Web rẻ và Lương Thế Vinh',
    description: 'Shop Web rẻ là dự án cá nhân do Lương Thế Vinh xây dựng từ năm 2025, cung cấp giao diện website, template và mã nguồn cho người dùng Việt Nam.',
    keywords: [
        'Shop Web rẻ',
        'Lương Thế Vinh',
        'giới thiệu Shop Web rẻ',
        'giao diện website Việt Nam',
        'template website',
        'mã nguồn website',
    ],
    alternates: {
        canonical: '/about',
    },
    openGraph: {
        type: 'profile',
        url: '/about',
        title: 'Giới thiệu Shop Web rẻ và Lương Thế Vinh',
        description: 'Dự án cá nhân được Lương Thế Vinh xây dựng từ năm 2025, tập trung vào giao diện website và sản phẩm số phù hợp cho người Việt.',
        images: ['/thumbnail.jpg'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Giới thiệu Shop Web rẻ và Lương Thế Vinh',
        description: 'Câu chuyện xây dựng Shop Web rẻ từ năm 2025 và cách Lương Thế Vinh chọn lọc, hỗ trợ sản phẩm.',
        images: ['/thumbnail.jpg'],
    },
};

export default function Page() {
    return <AboutPage />;
}
