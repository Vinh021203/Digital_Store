// lib/affiliate.ts
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
    referred?: { id: string; name: string; email: string } | null;
    order?: { id: number; total: number } | null;
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
    // Joined
    user?: { id: string; name: string; email: string } | null;
    processor?: { id: string; name: string } | null;
}

export interface ReferralPayload {
    referrer_id: string;
    referred_id?: string;
    order_id?: number;
    commission: number;
}

export interface WithdrawalPayload {
    user_id: string;
    amount: number;
    method?: string;
    account_info?: string;
}

// ============================================
// Get affiliate info by code
// ============================================
export async function getAffiliateByCode(code: string): Promise<{ id: string; name: string } | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('affiliate_code', code)
        .eq('is_affiliate', true)
        .single();

    if (error) {
        console.error('Error fetching affiliate:', error);
        return null;
    }
    return data;
}

// ============================================
// Get affiliate stats for user
// ============================================
export async function getAffiliateStats(userId: string) {
    const supabase = createClient();
    if (!supabase) return null;

    // Get affiliate code
    const { data: profile } = await supabase
        .from('profiles')
        .select('affiliate_code, is_affiliate')
        .eq('id', userId)
        .single();

    if (!profile || !profile.is_affiliate) {
        return null;
    }

    // Get referrals
    const { data: referrals } = await supabase
        .from('affiliate_referrals')
        .select('id, commission, status')
        .eq('referrer_id', userId);

    const refs = referrals || [];
    const approved = refs.filter(r => r.status === 'approved' || r.status === 'paid');
    const pending = refs.filter(r => r.status === 'pending');

    // Get withdrawals
    const { data: withdrawals } = await supabase
        .from('affiliate_withdrawals')
        .select('id, amount, status')
        .eq('user_id', userId);

    const wds = withdrawals || [];
    const paidOut = wds.filter(w => w.status === 'completed');

    const totalCommission = approved.reduce((sum, r) => sum + Number(r.commission), 0);
    const paidAmount = paidOut.reduce((sum, w) => sum + Number(w.amount), 0);

    return {
        affiliateCode: profile.affiliate_code,
        totalReferrals: refs.length,
        pendingReferrals: pending.length,
        approvedReferrals: approved.length,
        totalCommission,
        paidOut: paidAmount,
        availableBalance: totalCommission - paidAmount,
        pendingCommission: pending.reduce((sum, r) => sum + Number(r.commission), 0),
    };
}

// ============================================
// Fetch referrals (Admin)
// ============================================
export async function fetchReferrals(filters?: {
    status?: string;
    referrer_id?: string;
    limit?: number;
}): Promise<DbAffiliateReferral[]> {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase
        .from('affiliate_referrals')
        .select(`
      *,
      referrer:referrer_id (id, name, email),
      referred:referred_id (id, name, email),
      order:order_id (id, total)
    `)
        .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }
    if (filters?.referrer_id) {
        query = query.eq('referrer_id', filters.referrer_id);
    }
    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching referrals:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Fetch user's referrals
// ============================================
export async function fetchUserReferrals(userId: string): Promise<DbAffiliateReferral[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('affiliate_referrals')
        .select(`
      *,
      referred:referred_id (id, name),
      order:order_id (id, total)
    `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user referrals:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Create referral
// ============================================
export async function createReferral(payload: ReferralPayload): Promise<DbAffiliateReferral | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('affiliate_referrals')
        .insert({
            referrer_id: payload.referrer_id,
            referred_id: payload.referred_id || null,
            order_id: payload.order_id || null,
            commission: payload.commission,
            status: 'pending',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating referral:', error);
        throw new Error(error.message);
    }
    return data;
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
        throw new Error(error.message);
    }
    return true;
}

// ============================================
// Approve referral (Admin)
// ============================================
export async function approveReferral(id: number): Promise<boolean> {
    return updateReferralStatus(id, 'approved');
}

// ============================================
// Reject referral (Admin)
// ============================================
export async function rejectReferral(id: number): Promise<boolean> {
    return updateReferralStatus(id, 'rejected');
}

// ============================================
// Fetch withdrawals (Admin)
// ============================================
export async function fetchWithdrawals(filters?: {
    status?: string;
    user_id?: string;
    limit?: number;
}): Promise<DbAffiliateWithdrawal[]> {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase
        .from('affiliate_withdrawals')
        .select(`
      *,
      user:user_id (id, name, email),
      processor:processed_by (id, name)
    `)
        .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }
    if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
    }
    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching withdrawals:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Fetch user's withdrawals
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
        console.error('Error fetching user withdrawals:', error);
        return [];
    }
    return data || [];
}

// ============================================
// Create withdrawal request
// ============================================
export async function createWithdrawalRequest(payload: WithdrawalPayload): Promise<DbAffiliateWithdrawal | null> {
    const supabase = createClient();
    if (!supabase) return null;

    // Check available balance
    const stats = await getAffiliateStats(payload.user_id);
    if (!stats || stats.availableBalance < payload.amount) {
        throw new Error('Số dư không đủ để rút');
    }

    const { data, error } = await supabase
        .from('affiliate_withdrawals')
        .insert({
            user_id: payload.user_id,
            amount: payload.amount,
            method: payload.method || 'bank_transfer',
            account_info: payload.account_info || null,
            status: 'pending',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating withdrawal:', error);
        throw new Error(error.message);
    }
    return data;
}

// ============================================
// Process withdrawal (Admin)
// ============================================
export async function processWithdrawal(
    id: number,
    status: 'processing' | 'completed' | 'failed',
    processedBy: string,
    notes?: string
): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const updates: any = {
        status,
        processed_by: processedBy,
    };

    if (status === 'completed' || status === 'failed') {
        updates.processed_at = new Date().toISOString();
    }
    if (notes) {
        updates.notes = notes;
    }

    const { error } = await supabase
        .from('affiliate_withdrawals')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('Error processing withdrawal:', error);
        throw new Error(error.message);
    }

    // If completed, mark related referrals as paid
    if (status === 'completed') {
        const { data: withdrawal } = await supabase
            .from('affiliate_withdrawals')
            .select('user_id')
            .eq('id', id)
            .single();

        if (withdrawal) {
            await supabase
                .from('affiliate_referrals')
                .update({ status: 'paid' })
                .eq('referrer_id', withdrawal.user_id)
                .eq('status', 'approved');
        }
    }

    return true;
}

// ============================================
// Calculate commission for order
// ============================================
export function calculateCommission(orderTotal: number, commissionRate: number = 10): number {
    return (orderTotal * commissionRate) / 100;
}

// ============================================
// Track affiliate click/conversion
// ============================================
export async function trackAffiliateOrder(
    affiliateCode: string,
    orderId: number,
    orderTotal: number,
    referredUserId?: string,
    commissionRate?: number // Rate from product's commission_rate field
): Promise<boolean> {
    const affiliate = await getAffiliateByCode(affiliateCode);
    if (!affiliate) return false;

    // Use product's commission rate or default to 10%
    const commission = calculateCommission(orderTotal, commissionRate ?? 10);

    try {
        await createReferral({
            referrer_id: affiliate.id,
            referred_id: referredUserId,
            order_id: orderId,
            commission,
        });
        return true;
    } catch (error) {
        console.error('Error tracking affiliate order:', error);
        return false;
    }
}
