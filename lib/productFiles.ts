// lib/productFiles.ts
// Functions to manage product file versions

import { createClient } from './supabase/client';

// ============================================
// Types
// ============================================
export interface DbProductFile {
    id: number;
    product_id: number;
    version: string;
    file_url: string;
    file_size: number;
    changelog: string | null;
    is_current: boolean;
    created_at: string;
}

export interface ProductFilePayload {
    product_id: number;
    version: string;
    file_url: string;
    file_size?: number;
    changelog?: string;
    is_current?: boolean;
}

// ============================================
// Fetch all versions for a product
// ============================================
export async function getProductVersions(productId: number): Promise<DbProductFile[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('product_files')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching product versions:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Get current (latest) version
// ============================================
export async function getCurrentVersion(productId: number): Promise<DbProductFile | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('product_files')
        .select('*')
        .eq('product_id', productId)
        .eq('is_current', true)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no rows

    if (error) {
        // Only log actual errors, not "row not found"
        if (error.code !== 'PGRST116') {
            console.error('Error fetching current version:', error);
        }
        return null;
    }
    return data;
}

// ============================================
// Get specific version by version string
// ============================================
export async function getVersionByString(productId: number, version: string): Promise<DbProductFile | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('product_files')
        .select('*')
        .eq('product_id', productId)
        .eq('version', version)
        .maybeSingle();

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching version:', error);
        return null;
    }
    return data;
}

// ============================================
// Upload new version (auto-notify via SQL trigger)
// ============================================
export async function uploadNewVersion(payload: ProductFilePayload): Promise<DbProductFile | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('product_files')
        .insert({
            product_id: payload.product_id,
            version: payload.version,
            file_url: payload.file_url,
            file_size: payload.file_size || 0,
            changelog: payload.changelog || null,
            is_current: payload.is_current !== false, // default true
        })
        .select()
        .single();

    if (error) {
        console.error('Error uploading new version:', error);
        throw new Error(error.message);
    }

    // Note: SQL trigger will automatically:
    // 1. Set old versions is_current = false
    // 2. Notify all users with active license

    return data;
}

// ============================================
// Update version info (changelog, file_url)
// ============================================
export async function updateVersion(
    fileId: number,
    updates: Partial<Pick<DbProductFile, 'file_url' | 'file_size' | 'changelog'>>
): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('product_files')
        .update(updates)
        .eq('id', fileId);

    if (error) {
        console.error('Error updating version:', error);
        return false;
    }
    return true;
}

// ============================================
// Set a specific version as current
// ============================================
export async function setCurrentVersion(productId: number, fileId: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    // First, set all versions to not current
    await supabase
        .from('product_files')
        .update({ is_current: false })
        .eq('product_id', productId);

    // Then set the specific version as current
    const { error } = await supabase
        .from('product_files')
        .update({ is_current: true })
        .eq('id', fileId);

    if (error) {
        console.error('Error setting current version:', error);
        return false;
    }
    return true;
}

// ============================================
// Delete a version (except current)
// ============================================
export async function deleteVersion(fileId: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    // Check if trying to delete current version
    const { data: fileData } = await supabase
        .from('product_files')
        .select('is_current')
        .eq('id', fileId)
        .single();

    if (fileData?.is_current) {
        throw new Error('Cannot delete current version. Set another version as current first.');
    }

    const { error } = await supabase
        .from('product_files')
        .delete()
        .eq('id', fileId);

    if (error) {
        console.error('Error deleting version:', error);
        return false;
    }
    return true;
}

// ============================================
// Check if user has access to download (has valid license)
// ============================================
export async function canUserDownload(userId: string, productId: number): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { data, error } = await supabase
        .from('licenses')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .eq('status', 'active')
        .limit(1);

    if (error) {
        console.error('Error checking download access:', error);
        return false;
    }
    return (data?.length || 0) > 0;
}

// ============================================
// Record a download
// ============================================
export async function recordDownload(
    userId: string,
    productId: number,
    licenseId: number,
    version: string
): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('downloads')
        .insert({
            user_id: userId,
            product_id: productId,
            license_id: licenseId,
            file_version: version,
        });

    if (error) {
        console.error('Error recording download:', error);
        return false;
    }
    return true;
}

// ============================================
// Get user's download history for a product
// ============================================
export async function getUserDownloadHistory(
    userId: string,
    productId: number
): Promise<{ version: string; downloaded_at: string }[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('downloads')
        .select('file_version, downloaded_at')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .order('downloaded_at', { ascending: false });

    if (error) {
        console.error('Error fetching download history:', error);
        return [];
    }
    return data?.map(d => ({ version: d.file_version || '', downloaded_at: d.downloaded_at })) || [];
}

// ============================================
// Check if there's a new version since user's last download
// ============================================
export async function hasNewVersion(userId: string, productId: number): Promise<{
    hasNew: boolean;
    currentVersion: string | null;
    lastDownloadedVersion: string | null;
}> {
    const [currentVersionData, downloadHistory] = await Promise.all([
        getCurrentVersion(productId),
        getUserDownloadHistory(userId, productId)
    ]);

    const currentVersion = currentVersionData?.version || null;
    const lastDownloadedVersion = downloadHistory[0]?.version || null;

    // If never downloaded, it's "new"
    if (!lastDownloadedVersion && currentVersion) {
        return { hasNew: true, currentVersion, lastDownloadedVersion };
    }

    // If versions differ, there's a new version
    const hasNew = currentVersion !== lastDownloadedVersion;
    return { hasNew, currentVersion, lastDownloadedVersion };
}
