import { Metadata } from 'next';
import BlogPage from './BlogContent';

export const metadata: Metadata = {
    title: 'Blog',
    description: 'Kiến thức và xu hướng công nghệ, thiết kế website, template, UI/UX và giao diện website từ Shop Web rẻ.',
    alternates: {
        canonical: '/blog',
    },
    openGraph: {
        type: 'website',
        url: '/blog',
        title: 'Blog | Shop Web rẻ',
        description: 'Kiến thức và xu hướng công nghệ, thiết kế website, template, UI/UX và giao diện website từ Shop Web rẻ.',
        images: ['/thumbnail.jpg'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Blog | Shop Web rẻ',
        description: 'Kiến thức thiết kế website, template, UI/UX và phát triển web.',
        images: ['/thumbnail.jpg'],
    },
};

export default function Page() {
    return <BlogPage />;
}
