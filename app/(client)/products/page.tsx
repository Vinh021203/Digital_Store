import { Metadata } from 'next';
import ProductsPage from './ProductsContent';
import { getProductsPageData } from '@/lib/productsPageData';

export const metadata: Metadata = {
    title: 'Sản phẩm',
    description: 'Khám phá kho sản phẩm số chất lượng cao: template website, UI kit, source code, dashboard và nhiều tài nguyên số khác.',
    alternates: {
        canonical: '/products',
    },
    openGraph: {
        type: 'website',
        url: '/products',
        title: 'Sản phẩm | DigitalMart',
        description: 'Khám phá kho sản phẩm số chất lượng cao: template website, UI kit, source code, dashboard và nhiều tài nguyên số khác.',
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
