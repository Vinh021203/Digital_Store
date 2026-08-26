import type { Metadata } from 'next';
import { getProductById, getProductBySlug } from '@/lib/products';
import { getSiteUrl } from '@/lib/site-url';
import { buildProductSeoKeywords } from '@/lib/seo';
import ProductDetailPage from './ProductDetailPage';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;

    let product = await getProductBySlug(id);

    if (!product) {
      const numericId = Number.parseInt(id, 10);
      if (!Number.isNaN(numericId)) {
        product = await getProductById(numericId);
      }
    }

    if (!product) {
      return {
        title: 'Mẫu giao diện không tìm thấy',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const title = `${product.name} - Mẫu giao diện có demo và thông tin kỹ thuật`;
    const plainDescription = product.description?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const description =
      plainDescription ||
      `Tham khảo ${product.name} với demo, công nghệ và thông tin kỹ thuật rõ ràng. ${product.category?.name || 'Giao diện website'} chuyên nghiệp từ ${product.author || 'Web Giá Rẻ - Portfolio'}.`;
    const productPath = `/product/${product.slug || product.id}`;

    const keywords = buildProductSeoKeywords({
      name: product.name,
      category: product.category?.name,
      format: product.format,
      author: product.author,
      fileFormat: product.file_format,
      compatibility: product.compatibility,
      tags: product.tags,
      techStack: product.tech_stack,
    });

    return {
      title,
      description: description.substring(0, 160),
      keywords,
      authors: [{ name: product.author || 'Web Giá Rẻ - Portfolio' }],
      openGraph: {
        type: 'website',
        title,
        description,
        images: [
          {
            url: product.image,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
        siteName: 'Web Giá Rẻ - Portfolio',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [product.image],
      },
      alternates: {
        canonical: productPath,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Mẫu giao diện',
    };
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  let product = await getProductBySlug(id);

  if (!product) {
    const numericId = Number.parseInt(id, 10);
    if (!Number.isNaN(numericId)) {
      product = await getProductById(numericId);
    }
  }

  if (!product) {
    return <ProductDetailPage />;
  }

  const siteUrl = getSiteUrl();
  const productPath = `/product/${product.slug || product.id}`;
  const plainDescription = product.description?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  const ratingValue = Number(product.rating || 0);
  const reviewCount = Number(product.reviews_count || 0);
  const currentProductFile = product.product_files?.find((file) => file.is_current)
    || product.product_files?.[0];
  const technicalProperties = [
    product.file_format && {
      '@type': 'PropertyValue',
      name: 'Định dạng file',
      value: product.file_format,
    },
    product.compatibility && {
      '@type': 'PropertyValue',
      name: 'Tương thích',
      value: product.compatibility,
    },
    currentProductFile?.version && {
      '@type': 'PropertyValue',
      name: 'Phiên bản',
      value: currentProductFile.version,
    },
    product.tech_stack?.length && {
      '@type': 'PropertyValue',
      name: 'Công nghệ',
      value: product.tech_stack.join(', '),
    },
  ].filter(Boolean);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: product.name,
    image: [product.image, ...(product.images || [])].filter(Boolean),
    description: plainDescription?.slice(0, 500),
    sku: String(product.id),
    brand: {
      '@type': 'Brand',
      name: product.author || 'Web Giá Rẻ - Portfolio',
    },
    ...(technicalProperties.length > 0
      ? { additionalProperty: technicalProperties }
      : {}),
    url: `${siteUrl}${productPath}`,
    ...(ratingValue > 0 && reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue,
            reviewCount,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <ProductDetailPage />
    </>
  );
}
