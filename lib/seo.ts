import type { Metadata } from 'next';
import { getSocialImageUrl } from './site-url';

export const seoKeywords = {
  home: [
    'shop web rẻ',
    'giao diện website giá rẻ',
    'tham khảo giao diện website',
    'kho giao diện website',
    'template website giá rẻ',
    'landing page giá rẻ',
    'source code website',
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
    'source code landing page',
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
    'giới thiệu Shop Web rẻ',
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
    'Shop Web rẻ Hạ Long',
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
    'kiếm tiền bán giao diện website',
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
    'chính sách sản phẩm số',
    'điều khoản tư vấn template',
    'license template website',
    'chính sách hoàn tiền sản phẩm số',
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
    'source code website',
    'giao diện website có demo',
    'xem demo template website',
  ].filter(Boolean) as string[];

  const haystack = baseKeywords.join(' ').toLowerCase();
  const intentKeywords: string[] = [];

  if (haystack.includes('landing')) {
    intentKeywords.push('landing page bán hàng', 'template landing page', 'source code landing page');
  }

  if (haystack.includes('dashboard') || haystack.includes('admin')) {
    intentKeywords.push('dashboard template', 'admin dashboard', 'template quản trị');
  }

  if (haystack.includes('react')) {
    intentKeywords.push('template React', 'source code React', 'giao diện React');
  }

  if (haystack.includes('next')) {
    intentKeywords.push('template Next.js', 'source code Next.js', 'giao diện Next.js');
  }

  if (haystack.includes('html') || haystack.includes('css') || haystack.includes('javascript')) {
    intentKeywords.push('template HTML CSS JS', 'source code HTML CSS JS', 'mẫu website HTML');
  }

  if (haystack.includes('figma')) {
    intentKeywords.push('Figma UI kit', 'template Figma', 'thiết kế UI Figma');
  }

  if (haystack.includes('shop') || haystack.includes('ecommerce') || haystack.includes('bán hàng')) {
    intentKeywords.push('giao diện website bán hàng', 'template ecommerce', 'website bán hàng mẫu');
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
