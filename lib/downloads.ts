// lib/downloads.ts
import { createClient } from './supabase/client';

// ============================================
// Types
// ============================================
export interface DbDownload {
    id: number;
    user_id: string;
    product_id: number | null;
    license_id: number | null;
    file_version: string | null;
    ip_address: string | null;
    downloaded_at: string;
    // Joined
    product?: {
        id: number;
        name: string;
        slug: string;
        image: string;
    } | null;
    license?: {
        id: number;
        license_key: string;
        type: string;
    } | null;
}

// ============================================
// Log download
// ============================================
export async function logDownload(
    userId: string,
    productId: number,
    licenseId?: number,
    fileVersion?: string,
    ipAddress?: string
): Promise<DbDownload | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('downloads')
        .insert({
            user_id: userId,
            product_id: productId,
            license_id: licenseId || null,
            file_version: fileVersion || null,
            ip_address: ipAddress || null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error logging download:', error);
        return null;
    }
    return data;
}

// ============================================
// Fetch user's download history
// ============================================
export async function fetchDownloadHistory(userId: string): Promise<DbDownload[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('downloads')
        .select(`
      *,
      product:product_id (id, name, slug, image),
      license:license_id (id, license_key, type)
    `)
        .eq('user_id', userId)
        .order('downloaded_at', { ascending: false });

    if (error) {
        console.error('Error fetching downloads:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Fetch product downloads (Admin)
// ============================================
export async function fetchProductDownloads(productId: number): Promise<DbDownload[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('downloads')
        .select('*')
        .eq('product_id', productId)
        .order('downloaded_at', { ascending: false });

    if (error) {
        console.error('Error fetching product downloads:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Get download stats (Admin)
// ============================================
export async function getDownloadStats() {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('downloads')
        .select('id, product_id, downloaded_at');

    if (error) {
        console.error('Error fetching download stats:', error);
        return null;
    }

    const downloads = data || [];
    const today = new Date().toDateString();
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    return {
        total: downloads.length,
        today: downloads.filter(d => new Date(d.downloaded_at).toDateString() === today).length,
        thisWeek: downloads.filter(d => new Date(d.downloaded_at) >= thisWeek).length,
    };
}

// ============================================
// Check if user can download
// ============================================
export async function canUserDownload(userId: string, productId: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    // Check if user has valid license for this product
    const { data: license } = await supabase
        .from('licenses')
        .select('id, status')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .eq('status', 'active')
        .maybeSingle();

    return !!license;
}
