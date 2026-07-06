import { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';
import { getHomepageData } from '@/lib/homepageData';
import { getSiteUrl, getSocialImageUrl } from '@/lib/site-url';
import { seoKeywords } from '@/lib/seo';

const siteUrl = getSiteUrl();
const socialImageUrl = getSocialImageUrl();

export const metadata: Metadata = {
  title: {
    absolute: 'Shop Web rẻ - Kho giao diện website, template và landing page',
  },
  description: 'Kho giao diện website, template, landing page, UI kit và dashboard chất lượng cao. Xem demo, tham khảo mẫu phù hợp và nhận tư vấn triển khai.',
  alternates: {
    canonical: siteUrl,
  },
  keywords: seoKeywords.home,
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Shop Web rẻ - Kho giao diện website, template và landing page',
    description: 'Kho giao diện website, template, landing page, UI kit và dashboard giúp bạn tham khảo mẫu phù hợp, triển khai nhanh hơn và tiết kiệm chi phí.',
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: 'Shop Web rẻ - Kho giao diện website, template và landing page',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Web rẻ - Kho giao diện website, template và landing page',
    description: 'Tham khảo giao diện website, template, landing page và UI kit chất lượng cao. Xem demo và nhận tư vấn triển khai.',
    images: [socialImageUrl],
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
