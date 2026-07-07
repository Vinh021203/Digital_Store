import type { Metadata } from 'next';
import { getSocialImageUrl } from './site-url';

export const seoKeywords = {
  home: [
    'Web Giá Rẻ - Portfolio',
    'portfolio giao diện website',
    'giao diện website chuyên nghiệp',
    'tham khảo giao diện website',
    'template website có demo',
    'landing page chuyên nghiệp',
    'dự án web mẫu',
    'mẫu website đẹp',
  ],
  products: [
    'template website có demo',
    'giao diện website mẫu',
    'template html css js',
    'template react',
    'template nextjs',
    'dashboard template',
    'figma ui kit',
    'dự án landing page',
  ],
  aiRecommendation: [
    'ai tư vấn giao diện website',
    'tìm template website phù hợp',
    'gợi ý landing page',
    'chọn giao diện website',
    'template theo ngân sách',
  ],
  blog: [
    'blog thiết kế website',
    'kiến thức landing page',
    'kinh nghiệm chọn template',
    'tối ưu website',
    'ui ux website',
    'hướng dẫn làm website',
  ],
  about: [
    'giới thiệu Web Giá Rẻ - Portfolio',
    'Lương Thế Vinh',
    'giao diện website Việt Nam',
    'kho template Việt Nam',
    'dịch vụ giao diện website',
  ],
  contact: [
    'liên hệ tư vấn giao diện website',
    'tư vấn template website',
    'hỗ trợ giao diện website',
    'dịch vụ chỉnh sửa landing page',
    'Web Giá Rẻ - Portfolio Hạ Long',
  ],
  faq: [
    'câu hỏi chọn template website',
    'hỏi đáp giao diện website',
    'tư vấn template',
    'xem demo template',
    'license giao diện website',
  ],
  compare: [
    'so sánh giao diện website',
    'so sánh template website',
    'chọn template phù hợp',
    'template website tốt nhất',
    'giá giao diện website',
  ],
  affiliate: [
    'affiliate template website',
    'giới thiệu giao diện website',
    'tiếp thị liên kết template',
    'hoa hồng giới thiệu website',
  ],
  community: [
    'cộng đồng thiết kế website',
    'cộng đồng developer Việt Nam',
    'chia sẻ template website',
    'hỏi đáp lập trình website',
  ],
  policy: [
    'chính sách mẫu demo số',
    'điều khoản tư vấn template',
    'license template website',
    'chính sách xử lý yêu cầu mẫu demo số',
  ],
};

type ProductSeoKeywordInput = {
  name?: string | null;
  category?: string | null;
  format?: string | null;
  fileFormat?: string | null;
  compatibility?: string | null;
  author?: string | null;
  tags?: string[] | null;
  techStack?: string[] | null;
};

export function buildProductSeoKeywords(product: ProductSeoKeywordInput) {
  const baseKeywords = [
    product.name,
    product.category,
    product.format,
    product.fileFormat,
    product.compatibility,
    product.author,
    ...(product.tags || []),
    ...(product.techStack || []),
    'tham khảo giao diện website',
    'template website',
    'dự án web mẫu',
    'giao diện website có demo',
    'xem demo template website',
  ].filter(Boolean) as string[];

  const haystack = baseKeywords.join(' ').toLowerCase();
  const intentKeywords: string[] = [];

  if (haystack.includes('landing')) {
    intentKeywords.push('landing page giới thiệu/demo', 'template landing page', 'dự án landing page');
  }

  if (haystack.includes('dashboard') || haystack.includes('admin')) {
    intentKeywords.push('dashboard template', 'admin dashboard', 'template quản trị');
  }

  if (haystack.includes('react')) {
    intentKeywords.push('template React', 'dự án React', 'giao diện React');
  }

  if (haystack.includes('next')) {
    intentKeywords.push('template Next.js', 'dự án Next.js', 'giao diện Next.js');
  }

  if (haystack.includes('html') || haystack.includes('css') || haystack.includes('javascript')) {
    intentKeywords.push('template HTML CSS JS', 'dự án HTML CSS JS', 'mẫu website HTML');
  }

  if (haystack.includes('figma')) {
    intentKeywords.push('Figma UI kit', 'template Figma', 'thiết kế UI Figma');
  }

  if (haystack.includes('shop') || haystack.includes('ecommerce') || haystack.includes('giới thiệu/demo')) {
    intentKeywords.push('giao diện website giới thiệu/demo', 'template ecommerce', 'website giới thiệu/demo mẫu');
  }

  return Array.from(new Set([...baseKeywords, ...intentKeywords]));
}

type SeoMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  ogTitle?: string;
  twitterTitle?: string;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
};

export function buildSeoMetadata({
  title,
  description,
  path,
  keywords = [],
  image = getSocialImageUrl(),
  ogTitle,
  twitterTitle,
  type = 'website',
  noIndex = false,
}: SeoMetadataInput): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: path,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
    openGraph: {
      type,
      url: path,
      title: ogTitle || title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: ogTitle || title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: twitterTitle || ogTitle || title,
      description,
      images: [image],
    },
  };
}
