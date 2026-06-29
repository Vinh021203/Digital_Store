import { Metadata } from 'next';
import ProductsPage from './ProductsContent';
import { getProductsPageData } from '@/lib/productsPageData';
import { buildSeoMetadata, seoKeywords } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
    title: 'Mua template website, landing page và source code',
    description: 'Khám phá kho giao diện website mẫu, template HTML/CSS/JS, React, Next.js, UI kit và dashboard có demo live, giá mềm và hỗ trợ tiếng Việt.',
    path: '/products',
    keywords: seoKeywords.products,
    ogTitle: 'Mua template website và giao diện website mẫu | Shop Web rẻ',
    twitterTitle: 'Template website, landing page và source code | Shop Web rẻ',
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
