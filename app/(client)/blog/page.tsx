import { Metadata } from 'next';
import BlogPage from './BlogContent';

export const metadata: Metadata = {
    title: 'Blog | DigitalMart',
    description: 'Kiến thức và xu hướng công nghệ - Cập nhật tin tức mới nhất từ DigitalMart',
    openGraph: {
        title: 'Blog | DigitalMart',
        description: 'Kiến thức và xu hướng công nghệ - Cập nhật tin tức mới nhất từ DigitalMart',
    }
};

export default function Page() {
    return <BlogPage />;
}
