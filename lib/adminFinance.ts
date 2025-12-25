// lib/adminFinance.ts
// Functions to manage admin finance and withdrawals

import { createClient } from './supabase/client';

export type TransactionType = 'income' | 'expense' | 'withdraw';
export type TransactionStatus = 'completed' | 'pending' | 'processing' | 'cancelled';

export interface Transaction {
    id: string;
    type: TransactionType;
    description: string;
    amount: number;
    status: TransactionStatus;
    method: string;
    created_at: string;
    order_id?: string;
}

export interface FinanceStats {
    availableBalance: number;
    pendingBalance: number;
    totalIncome: number;
    totalExpense: number;
    totalWithdrawals: number;
    monthIncome: number;
    monthExpense: number;
}

export interface LinkedAccount {
    id: string;
    type: 'bank' | 'wallet';
    name: string;
    account_number: string;
    is_default: boolean;
}

/**
 * Get finance overview statistics
 */
export async function getFinanceStats(): Promise<FinanceStats> {
    const supabase = createClient();
    if (!supabase) return getDefaultStats();

    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        // Fetch completed orders for income
        const { data: orders } = await supabase
            .from('orders')
            .select('total, status, created_at')
            .eq('status', 'completed');

        // Calculate totals
        const allOrders = orders || [];
        const totalIncome = allOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

        // This month's income
        const monthOrders = allOrders.filter(o => new Date(o.created_at) >= new Date(startOfMonth));
        const monthIncome = monthOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

        // Mock expense and withdrawal (would need separate tables in real implementation)
        const totalExpense = Math.floor(totalIncome * 0.15); // 15% platform fees mock
        const monthExpense = Math.floor(monthIncome * 0.15);
        const totalWithdrawals = Math.floor(totalIncome * 0.3); // 30% withdrawn mock

        // Available balance = income - expenses - withdrawals
        const availableBalance = totalIncome - totalExpense - totalWithdrawals;
        const pendingBalance = Math.floor(monthIncome * 0.2); // 20% pending

        return {
            availableBalance: Math.max(0, availableBalance),
            pendingBalance,
            totalIncome,
            totalExpense,
            totalWithdrawals,
            monthIncome,
            monthExpense,
        };
    } catch (error) {
        console.error('Error fetching finance stats:', error);
        return getDefaultStats();
    }
}

/**
 * Get transaction history from orders
 */
export async function getTransactions(limit: number = 20): Promise<Transaction[]> {
    const supabase = createClient();
    if (!supabase) return [];

    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                id,
                total,
                status,
                payment_method,
                created_at
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }

        return (orders || []).map((order: any) => ({
            id: `TRX-${String(order.id).slice(-6).toUpperCase()}`,
            type: 'income' as TransactionType,
            description: `Thanh toán đơn hàng #${String(order.id).slice(-8).toUpperCase()}`,
            amount: Number(order.total) || 0,
            status: mapOrderStatus(order.status),
            method: order.payment_method || 'Online',
            created_at: order.created_at,
            order_id: order.id,
        }));
    } catch (error) {
        console.error('Error in getTransactions:', error);
        return [];
    }
}

function mapOrderStatus(status: string): TransactionStatus {
    switch (status) {
        case 'completed': return 'completed';
        case 'pending': return 'pending';
        case 'processing': return 'processing';
        case 'cancelled': return 'cancelled';
        default: return 'pending';
    }
}

/**
 * Get linked bank accounts (mock - would need separate table)
 */
export async function getLinkedAccounts(): Promise<LinkedAccount[]> {
    // In real implementation, this would fetch from a bank_accounts table
    return [
        {
            id: '1',
            type: 'bank',
            name: 'Vietcombank',
            account_number: '**** 9988',
            is_default: true,
        },
        {
            id: '2',
            type: 'wallet',
            name: 'Ví MoMo',
            account_number: '0909 *** 888',
            is_default: false,
        },
    ];
}

/**
 * Request withdrawal (mock - would need separate table)
 */
export async function requestWithdrawal(
    amount: number,
    accountId: string,
    note?: string
): Promise<{ success: boolean; message: string }> {
    // Validate amount
    if (amount < 50000) {
        return { success: false, message: 'Số tiền rút tối thiểu là 50.000₫' };
    }

    // In real implementation, this would:
    // 1. Check available balance
    // 2. Create withdrawal request in database
    // 3. Notify admin
    // 4. Process via payment gateway

    // Mock success
    return {
        success: true,
        message: 'Yêu cầu rút tiền đã được gửi. Thời gian xử lý: 5-15 phút.'
    };
}

function getDefaultStats(): FinanceStats {
    return {
        availableBalance: 0,
        pendingBalance: 0,
        totalIncome: 0,
        totalExpense: 0,
        totalWithdrawals: 0,
        monthIncome: 0,
        monthExpense: 0,
    };
}
