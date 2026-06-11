// lib/categories.ts
import { createClient } from './supabase/client';

// ============================================
// Types
// ============================================
export interface DbCategory {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    description: string | null;
    parent_id: number | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    product_count?: number;
}

export interface CategoryPayload {
    name: string;
    slug?: string;
    icon?: string | null;
    description?: string | null;
    parent_id?: number | null;
    sort_order?: number;
    is_active?: boolean;
}

// ============================================
// Helper: Generate slug from name
// ============================================
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// ============================================
// Fetch all categories
// ============================================
export async function fetchCategories(): Promise<DbCategory[]> {
    const supabase = createClient();

    if (!supabase) {
        console.error('[Categories] Supabase client not initialized');
        return [];
    }

    // Get categories with product count
    const { data, error } = await supabase
        .from('categories')
        .select(`
      id,
      name,
      slug,
      icon,
      description,
      parent_id,
      sort_order,
      is_active,
      created_at
    `)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

    if (error) {
        console.error('[Categories] Error fetching categories:', error);
        return [];
    }

    // Get product counts for each category
    const { data: productCounts, error: countError } = await supabase
        .from('products')
        .select('category_id')
        .eq('status', 'active');

    const countMap: Record<number, number> = {};
    if (!countError && productCounts) {
        productCounts.forEach((p: any) => {
            if (p.category_id) {
                countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
            }
        });
    }

    const result = (data || []).map((cat: any) => ({
        ...cat,
        product_count: countMap[cat.id] || 0,
    }));

    return result;
}

// ============================================
// Fetch active categories only (for public use)
// ============================================
export async function fetchActiveCategories(): Promise<DbCategory[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching active categories:', error);
        return [];
    }

    return data || [];
}

// ============================================
// Get category by ID
// ============================================
export async function getCategoryById(id: number): Promise<DbCategory | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching category:', error);
        return null;
    }

    return data;
}

// ============================================
// Get category by slug
// ============================================
export async function getCategoryBySlug(slug: string): Promise<DbCategory | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Error fetching category by slug:', error);
        return null;
    }

    return data;
}

// ============================================
// Create new category
// ============================================
export async function createCategory(payload: CategoryPayload): Promise<DbCategory | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const slug = payload.slug || generateSlug(payload.name);

    // Check if slug exists
    const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const { data, error } = await supabase
        .from('categories')
        .insert({
            name: payload.name,
            slug: finalSlug,
            icon: payload.icon || null,
            description: payload.description || null,
            parent_id: payload.parent_id || null,
            sort_order: payload.sort_order ?? 0,
            is_active: payload.is_active ?? true,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating category:', error);
        throw new Error(error.message);
    }

    return data;
}

// ============================================
// Update category
// ============================================
export async function updateCategory(
    id: number,
    payload: Partial<CategoryPayload>
): Promise<DbCategory | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const updates: any = {};

    if (payload.name !== undefined) {
        updates.name = payload.name;
        // Optionally update slug if name changes
        if (payload.slug === undefined) {
            updates.slug = generateSlug(payload.name);
        }
    }
    if (payload.slug !== undefined) updates.slug = payload.slug;
    if (payload.icon !== undefined) updates.icon = payload.icon;
    if (payload.description !== undefined) updates.description = payload.description;
    if (payload.parent_id !== undefined) updates.parent_id = payload.parent_id;
    if (payload.sort_order !== undefined) updates.sort_order = payload.sort_order;
    if (payload.is_active !== undefined) updates.is_active = payload.is_active;

    const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating category:', error);
        throw new Error(error.message);
    }

    return data;
}

// ============================================
// Delete category
// ============================================
export async function deleteCategory(id: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    // Check if category has products
    const { count } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', id);

    if (count && count > 0) {
        throw new Error(`Không thể xóa danh mục này vì có ${count} sản phẩm đang sử dụng.`);
    }

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting category:', error);
        throw new Error(error.message);
    }

    return true;
}

// ============================================
// Update sort order (bulk update)
// ============================================
export async function updateCategorySortOrder(
    updates: { id: number; sort_order: number }[]
): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    // Use Promise.all to update all categories
    const results = await Promise.all(
        updates.map(({ id, sort_order }) =>
            supabase
                .from('categories')
                .update({ sort_order })
                .eq('id', id)
        )
    );

    const hasError = results.some(r => r.error);
    if (hasError) {
        console.error('Error updating sort order');
        return false;
    }

    return true;
}

// ============================================
// Get categories with children (tree structure)
// ============================================
export async function getCategoryTree(): Promise<(DbCategory & { children: DbCategory[] })[]> {
    const categories = await fetchCategories();

    const rootCategories = categories.filter(c => !c.parent_id);
    const childMap: Record<number, DbCategory[]> = {};

    categories.forEach(cat => {
        if (cat.parent_id) {
            if (!childMap[cat.parent_id]) {
                childMap[cat.parent_id] = [];
            }
            childMap[cat.parent_id].push(cat);
        }
    });

    return rootCategories.map(root => ({
        ...root,
        children: childMap[root.id] || [],
    }));
}
