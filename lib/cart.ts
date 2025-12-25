// lib/cart.ts
import { createClient } from './supabase/client';

// ============================================
// Types
// ============================================
export interface DbCartItem {
    id: number;
    user_id: string;
    product_id: number;
    license_type: 'Regular' | 'Extended' | 'Unlimited';
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
    } | null;
}

export interface CartPayload {
    user_id: string;
    product_id: number;
    license_type?: 'Regular' | 'Extended' | 'Unlimited';
}

// ============================================
// Get license price multiplier
// ============================================
function getLicenseMultiplier(type: string): number {
    switch (type) {
        case 'Extended':
            return 2.5;
        case 'Unlimited':
            return 5;
        default:
            return 1;
    }
}

// ============================================
// Fetch user's cart
// ============================================
export async function fetchCart(userId: string): Promise<DbCartItem[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('carts')
        .select(`
      *,
      product:product_id (id, name, slug, price, original_price, image, author)
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching cart:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Get cart count
// ============================================
export async function getCartCount(userId: string): Promise<number> {
    const supabase = createClient();
    if (!supabase) return 0;

    const { count, error } = await supabase
        .from('carts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

    if (error) {
        console.error('Error getting cart count:', error);
        return 0;
    }
    return count || 0;
}

// ============================================
// Get cart total
// ============================================
export async function getCartTotal(userId: string): Promise<{ subtotal: number; items: number }> {
    const cart = await fetchCart(userId);

    let subtotal = 0;
    cart.forEach(item => {
        if (item.product) {
            const basePrice = Number(item.product.price);
            const multiplier = getLicenseMultiplier(item.license_type);
            subtotal += basePrice * multiplier;
        }
    });

    return { subtotal, items: cart.length };
}

// ============================================
// Add to cart
// ============================================
export async function addToCart(payload: CartPayload): Promise<DbCartItem | null> {
    const supabase = createClient();
    if (!supabase) return null;

    // Check if product already in cart
    const { data: existing } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', payload.user_id)
        .eq('product_id', payload.product_id)
        .maybeSingle();

    if (existing) {
        // Update license type if exists
        const { data, error } = await supabase
            .from('carts')
            .update({ license_type: payload.license_type || 'Regular' })
            .eq('id', existing.id)
            .select(`
        *,
        product:product_id (id, name, slug, price, original_price, image, author)
      `)
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    const { data, error } = await supabase
        .from('carts')
        .insert({
            user_id: payload.user_id,
            product_id: payload.product_id,
            license_type: payload.license_type || 'Regular',
        })
        .select(`
      *,
      product:product_id (id, name, slug, price, original_price, image, author)
    `)
        .single();

    if (error) {
        console.error('Error adding to cart:', error);
        throw new Error(error.message);
    }
    return data;
}

// ============================================
// Update cart item license type
// ============================================
export async function updateCartItemLicense(
    id: number,
    licenseType: 'Regular' | 'Extended' | 'Unlimited'
): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('carts')
        .update({ license_type: licenseType })
        .eq('id', id);

    if (error) {
        console.error('Error updating cart item:', error);
        return false;
    }
    return true;
}

// ============================================
// Remove from cart
// ============================================
export async function removeFromCart(id: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('carts')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error removing from cart:', error);
        return false;
    }
    return true;
}

// ============================================
// Clear cart
// ============================================
export async function clearCart(userId: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('carts')
        .delete()
        .eq('user_id', userId);

    if (error) {
        console.error('Error clearing cart:', error);
        return false;
    }
    return true;
}

// ============================================
// Check if product in cart
// ============================================
export async function isProductInCart(userId: string, productId: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { data } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();

    return !!data;
}
