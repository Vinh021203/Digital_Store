// lib/affiliates.ts
import { createClient } from './supabase/client';

// ============================================
// Types
// ============================================
export interface DbAffiliateReferral {
    id: number;
    referrer_id: string;
    referred_id: string | null;
    order_id: number | null;
    commission: number;
    status: 'pending' | 'approved' | 'paid' | 'rejected';
    created_at: string;
    // Joined
    referrer?: { id: string; name: string; email: string } | null;
    order?: { id: number; total: number; status: string } | null;
}

export interface AffiliateReferralPayload {
    referrer_id: string;
    referred_id?: string;
    order_id: number;
    commission: number;
    status?: 'pending' | 'approved' | 'paid' | 'rejected';
}

export interface DbAffiliateWithdrawal {
    id: number;
    user_id: string;
    amount: number;
    method: string;
    account_info: string | null;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    notes: string | null;
    processed_by: string | null;
    created_at: string;
    processed_at: string | null;
}

// ============================================
// Get affiliate by code (returns user profile)
// ============================================
export async function getAffiliateByCode(affiliateCode: string) {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, affiliate_code')
        .eq('affiliate_code', affiliateCode)
        .eq('is_affiliate', true)
        .single();

    if (error) {
        console.error('Error fetching affiliate:', error);
        return null;
    }
    return data;
}

// ============================================
// Create affiliate referral record
// ============================================
export async function createAffiliateReferral(payload: AffiliateReferralPayload): Promise<DbAffiliateReferral | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('affiliate_referrals')
        .insert({
            referrer_id: payload.referrer_id,
            referred_id: payload.referred_id || null,
            order_id: payload.order_id,
            commission: payload.commission,
            status: payload.status || 'pending',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating affiliate referral:', error);
        // Don't throw - affiliate tracking should not break checkout
        return null;
    }
    return data;
}

// ============================================
// Fetch affiliate referrals for a user
// ============================================
export async function fetchAffiliateReferrals(referrerId: string): Promise<DbAffiliateReferral[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('affiliate_referrals')
        .select(`
            *,
            order:order_id (id, total, status)
        `)
        .eq('referrer_id', referrerId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching affiliate referrals:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Get affiliate stats for dashboard
// ============================================
export async function getAffiliateStats(userId: string) {
    const supabase = createClient();
    if (!supabase) return null;

    const { data: referrals, error } = await supabase
        .from('affiliate_referrals')
        .select('id, commission, status, created_at')
        .eq('referrer_id', userId);

    if (error) {
        console.error('Error fetching affiliate stats:', error);
        return null;
    }

    const allReferrals = referrals || [];
    const totalEarnings = allReferrals.reduce((sum, r) => sum + (r.commission || 0), 0);
    const approvedEarnings = allReferrals
        .filter(r => r.status === 'approved' || r.status === 'paid')
        .reduce((sum, r) => sum + (r.commission || 0), 0);
    const paidEarnings = allReferrals
        .filter(r => r.status === 'paid')
        .reduce((sum, r) => sum + (r.commission || 0), 0);
    const pendingEarnings = allReferrals
        .filter(r => r.status === 'pending')
        .reduce((sum, r) => sum + (r.commission || 0), 0);

    return {
        totalReferrals: allReferrals.length,
        totalEarnings,
        approvedEarnings,
        paidEarnings,
        pendingEarnings,
        availableBalance: approvedEarnings - paidEarnings,
    };
}

// ============================================
// Update referral status (Admin)
// ============================================
export async function updateReferralStatus(
    id: number,
    status: DbAffiliateReferral['status']
): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('affiliate_referrals')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error('Error updating referral status:', error);
        return false;
    }
    return true;
}

// ============================================
// Request withdrawal
// ============================================
export async function requestWithdrawal(
    userId: string,
    amount: number,
    method: string,
    accountInfo: string
): Promise<DbAffiliateWithdrawal | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('affiliate_withdrawals')
        .insert({
            user_id: userId,
            amount,
            method,
            account_info: accountInfo,
            status: 'pending',
        })
        .select()
        .single();

    if (error) {
        console.error('Error requesting withdrawal:', error);
        throw new Error(error.message);
    }
    return data;
}

// ============================================
// Fetch user withdrawals
// ============================================
export async function fetchUserWithdrawals(userId: string): Promise<DbAffiliateWithdrawal[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('affiliate_withdrawals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching withdrawals:', error);
        return [];
    }
    return data || [];
}
