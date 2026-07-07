import { Metadata } from 'next';
import ProductsPage from './ProductsContent';
import { getProductsPageData } from '@/lib/productsPageData';
import { buildSeoMetadata, seoKeywords } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'Portfolio giao diện website, landing page và dự án web mẫu',
    description: 'Khám phá portfolio giao diện website, landing page, template React, Next.js, UI kit, dashboard và dự án web có demo live để tham khảo trước khi triển khai.',
    path: '/products',
    keywords: seoKeywords.products,
    ogTitle: 'Portfolio giao diện website và landing page mẫu | Web Giá Rẻ - Portfolio',
    twitterTitle: 'Portfolio website, landing page và dự án web | Web Giá Rẻ - Portfolio',
});

export default async function Page() {
    const productsPageData = await getProductsPageData();

    return (
        <ProductsPage
            initialProducts={productsPageData.products}
            initialCategories={productsPageData.categories}
        />
    );
}
