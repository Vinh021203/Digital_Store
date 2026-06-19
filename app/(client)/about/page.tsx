import { Metadata } from 'next';
import AboutPage from './AboutContent';

export const metadata: Metadata = {
    title: 'Về chúng tôi',
    description: 'Shop Web rẻ - Kho giao diện website uy tín hàng đầu Việt Nam',
    alternates: {
        canonical: '/about',
    },
    openGraph: {
        type: 'website',
        url: '/about',
        title: 'Về chúng tôi | Shop Web rẻ',
        description: 'Shop Web rẻ - Kho giao diện website uy tín hàng đầu Việt Nam',
        images: ['/thumbnail.webp'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Về chúng tôi | Shop Web rẻ',
        description: 'Kho giao diện website, template và landing page dành cho thị trường Việt Nam.',
        images: ['/thumbnail.webp'],
    },
};

export default function Page() {
    return <AboutPage />;
}
