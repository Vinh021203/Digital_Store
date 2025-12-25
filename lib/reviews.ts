// lib/reviews.ts
import { createClient } from './supabase/client';
import { createActivityLog } from './activityLogs';

// ============================================
// Types
// ============================================
export interface DbReview {
    id: number;
    product_id: number;
    user_id: string;
    rating: number;
    comment: string | null;
    helpful_count: number;
    is_verified_purchase: boolean;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
    // Joined
    user?: { id: string; name: string; avatar: string } | null;
    product?: { id: number; name: string; slug: string; image: string } | null;
}

export interface ReviewPayload {
    product_id: number;
    user_id: string;
    rating: number;
    comment?: string | null;
}

// ============================================
// Fetch reviews for a product (public)
// ============================================
export async function fetchProductReviews(productId: number): Promise<DbReview[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('reviews')
        .select(`
            *,
            user:user_id (id, name, avatar)
        `)
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Check if user already reviewed this product
// ============================================
export async function hasUserReviewed(productId: number, userId: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { data, error } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error checking review:', error);
    }
    return !!data;
}

// ============================================
// Check if user has purchased this product
// ============================================
export async function hasUserPurchased(productId: number, userId: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { data, error } = await supabase
        .from('licenses')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .limit(1);

    if (error) {
        console.error('Error checking purchase:', error);
        return false;
    }
    return data && data.length > 0;
}

// ============================================
// Create review
// ============================================
export async function createReview(payload: ReviewPayload): Promise<DbReview | null> {
    const supabase = createClient();
    if (!supabase) return null;

    // Check if user is verified purchaser
    const isVerified = await hasUserPurchased(payload.product_id, payload.user_id);

    const { data, error } = await supabase
        .from('reviews')
        .insert({
            product_id: payload.product_id,
            user_id: payload.user_id,
            rating: payload.rating,
            comment: payload.comment || null,
            is_verified_purchase: isVerified,
            is_approved: true, // Auto approve for now
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating review:', error);
        throw new Error(error.message);
    }

    // Log user review creation
    await createActivityLog({
        user_id: payload.user_id,
        action: 'Create',
        entity: 'review',
        entity_id: data.id.toString(),
        entity_name: `Đánh giá ${payload.rating} sao`,
        details: payload.comment ? `"${payload.comment.substring(0, 50)}..."` : `Đánh giá ${payload.rating}/5 sao`,
        severity: 'success',
    });

    return data;
}

// ============================================
// Mark review as helpful
// ============================================
export async function markReviewHelpful(reviewId: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { data: review } = await supabase
        .from('reviews')
        .select('helpful_count')
        .eq('id', reviewId)
        .single();

    if (!review) return false;

    const { error } = await supabase
        .from('reviews')
        .update({ helpful_count: review.helpful_count + 1 })
        .eq('id', reviewId);

    if (error) {
        console.error('Error marking helpful:', error);
        return false;
    }
    return true;
}

// ============================================
// Delete review
// ============================================
export async function deleteReview(reviewId: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

    if (error) {
        console.error('Error deleting review:', error);
        return false;
    }
    return true;
}

// ============================================
// Get product rating stats
// ============================================
export async function getProductRatingStats(productId: number): Promise<{
    average: number;
    total: number;
    distribution: number[];
}> {
    const supabase = createClient();
    if (!supabase) return { average: 0, total: 0, distribution: [0, 0, 0, 0, 0] };

    const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId)
        .eq('is_approved', true);

    if (error || !data || data.length === 0) {
        return { average: 0, total: 0, distribution: [0, 0, 0, 0, 0] };
    }

    const total = data.length;
    const sum = data.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / total;

    // Distribution: [1-star, 2-star, 3-star, 4-star, 5-star]
    const distribution = [0, 0, 0, 0, 0];
    data.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
            distribution[r.rating - 1]++;
        }
    });

    return { average, total, distribution };
}

// ============================================
// Admin: Fetch ALL reviews
// ============================================
export async function fetchAllReviews(filters?: {
    productId?: number;
    isApproved?: boolean;
    limit?: number;
}): Promise<DbReview[]> {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase
        .from('reviews')
        .select(`
            *,
            user:user_id (id, name, avatar),
            product:product_id (id, name, slug, image)
        `)
        .order('created_at', { ascending: false });

    if (filters?.productId) {
        query = query.eq('product_id', filters.productId);
    }
    if (filters?.isApproved !== undefined) {
        query = query.eq('is_approved', filters.isApproved);
    }
    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching all reviews:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Admin: Toggle review approval
// ============================================
export async function toggleReviewApproval(reviewId: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { data: review } = await supabase
        .from('reviews')
        .select('is_approved')
        .eq('id', reviewId)
        .single();

    if (!review) return false;

    const { error } = await supabase
        .from('reviews')
        .update({ is_approved: !review.is_approved })
        .eq('id', reviewId);

    if (error) {
        console.error('Error toggling approval:', error);
        return false;
    }
    return true;
}
