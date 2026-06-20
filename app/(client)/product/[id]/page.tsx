import type { Metadata } from 'next';
import { getProductById, getProductBySlug } from '@/lib/products';
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
        title: 'Sản phẩm không tìm thấy',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const title = product.name;
    const plainDescription = product.description?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const description =
      plainDescription ||
      `Mua ${product.name} chất lượng cao với giá ${product.price.toLocaleString('vi-VN')}đ. ${product.category?.name || 'Giao diện website'} chuyên nghiệp từ ${product.author || 'Shop Web rẻ'}.`;
    const productPath = `/product/${product.slug || product.id}`;

    const keywords = [
      product.name,
      product.category?.name,
      product.format,
      product.author,
      product.file_format,
      product.compatibility,
      ...(product.tags || []),
      ...(product.tech_stack || []),
      'giao diện website',
      'template',
      'theme',
    ].filter(Boolean);

    return {
      title,
      description: description.substring(0, 160),
      keywords: keywords.join(', '),
      authors: [{ name: product.author || 'Shop Web rẻ' }],
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
        siteName: 'Shop Web rẻ',
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
      title: 'Sản phẩm',
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

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://webgiare.id.vn').replace(/\/$/, '');
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
    '@type': 'Product',
    name: product.name,
    image: [product.image, ...(product.images || [])].filter(Boolean),
    description: plainDescription?.slice(0, 500),
    sku: String(product.id),
    brand: {
      '@type': 'Brand',
      name: product.author || 'Shop Web rẻ',
    },
    ...(technicalProperties.length > 0
      ? { additionalProperty: technicalProperties }
      : {}),
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}${productPath}`,
      priceCurrency: 'VND',
      price: Number(product.price || 0),
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ProductDetailPage />
    </>
  );
}
