import { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';
import { getHomepageData } from '@/lib/homepageData';

export const metadata: Metadata = {
  title: {
    absolute: 'DigitalMart - Marketplace Template, Theme vÃ  Sáº£n Pháº©m Sá»‘',
  },
  description: 'Mua template, theme, landing page, dashboard vÃ  UI kit cháº¥t lÆ°á»£ng cao. Xem demo trÆ°á»›c khi mua, táº£i file nhanh vÃ  triá»ƒn khai dá»± Ã¡n bÃ¡n hÃ ng chuyÃªn nghiá»‡p.',
  alternates: {
    canonical: '/',
  },
  keywords: [
    'template bÃ¡n hÃ ng',
    'theme website',
    'landing page',
    'UI kit',
    'dashboard template',
    'digital products',
    'sáº£n pháº©m sá»‘',
    'DigitalMart',
  ],
  openGraph: {
    type: 'website',
    url: '/',
    title: 'DigitalMart - Marketplace Template, Theme vÃ  Sáº£n Pháº©m Sá»‘',
    description: 'Kho template vÃ  sáº£n pháº©m sá»‘ giÃºp báº¡n dá»±ng website, landing page vÃ  giao diá»‡n bÃ¡n hÃ ng chuyÃªn nghiá»‡p nhanh hÆ¡n.',
    images: [
      {
        url: '/thumbnail.png',
        width: 1200,
        height: 630,
        alt: 'DigitalMart - Marketplace template, theme vÃ  UI kit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DigitalMart - Marketplace Template, Theme vÃ  Sáº£n Pháº©m Sá»‘',
    description: 'Mua template, theme, landing page vÃ  UI kit cháº¥t lÆ°á»£ng cao. Xem demo trÆ°á»›c khi mua vÃ  táº£i file nhanh.',
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

