import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import type { Product } from '@/types';
import type { DbCategory } from '@/lib/categories';

export interface ProductsPageData {
  products: Product[];
  categories: DbCategory[];
}

function createPublicSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function mapProduct(product: any): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.price),
    originalPrice: product.original_price ? Number(product.original_price) : undefined,
    description: product.description ?? '',
    category: product.category?.slug ?? '',
    image: product.image,
    gallery: product.images || [],
    rating: Number(product.rating || 0),
    reviews: product.reviews_count || 0,
    reviews_count: product.reviews_count || 0,
    isNew: product.is_new,
    isFeatured: product.is_featured,
    isBestseller: product.is_bestseller,
    author: product.author ?? '',
    format: product.format as Product['format'],
    students: product.downloads_count || 0,
    downloads_count: product.downloads_count || 0,
    publishDate: product.created_at,
    demoUrl: product.demo_url ?? undefined,
    tags: product.tags || [],
    fileFormat: product.file_format ?? undefined,
    compatibility: product.compatibility ?? undefined,
    features: product.features || [],
    techStack: product.tech_stack || [],
    technologyVariants: product.technology_variants || [],
  };
}

async function fetchProductsPageData(): Promise<ProductsPageData> {
  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    return { products: [], categories: [] };
  }

  const [productsResult, categoriesResult, categoryCountsResult] = await Promise.all([
    supabase
      .from('products')
      .select(`
        id, name, slug, description, price, original_price,
        image, images, format, rating, reviews_count, downloads_count,
        is_new, is_featured, is_bestseller, author, demo_url, tags, created_at,
        file_format, compatibility, features, tech_stack, technology_variants,
        category:category_id (id, name, slug)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('id, name, slug, icon, parent_id, sort_order, is_active, created_at')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('products')
      .select('category_id')
      .eq('status', 'active'),
  ]);

  if (productsResult.error) {
    console.error('Products page products query error:', productsResult.error);
  }

  if (categoriesResult.error) {
    console.error('Products page categories query error:', categoriesResult.error);
  }

  if (categoryCountsResult.error) {
    console.error('Products page category counts query error:', categoryCountsResult.error);
  }

  const countMap: Record<number, number> = {};
  if (categoryCountsResult.data) {
    categoryCountsResult.data.forEach((product: any) => {
      if (product.category_id) {
        countMap[product.category_id] = (countMap[product.category_id] || 0) + 1;
      }
    });
  }

  return {
    products: (productsResult.data || []).map(mapProduct),
    categories: (categoriesResult.data || [])
      .filter((category: any) => !/wordpress|woocommerce/i.test(`${category.name} ${category.slug}`))
      .map((category: any) => ({
        ...category,
        description: null,
        product_count: countMap[category.id] || 0,
      })),
  };
}

export const getProductsPageData = unstable_cache(
  fetchProductsPageData,
  ['products-page-public-data-v3'],
  {
    revalidate: 180,
    tags: ['products-page', 'products', 'categories'],
  },
);
