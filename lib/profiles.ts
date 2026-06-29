// lib/profiles.ts
import { createClient } from './supabase/client';

// ============================================
// Types
// ============================================
export interface DbProfile {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    cover_image: string | null;
    role: 'user' | 'admin';
    is_affiliate: boolean;
    affiliate_code: string | null;
    phone: string | null;
    address: string | null;
    profile_text_color: string | null;
    created_at: string;
    updated_at: string;
}

export interface ProfilePayload {
    name?: string;
    avatar?: string | null;
    cover_image?: string | null;
    phone?: string | null;
    address?: string | null;
    profile_text_color?: string | null;
}

// ============================================
// Get current user profile
// ============================================
export async function getCurrentProfile(): Promise<DbProfile | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data;
}

// ============================================
// Get profile by ID
// ============================================
export async function getProfileById(id: string): Promise<DbProfile | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data;
}

// ============================================
// Update profile
// ============================================
export async function updateProfile(
    id: string,
    payload: ProfilePayload
): Promise<DbProfile | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating profile:', error);
        throw new Error(error.message);
    }
    return data;
}

// ============================================
// Enable affiliate
// ============================================
export async function enableAffiliate(id: string): Promise<DbProfile | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('profiles')
        .update({ is_affiliate: true })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error enabling affiliate:', error);
        throw new Error(error.message);
    }
    return data;
}

// ============================================
// Fetch all users (Admin)
// ============================================
export async function fetchAllProfiles(filters?: {
    role?: string;
    is_affiliate?: boolean;
    search?: string;
    limit?: number;
}): Promise<DbProfile[]> {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (filters?.role && filters.role !== 'all') {
        query = query.eq('role', filters.role);
    }
    if (filters?.is_affiliate !== undefined) {
        query = query.eq('is_affiliate', filters.is_affiliate);
    }
    if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }
    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching profiles:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Update user role (Admin)
// ============================================
export async function updateUserRole(
    id: string,
    role: DbProfile['role']
): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id);

    if (error) {
        console.error('Error updating user role:', error);
        throw new Error(error.message);
    }
    return true;
}

// ============================================
// Get user stats (Admin)
// ============================================
export async function getUserStats() {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('id, role, is_affiliate, created_at');

    if (error) {
        console.error('Error fetching user stats:', error);
        return null;
    }

    const users = data || [];
    const today = new Date().toDateString();

    return {
        total: users.length,
        users: users.filter(u => u.role === 'user').length,
        admins: users.filter(u => u.role === 'admin').length,
        affiliates: users.filter(u => u.is_affiliate).length,
        newToday: users.filter(u => new Date(u.created_at).toDateString() === today).length,
    };
}
