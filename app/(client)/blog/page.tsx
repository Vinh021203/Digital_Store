import { Metadata } from 'next';
import BlogPage from './BlogContent';

export const metadata: Metadata = {
    title: 'Blog',
    description: 'Kiến thức và xu hướng công nghệ, thiết kế website, template, UI/UX và sản phẩm số từ DigitalMart.',
    alternates: {
        canonical: '/blog',
    },
    openGraph: {
        title: 'Blog | DigitalMart',
        description: 'Kiến thức và xu hướng công nghệ, thiết kế website, template, UI/UX và sản phẩm số từ DigitalMart.',
    },
};

export default function Page() {
    return <BlogPage />;
}
