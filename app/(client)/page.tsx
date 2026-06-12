import { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';
import { getHomepageData } from '@/lib/homepageData';

export const metadata: Metadata = {
  title: {
    absolute: 'DigitalMart - Kho template website, theme và sản phẩm số',
  },
  description: 'Mua template website, theme, landing page, dashboard và UI kit chất lượng cao. Xem demo trước khi mua, tải file nhanh và triển khai dự án chuyên nghiệp.',
  alternates: {
    canonical: '/',
  },
  keywords: [
    'template bán hàng',
    'theme website',
    'landing page',
    'UI kit',
    'dashboard template',
    'digital products',
    'sản phẩm số',
    'DigitalMart',
  ],
  openGraph: {
    type: 'website',
    url: '/',
    title: 'DigitalMart - Kho template website, theme và sản phẩm số',
    description: 'Kho template và sản phẩm số giúp bạn dựng website, landing page và giao diện bán hàng chuyên nghiệp nhanh hơn.',
    images: [
      {
        url: '/thumbnail.png',
        width: 1200,
        height: 630,
        alt: 'DigitalMart - Marketplace template, theme và UI kit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DigitalMart - Kho template website, theme và sản phẩm số',
    description: 'Mua template website, theme, landing page và UI kit chất lượng cao. Xem demo trước khi mua và tải file nhanh.',
    images: ['/thumbnail.webp'],
  },
};

export default async function Page() {
  const homepageData = await getHomepageData();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DigitalMart',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.martdigitalhub.dev',
    description: metadata.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.martdigitalhub.dev'}/products?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomePage
        initialProducts={homepageData.products}
        initialCategories={homepageData.categories}
        initialBlogPosts={homepageData.blogPosts}
      />
    </>
  );
}

