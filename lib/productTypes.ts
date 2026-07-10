import { createClient } from './supabase/client';

export interface DbProductType {
  id: number;
  name: string;
  label: string;
  slug: string;
  icon: string | null;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  product_count?: number;
}

export type ProductTypePayload = Pick<DbProductType, 'name' | 'label' | 'slug' | 'icon' | 'color' | 'sort_order' | 'is_active'>;

export const LEGACY_PRODUCT_TYPES: DbProductType[] = [
  { id: -1, name: 'Theme', label: 'Theme / UI Kit', slug: 'theme', icon: 'palette', color: 'indigo', sort_order: 1, is_active: true, created_at: '' },
  { id: -2, name: 'Template', label: 'Template (Figma, Notion, v.v.)', slug: 'template', icon: 'layout-template', color: 'purple', sort_order: 2, is_active: true, created_at: '' },
  { id: -3, name: 'Landing', label: 'Landing Page', slug: 'landing', icon: 'panel-top', color: 'emerald', sort_order: 3, is_active: true, created_at: '' },
  { id: -4, name: 'MiniApp', label: 'Mini App / Tool', slug: 'miniapp', icon: 'app-window', color: 'amber', sort_order: 4, is_active: true, created_at: '' },
  { id: -5, name: 'Bundle', label: 'Bundle', slug: 'bundle', icon: 'package', color: 'rose', sort_order: 5, is_active: true, created_at: '' },
  { id: -6, name: 'Course', label: 'Khóa học', slug: 'course', icon: 'graduation-cap', color: 'blue', sort_order: 6, is_active: true, created_at: '' },
  { id: -7, name: 'Ebook', label: 'Ebook', slug: 'ebook', icon: 'book-open', color: 'orange', sort_order: 7, is_active: true, created_at: '' },
];

export async function fetchProductTypes(activeOnly = false): Promise<DbProductType[]> {
  const supabase = createClient();
  if (!supabase) return LEGACY_PRODUCT_TYPES;
  let query = supabase.from('product_types').select('*').order('sort_order').order('label');
  if (activeOnly) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error) {
    console.warn('[ProductTypes] Migration chưa được áp dụng, đang dùng danh sách mặc định.', error.message);
    return LEGACY_PRODUCT_TYPES;
  }
  const types = data || [];
  const { data: products } = await supabase.from('products').select('product_type_id');
  return types.map(type => ({
    ...type,
    product_count: (products || []).filter(product => product.product_type_id === type.id).length,
  }));
}

export async function createProductType(payload: ProductTypePayload) {
  const supabase = createClient();
  if (!supabase) throw new Error('Supabase chưa được cấu hình');
  const { data, error } = await supabase.from('product_types').insert(payload).select().single();
  if (error) throw error;
  return data as DbProductType;
}

export async function updateProductType(id: number, payload: Partial<ProductTypePayload>) {
  const supabase = createClient();
  if (!supabase) throw new Error('Supabase chưa được cấu hình');
  const { error } = await supabase.from('product_types').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteProductType(id: number) {
  const supabase = createClient();
  if (!supabase) throw new Error('Supabase chưa được cấu hình');
  const { count } = await supabase.from('products').select('id', { count: 'exact', head: true }).eq('product_type_id', id);
  if (count) throw new Error(`Loại này đang được dùng bởi ${count} sản phẩm. Hãy chuyển sản phẩm hoặc ẩn loại.`);
  const { error } = await supabase.from('product_types').delete().eq('id', id);
  if (error) throw error;
}
