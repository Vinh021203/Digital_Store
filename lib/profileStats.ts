// lib/profileStats.ts
import { createClient } from './supabase/client';

export interface ProfileStats {
    downloads: number;
    licenses: number;
    wishlistItems: number;
    reviewsGiven: number;
    supportTickets: number;
    activeProducts: number;
    totalSpent: number;
}

/**
 * Safe count query that returns 0 if table doesn't exist or query fails
 */
async function safeCount(
    supabase: ReturnType<typeof createClient>,
    table: string,
    filters: Record<string, any>
): Promise<number> {
    if (!supabase) return 0;
    try {
        let query = supabase.from(table).select('id', { count: 'exact', head: true });

        for (const [key, value] of Object.entries(filters)) {
            if (Array.isArray(value)) {
                query = query.in(key, value);
            } else {
                query = query.eq(key, value);
            }
        }

        const { count, error } = await query;
        if (error) return 0; // Silently return 0 if table doesn't exist
        return count || 0;
    } catch {
        return 0;
    }
}

/**
 * Fetch real profile statistics for a user
 */
export async function getProfileStats(userId: string): Promise<ProfileStats> {
    const supabase = createClient();

    if (!supabase) {
        return getDefaultStats();
    }

    try {
        // Parallel fetch all stats with safe handling
        const [
            downloads,
            licenses,
            wishlistItems,
            reviewsGiven,
            supportTickets,
            ordersResult,
        ] = await Promise.all([
            safeCount(supabase, 'downloads', { user_id: userId }),
            safeCount(supabase, 'licenses', { user_id: userId, status: 'active' }),
            safeCount(supabase, 'wishlists', { user_id: userId }),
            safeCount(supabase, 'reviews', { user_id: userId }),
            safeCount(supabase, 'tickets', { user_id: userId }),
            // Orders need special handling for total calculation
            (async () => {
                try {
                    const { data } = await supabase
                        .from('orders')
                        .select('total')
                        .eq('user_id', userId)
                        .eq('status', 'completed');
                    return data || [];
                } catch {
                    return [];
                }
            })(),
        ]);

        const totalSpent = ordersResult.reduce(
            (sum: number, order: any) => sum + (Number(order.total) || 0),
            0
        );

        return {
            downloads,
            licenses,
            wishlistItems,
            reviewsGiven,
            supportTickets,
            activeProducts: licenses,
            totalSpent,
        };
    } catch (error) {
        console.error('Error fetching profile stats:', error);
        return getDefaultStats();
    }
}

function getDefaultStats(): ProfileStats {
    return {
        downloads: 0,
        licenses: 0,
        wishlistItems: 0,
        reviewsGiven: 0,
        supportTickets: 0,
        activeProducts: 0,
        totalSpent: 0,
    };
}
