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
      `Mua ${product.name} chất lượng cao với giá ${product.price.toLocaleString('vi-VN')}đ. ${product.category?.name || 'Sản phẩm số'} chuyên nghiệp từ ${product.author || 'DigitalMart'}.`;
    const productPath = `/product/${product.slug || product.id}`;

    const keywords = [
      product.name,
      product.category?.name,
      product.format,
      product.author,
      ...(product.tags || []),
      'sản phẩm số',
      'template',
      'theme',
    ].filter(Boolean);

    return {
      title,
      description: description.substring(0, 160),
      keywords: keywords.join(', '),
      authors: [{ name: product.author || 'DigitalMart' }],
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
        siteName: 'DigitalMart',
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

export default function Page() {
  return <ProductDetailPage />;
}
