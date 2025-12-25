// lib/sellers.ts
import { createClient } from './supabase/client';

// ============================================
// Types
// ============================================
export interface DbSeller {
    id: number;
    user_id: string;
    store_name: string;
    store_slug: string;
    description: string | null;
    logo: string | null;
    banner: string | null;
    rating: number;
    total_sales: number;
    total_products: number;
    total_earnings: number;
    balance: number;
    status: 'active' | 'pending' | 'suspended';
    is_verified: boolean;
    bank_name: string | null;
    bank_account: string | null;
    created_at: string;
    updated_at: string;
    // Joined
    user?: { id: string; name: string; email: string; avatar: string } | null;
}

export interface SellerPayload {
    user_id: string;
    store_name: string;
    store_slug?: string;
    description?: string;
    logo?: string;
    banner?: string;
    bank_name?: string;
    bank_account?: string;
}

// ============================================
// Helper: Generate slug
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
// Fetch all sellers (Admin)
// ============================================
export async function fetchSellers(filters?: {
    status?: string;
    is_verified?: boolean;
    limit?: number;
}): Promise<DbSeller[]> {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase
        .from('sellers')
        .select(`
      *,
      user:user_id (id, name, email, avatar)
    `)
        .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }
    if (filters?.is_verified !== undefined) {
        query = query.eq('is_verified', filters.is_verified);
    }
    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching sellers:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Get seller by ID
// ============================================
export async function getSellerById(id: number): Promise<DbSeller | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('sellers')
        .select(`
      *,
      user:user_id (id, name, email, avatar)
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching seller:', error);
        return null;
    }
    return data;
}

// ============================================
// Get seller by user ID
// ============================================
export async function getSellerByUserId(userId: string): Promise<DbSeller | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        console.error('Error fetching seller by user:', error);
        return null;
    }
    return data;
}

// ============================================
// Get seller by slug (public)
// ============================================
export async function getSellerBySlug(slug: string): Promise<DbSeller | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('sellers')
        .select(`
      *,
      user:user_id (id, name, avatar)
    `)
        .eq('store_slug', slug)
        .eq('status', 'active')
        .single();

    if (error) {
        console.error('Error fetching seller by slug:', error);
        return null;
    }
    return data;
}

// ============================================
// Create seller (register as seller)
// ============================================
export async function createSeller(payload: SellerPayload): Promise<DbSeller | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const slug = payload.store_slug || generateSlug(payload.store_name);

    const { data, error } = await supabase
        .from('sellers')
        .insert({
            user_id: payload.user_id,
            store_name: payload.store_name,
            store_slug: slug,
            description: payload.description || null,
            logo: payload.logo || null,
            banner: payload.banner || null,
            bank_name: payload.bank_name || null,
            bank_account: payload.bank_account || null,
            status: 'pending',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating seller:', error);
        throw new Error(error.message);
    }

    // Only update role to seller if user is NOT an admin
    // Admins keep their admin role even when becoming sellers
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', payload.user_id)
        .single();

    if (profile && profile.role !== 'admin') {
        await supabase
            .from('profiles')
            .update({ role: 'seller' })
            .eq('id', payload.user_id);
    }

    return data;
}

// ============================================
// Update seller
// ============================================
export async function updateSeller(
    id: number,
    payload: Partial<SellerPayload>
): Promise<DbSeller | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const updates: any = {};
    if (payload.store_name !== undefined) updates.store_name = payload.store_name;
    if (payload.description !== undefined) updates.description = payload.description;
    if (payload.logo !== undefined) updates.logo = payload.logo;
    if (payload.banner !== undefined) updates.banner = payload.banner;
    if (payload.bank_name !== undefined) updates.bank_name = payload.bank_name;
    if (payload.bank_account !== undefined) updates.bank_account = payload.bank_account;

    const { data, error } = await supabase
        .from('sellers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating seller:', error);
        throw new Error(error.message);
    }
    return data;
}

// ============================================
// Update seller status (Admin)
// ============================================
export async function updateSellerStatus(
    id: number,
    status: DbSeller['status']
): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('sellers')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error('Error updating seller status:', error);
        throw new Error(error.message);
    }
    return true;
}

// ============================================
// Verify seller (Admin)
// ============================================
export async function verifySeller(id: number, verified: boolean): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('sellers')
        .update({ is_verified: verified })
        .eq('id', id);

    if (error) {
        console.error('Error verifying seller:', error);
        throw new Error(error.message);
    }
    return true;
}

// ============================================
// Get seller stats
// ============================================
export async function getSellerStats() {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('sellers')
        .select('id, status, is_verified, total_sales, total_earnings');

    if (error) {
        console.error('Error fetching seller stats:', error);
        return null;
    }

    const sellers = data || [];
    return {
        total: sellers.length,
        active: sellers.filter(s => s.status === 'active').length,
        pending: sellers.filter(s => s.status === 'pending').length,
        suspended: sellers.filter(s => s.status === 'suspended').length,
        verified: sellers.filter(s => s.is_verified).length,
        totalSales: sellers.reduce((sum, s) => sum + s.total_sales, 0),
        totalEarnings: sellers.reduce((sum, s) => sum + Number(s.total_earnings), 0),
    };
}
