import { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';
import { getHomepageData } from '@/lib/homepageData';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://webgiare.id.vn';

export const metadata: Metadata = {
  title: {
    absolute: 'Shop Web rẻ - Giao diện website, template và landing page',
  },
  description: 'Mua giao diện website, template, landing page, UI kit và dashboard chất lượng cao. Xem demo trước khi mua, tải file nhanh, hỗ trợ tận tâm.',
  alternates: {
    canonical: siteUrl,
  },
  keywords: [
    'shop web rẻ',
    'mua giao diện website',
    'giao diện website',
    'giao diện website bán hàng',
    'template website',
    'theme website',
    'landing page đẹp',
    'landing page bán hàng',
    'source code website',
    'mẫu website đẹp',
    'ui kit',
    'dashboard template',
  ],
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Shop Web rẻ - Giao diện website, template và landing page',
    description: 'Kho giao diện website, template, landing page, UI kit và dashboard giúp bạn triển khai website nhanh hơn, đẹp hơn và tiết kiệm chi phí.',
    images: [
      {
        url: '/thumbnail.jpg',
        width: 1200,
        height: 630,
        alt: 'Shop Web rẻ - Kho giao diện website, template và landing page',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Web rẻ - Giao diện website, template và landing page',
    description: 'Mua giao diện website, template, landing page và UI kit chất lượng cao. Xem demo trước khi mua và tải file nhanh.',
    images: ['/thumbnail.jpg'],
  },
};

export default async function Page() {
  const homepageData = await getHomepageData();

  return (
    <HomePage
      initialProducts={homepageData.products}
      initialCategories={homepageData.categories}
      initialBlogPosts={homepageData.blogPosts}
    />
  );
}
