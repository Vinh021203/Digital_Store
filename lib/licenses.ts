// lib/licenses.ts
import { createClient } from './supabase/client';

// ============================================
// Types
// ============================================
export interface DbLicense {
    id: number;
    user_id: string;
    product_id: number | null;
    order_item_id: number | null;
    license_key: string;
    type: 'Regular' | 'Extended' | 'Unlimited';
    status: 'active' | 'expired' | 'revoked';
    activations_used: number;
    activations_limit: number;
    domain: string | null;
    activated_at: string | null;
    expires_at: string | null;
    created_at: string;
    // Joined
    user?: { id: string; name: string; email: string } | null;
    product?: { id: number; name: string; slug: string; image: string } | null;
}

export interface LicensePayload {
    user_id: string;
    product_id: number;
    order_item_id?: number;
    type?: 'Regular' | 'Extended' | 'Unlimited';
    activations_limit?: number;
    expires_at?: string | null;
}

// ============================================
// Fetch all licenses (Admin)
// ============================================
export async function fetchLicenses(filters?: {
    status?: string;
    user_id?: string;
    product_id?: number;
    limit?: number;
}): Promise<DbLicense[]> {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase
        .from('licenses')
        .select(`
      *,
      user:user_id (id, name, email),
      product:product_id (id, name, slug, image)
    `)
        .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }
    if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
    }
    if (filters?.product_id) {
        query = query.eq('product_id', filters.product_id);
    }
    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching licenses:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Fetch user's licenses
// ============================================
export async function fetchUserLicenses(userId: string): Promise<DbLicense[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('licenses')
        .select(`
      *,
      product:product_id (id, name, slug, image)
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user licenses:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Get license by ID
// ============================================
export async function getLicenseById(id: number): Promise<DbLicense | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('licenses')
        .select(`
      *,
      user:user_id (id, name, email),
      product:product_id (id, name, slug, image)
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching license:', error);
        return null;
    }
    return data;
}

// ============================================
// Get license by key
// ============================================
export async function getLicenseByKey(key: string): Promise<DbLicense | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('licenses')
        .select(`
      *,
      product:product_id (id, name, slug)
    `)
        .eq('license_key', key)
        .single();

    if (error) {
        console.error('Error fetching license by key:', error);
        return null;
    }
    return data;
}

// ============================================
// Create license (auto-generates key via trigger)
// ============================================
export async function createLicense(payload: LicensePayload): Promise<DbLicense | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('licenses')
        .insert({
            user_id: payload.user_id,
            product_id: payload.product_id,
            order_item_id: payload.order_item_id || null,
            type: payload.type || 'Regular',
            activations_limit: payload.activations_limit || 1,
            expires_at: payload.expires_at || null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating license:', error);
        throw new Error(error.message);
    }
    return data;
}

// ============================================
// Activate license
// ============================================
export async function activateLicense(id: number, domain?: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    // Get current license
    const { data: license } = await supabase
        .from('licenses')
        .select('activations_used, activations_limit, status')
        .eq('id', id)
        .single();

    if (!license) throw new Error('License not found');
    if (license.status !== 'active') throw new Error('License is not active');
    if (license.activations_used >= license.activations_limit) {
        throw new Error('Activation limit reached');
    }

    const { error } = await supabase
        .from('licenses')
        .update({
            activations_used: license.activations_used + 1,
            domain: domain || null,
            activated_at: new Date().toISOString(),
        })
        .eq('id', id);

    if (error) {
        console.error('Error activating license:', error);
        throw new Error(error.message);
    }
    return true;
}

// ============================================
// Update license status
// ============================================
export async function updateLicenseStatus(
    id: number,
    status: DbLicense['status']
): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('licenses')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error('Error updating license status:', error);
        throw new Error(error.message);
    }
    return true;
}

// ============================================
// Revoke license
// ============================================
export async function revokeLicense(id: number): Promise<boolean> {
    return updateLicenseStatus(id, 'revoked');
}

// ============================================
// Get license stats (Admin)
// ============================================
export async function getLicenseStats() {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('licenses')
        .select('id, status, type');

    if (error) {
        console.error('Error fetching license stats:', error);
        return null;
    }

    const licenses = data || [];
    return {
        total: licenses.length,
        active: licenses.filter(l => l.status === 'active').length,
        expired: licenses.filter(l => l.status === 'expired').length,
        revoked: licenses.filter(l => l.status === 'revoked').length,
        byType: {
            Regular: licenses.filter(l => l.type === 'Regular').length,
            Extended: licenses.filter(l => l.type === 'Extended').length,
            Unlimited: licenses.filter(l => l.type === 'Unlimited').length,
        },
    };
}
