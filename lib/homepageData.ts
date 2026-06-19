import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import type { Product } from '@/types';
import type { DbCategory } from '@/lib/categories';
import type { DbBlogPost } from '@/lib/blog';

export interface HomepageData {
  products: Product[];
  categories: DbCategory[];
  blogPosts: DbBlogPost[];
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
    isNew: product.is_new,
    isFeatured: product.is_featured,
    isBestseller: product.is_bestseller,
    author: product.author ?? '',
    format: product.format as Product['format'],
    duration: '',
    students: product.downloads_count || 0,
    downloads_count: product.downloads_count || 0,
    demoUrl: product.demo_url ?? undefined,
    tags: product.tags || [],
  };
}

async function fetchHomepageData(): Promise<HomepageData> {
  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    return { products: [], categories: [], blogPosts: [] };
  }

  const [productsResult, categoriesResult, categoryCountsResult, blogResult] = await Promise.all([
    supabase
      .from('products')
      .select(`
        id, name, slug, description, price, original_price,
        image, images, format, rating, reviews_count, downloads_count,
        is_new, is_featured, is_bestseller, author, demo_url, tags,
        category:category_id (id, name, slug)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(40),
    supabase
      .from('categories')
      .select('id, name, slug, icon, description, parent_id, sort_order, is_active, created_at')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('products')
      .select('category_id')
      .eq('status', 'active'),
    supabase
      .from('blog_posts')
      .select(`
        *,
        author:author_id (id, name, avatar)
      `)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(4),
  ]);

  if (productsResult.error) {
    console.error('Homepage products query error:', productsResult.error);
  }

  if (categoriesResult.error) {
    console.error('Homepage categories query error:', categoriesResult.error);
  }

  if (categoryCountsResult.error) {
    console.error('Homepage category counts query error:', categoryCountsResult.error);
  }

  if (blogResult.error) {
    console.error('Homepage blog query error:', blogResult.error);
  }

  const countMap: Record<number, number> = {};
  if (categoryCountsResult.data) {
    categoryCountsResult.data.forEach((product: any) => {
      if (product.category_id) {
        countMap[product.category_id] = (countMap[product.category_id] || 0) + 1;
      }
    });
  }

  const categories = (categoriesResult.data || [])
    .filter((category: any) => !/wordpress|woocommerce/i.test(
      `${category.name} ${category.slug} ${category.description || ''}`,
    ))
    .map((category: any) => ({
      ...category,
      product_count: countMap[category.id] || 0,
    }));

  return {
    products: (productsResult.data || []).map(mapProduct),
    categories: categories.slice(0, 6),
    blogPosts: blogResult.data || [],
  };
}

export const getHomepageData = unstable_cache(
  fetchHomepageData,
  ['homepage-public-data-v2'],
  {
    revalidate: 180,
    tags: ['homepage', 'products', 'categories', 'blog'],
  },
);
