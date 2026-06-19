import { Metadata } from 'next';
import ProductsPage from './ProductsContent';
import { getProductsPageData } from '@/lib/productsPageData';

export const metadata: Metadata = {
    title: 'Sản phẩm',
    description: 'Khám phá kho giao diện website chất lượng cao: template website, UI kit, source code, dashboard và nhiều tài nguyên số khác.',
    alternates: {
        canonical: '/products',
    },
    openGraph: {
        type: 'website',
        url: '/products',
        title: 'Sản phẩm | Shop Web rẻ',
        description: 'Khám phá kho giao diện website chất lượng cao: template website, UI kit, source code, dashboard và nhiều tài nguyên số khác.',
        images: ['/thumbnail.webp'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Giao diện website chuyên nghiệp | Shop Web rẻ',
        description: 'Khám phá template website, landing page, UI kit và dashboard chất lượng cao.',
        images: ['/thumbnail.webp'],
    },
};

export default async function Page() {
    const productsPageData = await getProductsPageData();

    return (
        <ProductsPage
            initialProducts={productsPageData.products}
            initialCategories={productsPageData.categories}
        />
    );
}
