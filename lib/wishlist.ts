// lib/wishlist.ts
import { createClient } from './supabase/client';

// ============================================
// Types
// ============================================
export interface DbWishlistItem {
    id: number;
    user_id: string;
    product_id: number;
    created_at: string;
    // Joined
    product?: {
        id: number;
        name: string;
        slug: string;
        price: number;
        original_price: number | null;
        image: string;
        author: string;
        rating: number;
    } | null;
}

// ============================================
// Fetch user's wishlist
// ============================================
export async function fetchWishlist(userId: string): Promise<DbWishlistItem[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('wishlists')
        .select(`
      *,
      product:product_id (id, name, slug, price, original_price, image, author, rating)
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching wishlist:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Get wishlist count
// ============================================
export async function getWishlistCount(userId: string): Promise<number> {
    const supabase = createClient();
    if (!supabase) return 0;

    const { count, error } = await supabase
        .from('wishlists')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

    if (error) {
        console.error('Error getting wishlist count:', error);
        return 0;
    }
    return count || 0;
}

// ============================================
// Add to wishlist
// ============================================
export async function addToWishlist(userId: string, productId: number): Promise<DbWishlistItem | null> {
    const supabase = createClient();
    if (!supabase) return null;

    // Check if already in wishlist
    const { data: existing } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();

    if (existing) {
        throw new Error('Sản phẩm đã có trong danh sách yêu thích');
    }

    const { data, error } = await supabase
        .from('wishlists')
        .insert({
            user_id: userId,
            product_id: productId,
        })
        .select(`
      *,
      product:product_id (id, name, slug, price, original_price, image, author, rating)
    `)
        .single();

    if (error) {
        console.error('Error adding to wishlist:', error);
        throw new Error(error.message);
    }
    return data;
}

// ============================================
// Remove from wishlist
// ============================================
export async function removeFromWishlist(id: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error removing from wishlist:', error);
        return false;
    }
    return true;
}

// ============================================
// Remove by product ID
// ============================================
export async function removeProductFromWishlist(userId: string, productId: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

    if (error) {
        console.error('Error removing from wishlist:', error);
        return false;
    }
    return true;
}

// ============================================
// Toggle wishlist (add if not exists, remove if exists)
// ============================================
export async function toggleWishlist(userId: string, productId: number): Promise<boolean> {
    const isInWishlist = await isProductInWishlist(userId, productId);

    if (isInWishlist) {
        await removeProductFromWishlist(userId, productId);
        return false; // Removed
    } else {
        await addToWishlist(userId, productId);
        return true; // Added
    }
}

// ============================================
// Check if product in wishlist
// ============================================
export async function isProductInWishlist(userId: string, productId: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { data } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();

    return !!data;
}

// ============================================
// Clear wishlist
// ============================================
export async function clearWishlist(userId: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', userId);

    if (error) {
        console.error('Error clearing wishlist:', error);
        return false;
    }
    return true;
}
