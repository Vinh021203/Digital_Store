// lib/products.ts
import { createClient } from './supabase/client';
import type { Product } from '@/types';

// ============================================
// Types
// ============================================
export interface DbProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image: string;
  images: string[];
  format: string;
  category_id: number | null;
  author: string;
  rating: number;
  reviews_count: number;
  downloads_count: number;
  commission_rate: number;
  is_new: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  status: 'active' | 'pending' | 'rejected' | 'draft';
  demo_url: string | null;
  file_format: string | null;
  compatibility: string | null;
  tags: string[];
  features: string[];
  tech_stack: string[];
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: { id: number; name: string; slug: string } | null;
  product_files?: Array<{
    id: number;
    version: string;
    file_size: number;
    is_current: boolean;
  }>;
}

export interface ProductPayload {
  name: string;
  slug?: string;
  description?: string | null;
  price: number;
  original_price?: number | null;
  image: string;
  images?: string[];
  format: string;
  category_id?: number | null;
  author?: string;
  is_new?: boolean;
  is_featured?: boolean;
  is_bestseller?: boolean;
  status?: 'active' | 'pending' | 'rejected' | 'draft';
  demo_url?: string | null;
  file_format?: string | null;
  compatibility?: string | null;
  tags?: string[];
  features?: string[];
  tech_stack?: string[];
  commission_rate?: number; // Affiliate commission rate (default 10%)
}

export interface ProductFilters {
  status?: string;
  format?: string;
  category_id?: number;
  search?: string;
  is_featured?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================
// Helper: Generate slug from name
// ============================================
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ============================================
// Fetch all products (Admin - all statuses)
// ============================================
export async function fetchAllProducts(filters?: ProductFilters): Promise<DbProduct[]> {
  const supabase = createClient();
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }

  let query = supabase
    .from('products')
    .select(`
      *,
      category:category_id (id, name, slug)
    `)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters?.format && filters.format !== 'all') {
    query = query.eq('format', filters.format);
  }
  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id);
  }
  if (filters?.is_featured !== undefined) {
    query = query.eq('is_featured', filters.is_featured);
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,author.ilike.%${filters.search}%`);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

// ============================================
// Fetch active products (Public - storefront)
// ============================================
export async function fetchActiveProducts(filters?: ProductFilters): Promise<Product[]> {
  const supabase = createClient();
  if (!supabase) return [];

  let query = supabase
    .from('products')
    .select(`
      id, name, slug, description, price, original_price,
      image, images, format, rating, reviews_count, downloads_count,
      is_new, is_featured, is_bestseller, author, demo_url, file_format,
      compatibility, tags, features, tech_stack,
      category:category_id (id, name, slug)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (filters?.format && filters.format !== 'all') {
    query = query.eq('format', filters.format);
  }
  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id);
  }
  if (filters?.is_featured) {
    query = query.eq('is_featured', true);
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,author.ilike.%${filters.search}%`);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching active products:', error);
    return [];
  }

  // Map to Product type
  return (data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug, // Include slug for URL generation
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    description: p.description ?? '',
    category: p.category?.slug ?? '',
    image: p.image,
    gallery: p.images || [], // Include gallery images
    rating: Number(p.rating || 0),
    reviews: p.reviews_count || 0,
    isNew: p.is_new,
    isFeatured: p.is_featured,
    author: p.author ?? '',
    format: p.format as Product['format'],
    duration: '',
    students: p.downloads_count || 0,
    downloads_count: p.downloads_count || 0,
    demoUrl: p.demo_url ?? undefined,
    fileFormat: p.file_format ?? undefined,
    compatibility: p.compatibility ?? undefined,
    tags: p.tags || [],
    features: p.features || [],
    techStack: p.tech_stack || [],
  }));
}

// ============================================
// Get product by ID
// ============================================
export async function getProductById(id: number): Promise<DbProduct | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:category_id (id, name, slug),
      product_files (id, version, file_size, is_current)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}

// ============================================
// Get product by slug
// ============================================
export async function getProductBySlug(slug: string): Promise<DbProduct | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:category_id (id, name, slug),
      product_files (id, version, file_size, is_current)
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }

  return data;
}

// ============================================
// Create new product
// ============================================
export async function createProduct(payload: ProductPayload): Promise<DbProduct | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const slug = payload.slug || generateSlug(payload.name);

  // Check if slug exists
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: payload.name,
      slug: finalSlug,
      description: payload.description || null,
      price: payload.price,
      original_price: payload.original_price || null,
      image: payload.image,
      images: payload.images || [],
      format: payload.format || 'Template',
      category_id: payload.category_id || null,
      author: payload.author || 'Shop Web rẻ',
      is_new: payload.is_new ?? true,
      is_featured: payload.is_featured ?? false,
      is_bestseller: payload.is_bestseller ?? false,
      status: payload.status || 'draft',
      demo_url: payload.demo_url || null,
      file_format: payload.file_format || null,
      compatibility: payload.compatibility || null,
      tags: payload.tags || [],
      features: payload.features || [],
      tech_stack: payload.tech_stack || [],
      commission_rate: payload.commission_rate ?? 10,
    })
    .select(`
      *,
      category:category_id (id, name, slug)
    `)
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw new Error(error.message);
  }

  return data;
}

// ============================================
// Update product
// ============================================
export async function updateProduct(
  id: number,
  payload: Partial<ProductPayload>
): Promise<DbProduct | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const updates: any = {};

  if (payload.name !== undefined) {
    updates.name = payload.name;
    if (payload.slug === undefined) {
      updates.slug = generateSlug(payload.name);
    }
  }
  if (payload.slug !== undefined) updates.slug = payload.slug;
  if (payload.description !== undefined) updates.description = payload.description;
  if (payload.price !== undefined) updates.price = payload.price;
  if (payload.original_price !== undefined) updates.original_price = payload.original_price;
  if (payload.image !== undefined) updates.image = payload.image;
  if (payload.images !== undefined) updates.images = payload.images;
  if (payload.format !== undefined) updates.format = payload.format;
  if (payload.category_id !== undefined) updates.category_id = payload.category_id;
  if (payload.author !== undefined) updates.author = payload.author;
  if (payload.is_new !== undefined) updates.is_new = payload.is_new;
  if (payload.is_featured !== undefined) updates.is_featured = payload.is_featured;
  if (payload.is_bestseller !== undefined) updates.is_bestseller = payload.is_bestseller;
  if (payload.status !== undefined) updates.status = payload.status;
  if (payload.demo_url !== undefined) updates.demo_url = payload.demo_url;
  if (payload.file_format !== undefined) updates.file_format = payload.file_format;
  if (payload.compatibility !== undefined) updates.compatibility = payload.compatibility;
  if (payload.tags !== undefined) updates.tags = payload.tags;
  if (payload.features !== undefined) updates.features = payload.features;
  if (payload.tech_stack !== undefined) updates.tech_stack = payload.tech_stack;
  if (payload.commission_rate !== undefined) updates.commission_rate = payload.commission_rate;

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      category:category_id (id, name, slug)
    `)
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw new Error(error.message);
  }

  return data;
}

// ============================================
// Delete product
// ============================================
export async function deleteProduct(id: number): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw new Error(error.message);
  }

  return true;
}

// ============================================
// Update product status
// ============================================
export async function updateProductStatus(
  id: number,
  status: 'active' | 'pending' | 'rejected' | 'draft',
  rejectionReason?: string
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const updates: any = { status };
  if (status === 'rejected' && rejectionReason) {
    updates.rejection_reason = rejectionReason;
  }

  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating product status:', error);
    throw new Error(error.message);
  }

  return true;
}

// ============================================
// Get featured products
// ============================================
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return fetchActiveProducts({ is_featured: true, limit });
}

// ============================================
// Get products by category
// ============================================
export async function getProductsByCategory(categoryId: number, limit = 12): Promise<Product[]> {
  return fetchActiveProducts({ category_id: categoryId, limit });
}

// ============================================
// Get new products
// ============================================
export async function getNewProducts(limit = 8): Promise<Product[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, slug, description, price, original_price,
      image, format, rating, reviews_count, is_new, author, demo_url,
      category:category_id (id, name, slug)
    `)
    .eq('status', 'active')
    .eq('is_new', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching new products:', error);
    return [];
  }

  return (data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    description: p.description ?? '',
    category: p.category?.slug ?? '',
    image: p.image,
    rating: Number(p.rating || 0),
    reviews: p.reviews_count || 0,
    isNew: p.is_new,
    author: p.author ?? '',
    format: p.format as Product['format'],
    demoUrl: p.demo_url ?? undefined,
  }));
}

// ============================================
// Get product stats (Admin)
// ============================================
export async function getProductStats() {
  const supabase = createClient();
  if (!supabase) return null;

  const { data: products, error } = await supabase
    .from('products')
    .select('id, price, format, status');

  if (error) {
    console.error('Error fetching product stats:', error);
    return null;
  }

  const all = products || [];
  const active = all.filter(p => p.status === 'active');

  return {
    total: all.length,
    active: active.length,
    draft: all.filter(p => p.status === 'draft').length,
    pending: all.filter(p => p.status === 'pending').length,
    totalValue: active.reduce((sum, p) => sum + Number(p.price), 0),
    byFormat: {
      Theme: all.filter(p => p.format === 'Theme').length,
      Template: all.filter(p => p.format === 'Template').length,
      Landing: all.filter(p => p.format === 'Landing').length,
      MiniApp: all.filter(p => p.format === 'MiniApp').length,
      Bundle: all.filter(p => p.format === 'Bundle').length,
    },
  };
}

// ============================================
// Legacy exports for backward compatibility
// ============================================
export const fetchProductsFromSupabase = fetchActiveProducts;
export const getProductByIdDb = getProductById;

export type EditorProductPayload = ProductPayload;

export async function upsertProductDb(
  payload: ProductPayload,
  options?: { id?: number }
) {
  if (options?.id) {
    const updated = await updateProduct(options.id, payload);
    return updated?.id;
  }

  const created = await createProduct(payload);
  return created?.id;
}

// ============================================
// AI Recommendation Fetch
// ============================================
export interface AIRecommendationFilters {
  goal?: string;
  tech?: string;
  style?: string;
  budget?: string;
}

export async function fetchAIProducts(
  criteria: AIRecommendationFilters,
  options?: { fallback?: boolean }
): Promise<Product[]> {
  const supabase = createClient();
  if (!supabase) return [];

  let query = supabase
    .from('products')
    .select(`
      id, name, slug, description, price, original_price,
      image, images, format, rating, reviews_count, downloads_count,
      is_new, is_featured, is_bestseller, author, demo_url, tags,
      tech_stack,
      category:category_id (id, name, slug)
    `)
    .eq('status', 'active');

  // 1. Goal Filter (Broad search)
  if (criteria.goal) {
    const goalKeywords: Record<string, string[]> = {
      business: ['business', 'doanh nghiệp', 'company', 'corp', 'agency'],
      ecommerce: ['shop', 'store', 'e-commerce', 'bán hàng', 'fashion'],
      portfolio: ['portfolio', 'cá nhân', 'blog', 'profile', 'cv'],
      app: ['app', 'dashboard', 'admin', 'mobile', 'saas']
    };

    const keywords = goalKeywords[criteria.goal];
    if (keywords) {
      // Create an OR filter for keywords in name, description, or tags
      const orConditions = keywords.map(k => `name.ilike.%${k}%,description.ilike.%${k}%`).join(',');
      query = query.or(orConditions);
    }
  }

  // 2. Tech Filter (Tech stack check)
  if (criteria.tech) {
    const techMap: Record<string, string[]> = {
      react: ['React', 'ReactJS', 'Next.js', 'NextJS'],
      figma: ['Figma', 'UI Kit'],
      html: ['HTML', 'HTML5', 'CSS', 'JavaScript'],
      vue: ['Vue', 'Vue.js', 'VueJS'],
      backend: ['Laravel', 'Django', '.NET', 'ASP.NET'],
    };

    if (criteria.tech !== 'any' && techMap[criteria.tech]) {
      query = query.overlaps('tech_stack', techMap[criteria.tech]);
    }
  }

  // 3. Style Filter (Tags check)
  if (criteria.style) {
    // Assuming style is one of the tags
    const styleMap: Record<string, string> = {
      minimal: 'Minimal',
      modern: 'Modern',
      corporate: 'Corporate',
      creative: 'Creative'
    };
    if (styleMap[criteria.style]) {
      query = query.contains('tags', [styleMap[criteria.style]]);
    }
  }

  // 4. Budget Filter
  if (criteria.budget) {
    if (criteria.budget === 'low') {
      query = query.lt('price', 500000);
    } else if (criteria.budget === 'medium') {
      query = query.gte('price', 500000).lte('price', 1000000);
    } else if (criteria.budget === 'high') {
      query = query.gt('price', 1000000);
    }
  }

  const { data, error } = await query.limit(6);

  if (error) {
    console.error('Error fetching AI products:', error);
    if (options?.fallback === false) return [];
    // Fallback to fetchActiveProducts if specific query fails to ensure user sees something
    return fetchActiveProducts({ limit: 4 });
  }

  // If no results specifically matching, fallback to some popular/featured products
  if (!data || data.length === 0) {
    if (options?.fallback === false) return [];
    return fetchActiveProducts({ is_featured: true, limit: 3 });
  }

  return (data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    description: p.description ?? '',
    category: p.category?.slug ?? '',
    image: p.image,
    gallery: p.images || [],
    rating: Number(p.rating || 0),
    reviews: p.reviews_count || 0,
    isNew: p.is_new,
    isFeatured: p.is_featured,
    author: p.author ?? '',
    format: p.format as Product['format'],
    duration: '',
    students: p.downloads_count || 0,
    demoUrl: p.demo_url ?? undefined,
    tags: p.tags || [],
  }));
}
