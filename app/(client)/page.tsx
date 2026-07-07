import { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';
import { getHomepageData } from '@/lib/homepageData';
import { getSiteUrl, getSocialImageUrl } from '@/lib/site-url';
import { seoKeywords } from '@/lib/seo';

const siteUrl = getSiteUrl();
const socialImageUrl = getSocialImageUrl();

export const metadata: Metadata = {
  title: {
    absolute: 'Web Giá Rẻ - Portfolio giao diện website, landing page và dự án web chuyên nghiệp',
  },
  description: 'Portfolio giao diện website, landing page, template, UI kit và dự án web chuyên nghiệp. Xem demo, tham khảo mẫu phù hợp và nhận tư vấn triển khai.',
  alternates: {
    canonical: siteUrl,
  },
  keywords: seoKeywords.home,
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Web Giá Rẻ - Portfolio giao diện website, landing page và dự án web chuyên nghiệp',
    description: 'Portfolio giao diện website, landing page, UI kit và dashboard giúp bạn tham khảo mẫu phù hợp, triển khai nhanh hơn và tiết kiệm chi phí.',
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: 'Web Giá Rẻ - Portfolio giao diện website, landing page và dự án web chuyên nghiệp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web Giá Rẻ - Portfolio giao diện website, landing page và dự án web chuyên nghiệp',
    description: 'Tham khảo portfolio giao diện website, landing page, template và UI kit chất lượng cao. Xem demo và nhận tư vấn triển khai.',
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
