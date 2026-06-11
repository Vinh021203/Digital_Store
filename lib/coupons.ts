// lib/coupons.ts
import { createClient } from './supabase/client';

// ============================================
// Types
// ============================================
export interface DbCoupon {
    id: number;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_order: number;
    max_discount: number | null;
    usage_limit: number;
    used_count: number;
    applicable_to: 'all' | 'category' | 'product';
    category_ids: number[];
    product_ids: number[];
    start_date: string;
    end_date: string | null;
    is_active: boolean;
    created_at: string;
}

export interface CouponPayload {
    code: string;
    type?: 'percentage' | 'fixed';
    value: number;
    min_order?: number;
    max_discount?: number | null;
    usage_limit?: number;
    applicable_to?: 'all' | 'category' | 'product';
    category_ids?: number[];
    product_ids?: number[];
    start_date?: string;
    end_date?: string | null;
    is_active?: boolean;
}

// ============================================
// Fetch all coupons (Admin)
// ============================================
export async function fetchCoupons(filters?: {
    is_active?: boolean;
    limit?: number;
}): Promise<DbCoupon[]> {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

    if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
    }
    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching coupons:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Get coupon by code
// ============================================
export async function getCouponByCode(code: string): Promise<DbCoupon | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

    if (error) {
        console.error('Error fetching coupon:', error);
        return null;
    }
    return data;
}

// ============================================
// Validate coupon
// ============================================
export async function validateCoupon(
    code: string,
    orderTotal: number,
    productIds?: number[],
    categoryIds?: number[]
): Promise<{ valid: boolean; discount: number; error?: string }> {
    const coupon = await getCouponByCode(code);

    if (!coupon) {
        return { valid: false, discount: 0, error: 'Mã giảm giá không tồn tại' };
    }

    // Check if expired
    if (coupon.end_date && new Date(coupon.end_date) < new Date()) {
        return { valid: false, discount: 0, error: 'Mã giảm giá đã hết hạn' };
    }

    // Check if not started
    if (new Date(coupon.start_date) > new Date()) {
        return { valid: false, discount: 0, error: 'Mã giảm giá chưa có hiệu lực' };
    }

    // Check usage limit
    if (coupon.used_count >= coupon.usage_limit) {
        return { valid: false, discount: 0, error: 'Mã giảm giá đã hết lượt sử dụng' };
    }

    // Check minimum order
    if (orderTotal < coupon.min_order) {
        return { valid: false, discount: 0, error: `Đơn hàng tối thiểu ${coupon.min_order.toLocaleString()}₫` };
    }

    // Check applicable products/categories
    if (coupon.applicable_to === 'product' && productIds) {
        const hasProduct = productIds.some(id => coupon.product_ids.includes(id));
        if (!hasProduct) {
            return { valid: false, discount: 0, error: 'Mã giảm giá không áp dụng cho sản phẩm này' };
        }
    }

    if (coupon.applicable_to === 'category' && categoryIds) {
        const hasCategory = categoryIds.some(id => coupon.category_ids.includes(id));
        if (!hasCategory) {
            return { valid: false, discount: 0, error: 'Mã giảm giá không áp dụng cho danh mục này' };
        }
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'percentage') {
        discount = (orderTotal * coupon.value) / 100;
        if (coupon.max_discount && discount > coupon.max_discount) {
            discount = coupon.max_discount;
        }
    } else {
        discount = coupon.value;
    }

    return { valid: true, discount };
}

// ============================================
// Create coupon
// ============================================
export async function createCoupon(payload: CouponPayload): Promise<DbCoupon | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('coupons')
        .insert({
            code: payload.code.toUpperCase(),
            type: payload.type || 'percentage',
            value: payload.value,
            min_order: payload.min_order || 0,
            max_discount: payload.max_discount || null,
            usage_limit: payload.usage_limit || 100,
            applicable_to: payload.applicable_to || 'all',
            category_ids: payload.category_ids || [],
            product_ids: payload.product_ids || [],
            start_date: payload.start_date || new Date().toISOString(),
            end_date: payload.end_date || null,
            is_active: payload.is_active ?? true,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating coupon:', error);
        throw new Error(error.message);
    }
    return data;
}

// ============================================
// Update coupon
// ============================================
export async function updateCoupon(
    id: number,
    payload: Partial<CouponPayload>
): Promise<DbCoupon | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const updates: any = { ...payload };
    if (payload.code) updates.code = payload.code.toUpperCase();

    const { data, error } = await supabase
        .from('coupons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating coupon:', error);
        throw new Error(error.message);
    }
    return data;
}

// ============================================
// Increment coupon usage
// ============================================
export async function useCoupon(id: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { data: coupon } = await supabase
        .from('coupons')
        .select('used_count')
        .eq('id', id)
        .single();

    if (!coupon) return false;

    const { error } = await supabase
        .from('coupons')
        .update({ used_count: coupon.used_count + 1 })
        .eq('id', id);

    if (error) {
        console.error('Error using coupon:', error);
        return false;
    }
    return true;
}

// ============================================
// Delete coupon
// ============================================
export async function deleteCoupon(id: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting coupon:', error);
        throw new Error(error.message);
    }
    return true;
}

// ============================================
// Check if user has already used this coupon
// ============================================
export async function checkUserCouponUsage(
    couponId: number,
    userId: string
): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { data, error } = await supabase
        .from('coupon_usages')
        .select('id')
        .eq('coupon_id', couponId)
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found (which is OK)
        console.error('Error checking coupon usage:', error);
    }

    return !!data; // true = already used
}

// ============================================
// Record coupon usage (call when order is PAID)
// ============================================
export async function recordCouponUsage(
    couponId: number,
    userId: string,
    orderId: number
): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('coupon_usages')
        .insert({
            coupon_id: couponId,
            user_id: userId,
            order_id: orderId,
        });

    if (error) {
        // Unique constraint violation = already used, which is fine
        if (error.code === '23505') {
            return true;
        }
        console.error('Error recording coupon usage:', error);
        return false;
    }
    return true;
}

// ============================================
// Validate coupon FOR USER (includes per-user check)
// ============================================
export async function validateCouponForUser(
    code: string,
    orderTotal: number,
    userId?: string,
    productIds?: number[],
    categoryIds?: number[]
): Promise<{ valid: boolean; discount: number; couponId?: number; error?: string }> {
    const coupon = await getCouponByCode(code);

    if (!coupon) {
        return { valid: false, discount: 0, error: 'Mã giảm giá không tồn tại' };
    }

    // Check if user already used this coupon
    if (userId) {
        const alreadyUsed = await checkUserCouponUsage(coupon.id, userId);
        if (alreadyUsed) {
            return { valid: false, discount: 0, error: 'Bạn đã sử dụng mã này rồi' };
        }
    }

    // Check if expired
    if (coupon.end_date && new Date(coupon.end_date) < new Date()) {
        return { valid: false, discount: 0, error: 'Mã giảm giá đã hết hạn' };
    }

    // Check if not started
    if (new Date(coupon.start_date) > new Date()) {
        return { valid: false, discount: 0, error: 'Mã giảm giá chưa có hiệu lực' };
    }

    // Check global usage limit
    if (coupon.used_count >= coupon.usage_limit) {
        return { valid: false, discount: 0, error: 'Mã giảm giá đã hết lượt sử dụng' };
    }

    // Check minimum order
    if (orderTotal < coupon.min_order) {
        return { valid: false, discount: 0, error: `Đơn hàng tối thiểu ${coupon.min_order.toLocaleString()}₫` };
    }

    // Check applicable products/categories
    if (coupon.applicable_to === 'product' && productIds) {
        const hasProduct = productIds.some(id => coupon.product_ids.includes(id));
        if (!hasProduct) {
            return { valid: false, discount: 0, error: 'Mã giảm giá không áp dụng cho sản phẩm này' };
        }
    }

    if (coupon.applicable_to === 'category' && categoryIds) {
        const hasCategory = categoryIds.some(id => coupon.category_ids.includes(id));
        if (!hasCategory) {
            return { valid: false, discount: 0, error: 'Mã giảm giá không áp dụng cho danh mục này' };
        }
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'percentage') {
        discount = (orderTotal * coupon.value) / 100;
        if (coupon.max_discount && discount > coupon.max_discount) {
            discount = coupon.max_discount;
        }
    } else {
        discount = coupon.value;
    }

    return { valid: true, discount, couponId: coupon.id };
}
