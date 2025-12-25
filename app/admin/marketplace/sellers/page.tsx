'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Users, Search, Star, Package, DollarSign,
    Check, X, Eye, Mail, Ban, Clock, ExternalLink, Shield,
    Loader2, RefreshCw, CheckCircle, MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/context/ToastContext';
import {
    fetchSellers,
    updateSellerStatus,
    verifySeller,
    getSellerStats,
    DbSeller,
} from '@/lib/sellers';

export default function SellersPage() {
    const { addToast } = useToast();
    const [sellers, setSellers] = useState<DbSeller[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const loadSellers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchSellers();
            setSellers(data);
        } catch (error) {
            console.error('Error loading sellers:', error);
            addToast('Lỗi tải danh sách sellers', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        loadSellers();
    }, [loadSellers]);

    // Filter sellers
    const filteredSellers = useMemo(() => {
        return sellers.filter(seller => {
            if (filterStatus !== 'all' && seller.status !== filterStatus) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const name = seller.store_name.toLowerCase();
                const email = seller.user?.email?.toLowerCase() || '';
                if (!name.includes(q) && !email.includes(q)) return false;
            }
            return true;
        });
    }, [sellers, filterStatus, searchQuery]);

    // Stats
    const stats = useMemo(() => ({
        total: sellers.length,
        active: sellers.filter(s => s.status === 'active').length,
        pending: sellers.filter(s => s.status === 'pending').length,
        suspended: sellers.filter(s => s.status === 'suspended').length,
        verified: sellers.filter(s => s.is_verified).length,
        totalRevenue: sellers.reduce((sum, s) => sum + Number(s.total_earnings || 0), 0),
    }), [sellers]);

    // Handle status change
    const handleStatusChange = async (id: number, status: DbSeller['status']) => {
        setActionLoading(id);
        try {
            await updateSellerStatus(id, status);
            addToast(`Đã cập nhật trạng thái thành ${status}`, 'success');
            loadSellers();
        } catch (error: any) {
            addToast(error.message || 'Có lỗi xảy ra', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    // Handle verify
    const handleVerify = async (id: number, verified: boolean) => {
        setActionLoading(id);
        try {
            await verifySeller(id, verified);
            addToast(verified ? 'Đã xác minh seller' : 'Đã bỏ xác minh', 'success');
            loadSellers();
        } catch (error: any) {
            addToast(error.message || 'Có lỗi xảy ra', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-green-100 text-green-700',
            pending: 'bg-amber-100 text-amber-700',
            suspended: 'bg-red-100 text-red-700',
        };
        return <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${styles[status] || ''}`}>{status}</span>;
    };

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
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900">Quản Lý Sellers</h1>
                    <p className="text-slate-500">Quản lý tất cả sellers trên marketplace</p>
                </div>
                <button
                    onClick={loadSellers}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
                >
                    <RefreshCw size={16} /> Làm mới
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: 'Tổng Sellers', value: stats.total, icon: Users, color: 'bg-blue-500' },
                    { label: 'Active', value: stats.active, icon: Check, color: 'bg-green-500' },
                    { label: 'Chờ Duyệt', value: stats.pending, icon: Clock, color: 'bg-amber-500' },
                    { label: 'Suspended', value: stats.suspended, icon: Ban, color: 'bg-red-500' },
                    { label: 'Tổng Doanh Thu', value: `${(stats.totalRevenue / 1000000).toFixed(1)}M₫`, icon: DollarSign, color: 'bg-emerald-500' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${stat.color} text-white`}>
                                <stat.icon size={18} />
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-900">{stat.value}</p>
                                <p className="text-xs text-slate-500">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên shop hoặc email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm cursor-pointer"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4 text-left">Seller</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-center">Products</th>
                                <th className="px-6 py-4 text-center">Sales</th>
                                <th className="px-6 py-4 text-right">Revenue</th>
                                <th className="px-6 py-4 text-center">Rating</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSellers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        Không tìm thấy seller nào
                                    </td>
                                </tr>
                            ) : (
                                filteredSellers.map(seller => (
                                    <tr key={seller.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    {seller.logo ? (
                                                        <Image src={seller.logo} alt="" width={40} height={40} className="rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                                                            {seller.store_name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    {seller.is_verified && (
                                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                            <Check size={10} className="text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{seller.store_name}</p>
                                                    <p className="text-xs text-slate-500">{seller.user?.email || '—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(seller.status)}</td>
                                        <td className="px-6 py-4 text-center font-bold text-slate-700">{seller.total_products}</td>
                                        <td className="px-6 py-4 text-center font-bold text-slate-700">{seller.total_sales}</td>
                                        <td className="px-6 py-4 text-right font-bold text-green-600">
                                            {(Number(seller.total_earnings) / 1000000).toFixed(1)}M₫
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {seller.rating > 0 ? (
                                                <span className="flex items-center justify-center gap-1">
                                                    <Star size={14} className="text-amber-400 fill-amber-400" />
                                                    <span className="font-bold text-slate-700">{seller.rating}</span>
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                {actionLoading === seller.id ? (
                                                    <Loader2 size={16} className="animate-spin text-slate-400" />
                                                ) : (
                                                    <>
                                                        {/* View shop */}
                                                        <Link
                                                            href={`/seller/${seller.store_slug}`}
                                                            target="_blank"
                                                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                                            title="Xem cửa hàng"
                                                        >
                                                            <ExternalLink size={16} className="text-slate-400" />
                                                        </Link>

                                                        {/* Verify/Unverify */}
                                                        <button
                                                            onClick={() => handleVerify(seller.id, !seller.is_verified)}
                                                            className={`p-2 rounded-lg transition-colors ${seller.is_verified ? 'hover:bg-amber-50 text-blue-500' : 'hover:bg-blue-50 text-slate-400'}`}
                                                            title={seller.is_verified ? 'Bỏ xác minh' : 'Xác minh'}
                                                        >
                                                            <Shield size={16} />
                                                        </button>

                                                        {/* Status actions */}
                                                        {seller.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleStatusChange(seller.id, 'active')}
                                                                    className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600"
                                                                    title="Duyệt"
                                                                >
                                                                    <CheckCircle size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(seller.id, 'suspended')}
                                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                                                                    title="Từ chối"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </>
                                                        )}

                                                        {seller.status === 'active' && (
                                                            <button
                                                                onClick={() => handleStatusChange(seller.id, 'suspended')}
                                                                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                                                                title="Tạm khóa"
                                                            >
                                                                <Ban size={16} />
                                                            </button>
                                                        )}

                                                        {seller.status === 'suspended' && (
                                                            <button
                                                                onClick={() => handleStatusChange(seller.id, 'active')}
                                                                className="p-2 hover:bg-green-50 rounded-lg transition-colors text-slate-400 hover:text-green-600"
                                                                title="Kích hoạt lại"
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
