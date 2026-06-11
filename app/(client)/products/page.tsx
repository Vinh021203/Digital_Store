import { Metadata } from 'next';
import ProductsPage from './ProductsContent';
import { getProductsPageData } from '@/lib/productsPageData';

export const metadata: Metadata = {
    title: 'Sản phẩm',
    description: 'Khám phá kho sản phẩm số chất lượng cao - Templates, UI Kits, Source Code và nhiều hơn nữa',
    alternates: {
        canonical: '/products',
    },
    openGraph: {
        type: 'website',
        url: '/products',
        title: 'Sản phẩm | DigitalMart',
        description: 'Khám phá kho sản phẩm số chất lượng cao - Templates, UI Kits, Source Code và nhiều hơn nữa',
    }
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
