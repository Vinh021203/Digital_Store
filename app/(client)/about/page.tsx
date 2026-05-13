import { Metadata } from 'next';
import AboutPage from './AboutContent';

export const metadata: Metadata = {
    title: 'Về chúng tôi',
    description: 'DigitalMart - Nền tảng marketplace digital products uy tín hàng đầu Việt Nam',
    openGraph: {
        title: 'Về chúng tôi | DigitalMart',
        description: 'DigitalMart - Nền tảng marketplace digital products uy tín hàng đầu Việt Nam',
    }
};

export default function Page() {
    return <AboutPage />;
}
