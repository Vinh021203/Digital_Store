'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    DollarSign, Download, TrendingUp,
    ArrowUpRight, CreditCard, Package, Loader2,
    BarChart3, Wallet, Check, Clock, XCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/context/ToastContext';

interface Transaction {
    id: number;
    type: 'sale' | 'withdrawal' | 'refund';
    product_name?: string;
    seller_name?: string;
    buyer_name?: string;
    amount: number;
    fee: number;
    net_amount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    date: string;
}

interface Stats {
    totalRevenue: number;
    totalFees: number;
    pendingPayouts: number;
    transactionCount: number;
}

export default function TransactionsPage() {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [dateRange, setDateRange] = useState('30days');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalRevenue: 0,
        totalFees: 0,
        pendingPayouts: 0,
        transactionCount: 0
    });

    const loadTransactions = useCallback(async () => {
        setLoading(true);
        const supabase = createClient();
        if (!supabase) {
            setLoading(false);
            return;
        }

        try {
            // Calculate date range
            const now = new Date();
            let startDate = new Date();
            if (dateRange === '7days') startDate.setDate(now.getDate() - 7);
            else if (dateRange === '30days') startDate.setDate(now.getDate() - 30);
            else if (dateRange === '90days') startDate.setDate(now.getDate() - 90);

            const allTransactions: Transaction[] = [];

            // Fetch completed orders (sales)
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select(`
                    id,
                    total,
                    discount,
                    status,
                    created_at,
                    user:profiles(name, email),
                    order_items(
                        product_name,
                        price,
                        product:products(
                            seller:sellers(store_name)
                        )
                    )
                `)
                .gte('created_at', startDate.toISOString())
                .in('status', ['paid', 'completed'])
                .order('created_at', { ascending: false });

            if (!ordersError && orders) {
                orders.forEach((order: any) => {
                    const productName = order.order_items?.[0]?.product_name || 'Sản phẩm';
                    const sellerName = order.order_items?.[0]?.product?.seller?.store_name || 'Seller';
                    const buyerName = order.user?.name || order.user?.email || 'Khách hàng';
                    const fee = Math.round(order.total * 0.05); // 5% platform fee

                    allTransactions.push({
                        id: order.id,
                        type: 'sale',
                        product_name: productName,
                        seller_name: sellerName,
                        buyer_name: buyerName,
                        amount: order.total,
                        fee: fee,
                        net_amount: order.total - fee,
                        status: order.status === 'completed' ? 'completed' : 'pending',
                        date: order.created_at
                    });
                });
            }

            // Fetch seller payouts (withdrawals)
            const { data: payouts, error: payoutsError } = await supabase
                .from('seller_payouts')
                .select(`
                    id,
                    amount,
                    fee,
                    net_amount,
                    status,
                    created_at,
                    seller:sellers(store_name)
                `)
                .gte('created_at', startDate.toISOString())
                .order('created_at', { ascending: false });

            if (!payoutsError && payouts) {
                payouts.forEach((payout: any) => {
                    allTransactions.push({
                        id: payout.id + 100000, // Offset to avoid ID collision
                        type: 'withdrawal',
                        seller_name: payout.seller?.store_name || 'Seller',
                        amount: payout.amount,
                        fee: payout.fee || 0,
                        net_amount: payout.net_amount,
                        status: payout.status === 'completed' ? 'completed' :
                            payout.status === 'failed' ? 'failed' : 'pending',
                        date: payout.created_at
                    });
                });
            }

            // Sort by date
            allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setTransactions(allTransactions);

            // Calculate stats
            const sales = allTransactions.filter(t => t.type === 'sale');
            const pendingPayoutsAmount = allTransactions
                .filter(t => t.type === 'withdrawal' && t.status === 'pending')
                .reduce((sum, t) => sum + t.amount, 0);

            setStats({
                totalRevenue: sales.reduce((sum, t) => sum + t.amount, 0),
                totalFees: sales.reduce((sum, t) => sum + t.fee, 0),
                pendingPayouts: pendingPayoutsAmount,
                transactionCount: sales.length
            });

        } catch (error) {
            console.error('Error loading transactions:', error);
            addToast('Lỗi tải danh sách giao dịch', 'error');
        } finally {
            setLoading(false);
        }
    }, [dateRange, addToast]);

    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    const getTypeBadge = (type: string) => {
        const styles = {
            sale: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            withdrawal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            refund: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        };
        const labels = { sale: 'Bán hàng', withdrawal: 'Rút tiền', refund: 'Hoàn tiền' };
        return <span className={`px-2 py-1 rounded-lg text-xs font-bold ${styles[type as keyof typeof styles]}`}>{labels[type as keyof typeof labels]}</span>;
    };

    const getStatusBadge = (status: string) => {
        const config = {
            completed: { style: 'bg-green-100 text-green-700', icon: Check, label: 'Hoàn thành' },
            pending: { style: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Đang xử lý' },
            failed: { style: 'bg-red-100 text-red-700', icon: XCircle, label: 'Thất bại' },
            refunded: { style: 'bg-orange-100 text-orange-700', icon: XCircle, label: 'Hoàn trả' },
        };
        const c = config[status as keyof typeof config] || config.pending;
        return (
            <span className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${c.style}`}>
                <c.icon size={12} /> {c.label}
            </span>
        );
    };

    const filteredTransactions = filterType === 'all'
        ? transactions
        : transactions.filter(t => t.type === filterType);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">Giao Dịch & Phí</h1>
                    <p className="text-slate-500 dark:text-slate-400">Theo dõi tất cả giao dịch trên marketplace</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm cursor-pointer"
                    >
                        <option value="7days">7 ngày qua</option>
                        <option value="30days">30 ngày qua</option>
                        <option value="90days">90 ngày qua</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
                    <div className="flex items-center gap-2 text-green-100 mb-2">
                        <DollarSign size={18} /> Tổng Doanh Thu
                    </div>
                    <p className="text-3xl font-black">{(stats.totalRevenue / 1000000).toFixed(1)}M₫</p>
                    <p className="text-green-200 text-sm flex items-center gap-1 mt-1">
                        <ArrowUpRight size={14} /> Từ {stats.transactionCount} đơn hàng
                    </p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 text-white">
                    <div className="flex items-center gap-2 text-orange-100 mb-2">
                        <Wallet size={18} /> Phí Thu Được (5%)
                    </div>
                    <p className="text-3xl font-black">{(stats.totalFees / 1000).toFixed(0)}K₫</p>
                    <p className="text-orange-200 text-sm mt-1">Platform commission</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-5 text-white">
                    <div className="flex items-center gap-2 text-blue-100 mb-2">
                        <CreditCard size={18} /> Chờ Rút Tiền
                    </div>
                    <p className="text-3xl font-black">{(stats.pendingPayouts / 1000000).toFixed(1)}M₫</p>
                    <p className="text-blue-200 text-sm mt-1">
                        {transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length} yêu cầu
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                        <BarChart3 size={18} /> Tỷ Lệ Phí TB
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">5.0%</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Platform fee rate</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                {['all', 'sale', 'withdrawal', 'refund'].map(type => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filterType === type
                            ? 'bg-orange-600 text-white'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-300'
                            }`}
                    >
                        {type === 'all' ? 'Tất cả' : type === 'sale' ? 'Bán hàng' : type === 'withdrawal' ? 'Rút tiền' : 'Hoàn tiền'}
                    </button>
                ))}
            </div>

            {/* Transactions Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-16">
                        <Package size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">Chưa có giao dịch nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4 text-left">ID</th>
                                    <th className="px-6 py-4 text-left">Loại</th>
                                    <th className="px-6 py-4 text-left">Chi tiết</th>
                                    <th className="px-6 py-4 text-right">Số tiền</th>
                                    <th className="px-6 py-4 text-right">Phí</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Thời gian</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filteredTransactions.map(txn => (
                                    <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
                                                #{txn.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{getTypeBadge(txn.type)}</td>
                                        <td className="px-6 py-4">
                                            <div>
                                                {txn.product_name && (
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{txn.product_name}</p>
                                                )}
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {txn.type === 'withdrawal'
                                                        ? `Seller: ${txn.seller_name}`
                                                        : txn.seller_name && txn.buyer_name
                                                            ? `${txn.seller_name} → ${txn.buyer_name}`
                                                            : txn.seller_name || ''
                                                    }
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-bold ${txn.type === 'refund' ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                                                {txn.type === 'refund' ? '-' : ''}{txn.amount.toLocaleString('vi-VN')}₫
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-bold ${txn.fee > 0 ? 'text-orange-600' : txn.fee < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                                {txn.fee !== 0 ? `+${txn.fee.toLocaleString('vi-VN')}₫` : '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">{getStatusBadge(txn.status)}</td>
                                        <td className="px-6 py-4 text-right text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(txn.date).toLocaleDateString('vi-VN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
