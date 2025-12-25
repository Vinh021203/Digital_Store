import type { Metadata } from 'next';
import { getProductBySlug, getProductById } from '@/lib/products';
import ProductDetailPage from './ProductDetailPage';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // Await params in Next.js 15+
    const { id } = await params;

    // Try to get product by slug first, then by ID
    let product = await getProductBySlug(id);

    if (!product) {
      // Try as numeric ID
      const numericId = parseInt(id);
      if (!isNaN(numericId)) {
        product = await getProductById(numericId);
      }
    }

    if (!product) {
      return {
        title: 'Sản phẩm không tìm thấy',
      };
    }

    const title = `${product.name} - DigitalMart`;
    const description = product.description || `Mua ${product.name} chất lượng cao với giá ${product.price.toLocaleString('vi-VN')}₫. ${product.category?.name || 'Sản phẩm số'} chuyên nghiệp từ ${product.author || 'DigitalMart'}.`;

    // Create keywords from product info
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
      description: description.substring(0, 160), // Limit to 160 chars for SEO
      keywords: keywords.join(', '),
      authors: [{ name: product.author || 'DigitalMart' }],
      openGraph: {
        type: 'website', // Next.js only supports: website, article, book, profile, music.*, video.*
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
        canonical: `/product/${product.slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Sản phẩm - DigitalMart',
    };
  }
}

// Server Component - renders client component
export default function Page() {
  return <ProductDetailPage />;
}
