'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ShoppingBag, Package, Calendar, ChevronRight, Home,
    Loader2, Search, CheckCircle, Clock, XCircle, RefreshCw,
    CreditCard, TrendingUp, Eye, Sparkles, Receipt, ArrowLeft
} from 'lucide-react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { fetchUserOrders, getOrderById, type DbOrder } from '@/lib/orders';

export default function OrdersPage() {
    const { user } = useSupabaseAuth();
    const [orders, setOrders] = useState<DbOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const loadOrders = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const data = await fetchUserOrders(user.id);
            setOrders(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
            case 'paid':
                return (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full">
                        <CheckCircle size={14} /> Hoàn thành
                    </span>
                );
            case 'pending':
                return (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full">
                        <Clock size={14} /> Chờ xác nhận tư vấn
                    </span>
                );
            case 'cancelled':
            case 'refunded':
                return (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100 px-3 py-1.5 rounded-full">
                        <XCircle size={14} /> {status === 'refunded' ? 'Xử lý yêu cầu' : 'Đã hủy'}
                    </span>
                );
            default:
                return (
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                        {status}
                    </span>
                );
        }
    };

    // Filter orders
    const filteredOrders = orders.filter(o => {
        const matchSearch = o.id.toString().includes(searchTerm) ||
            o.billing_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'all' || o.status === filterStatus;
        return matchSearch && matchStatus;
    });

    // Stats
    const stats = {
        total: orders.length,
        completed: orders.filter(o => o.status === 'completed' || o.status === 'paid').length,
        pending: orders.filter(o => o.status === 'pending').length,
        totalSpent: orders
            .filter(o => o.status === 'completed' || o.status === 'paid')
            .reduce((sum, o) => sum + Number(o.total), 0),
    };

    return (
        <div className="space-y-6">
            {/* Dark Premium Header */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
                </div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                        <Link href="/" className="hover:text-white transition-colors"><Home size={14} /></Link>
                        <ChevronRight size={14} />
                        <Link href="/profile" className="hover:text-white transition-colors">Profile</Link>
                        <ChevronRight size={14} />
                        <span className="text-white font-medium">Yêu cầu</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <ShoppingBag size={28} className="text-white" />
                            </div>
                            <div>
                                <span className="bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full text-xs font-bold mb-2 inline-block">
                                    <Sparkles size={10} className="inline mr-1" /> Order History
                                </span>
                                <h1 className="text-2xl md:text-3xl font-black">Yêu cầu</h1>
                                <p className="text-slate-400 text-sm">Lịch sử gửi yêu cầu của bạn</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link href="/profile" className="flex items-center gap-2 bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-white/20 transition-all">
                                <ArrowLeft size={16} />
                                Quay lại
                            </Link>
                            <button
                                onClick={loadOrders}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                            >
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                Làm mới
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                            <Receipt size={22} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                            <p className="text-xs text-slate-500 font-medium">Tổng đơn</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
                            <CheckCircle size={22} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-emerald-600">{stats.completed}</p>
                            <p className="text-xs text-slate-500 font-medium">Hoàn thành</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                            <Clock size={22} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-amber-600">{stats.pending}</p>
                            <p className="text-xs text-slate-500 font-medium">Đang chờ</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                            <TrendingUp size={22} className="text-orange-600" />
                        </div>
                        <div>
                            <p className="text-lg font-black text-orange-600">
                                {(stats.totalSpent / 1000000).toFixed(1)}M
                            </p>
	                            <p className="text-xs text-slate-500 font-medium">Giá trị tham khảo</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo mã yêu cầu..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-600 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ xác nhận tư vấn</option>
                    <option value="paid">Đã xác nhận tư vấn</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                </select>
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-medium">Đang tải...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có yêu cầu nào</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        Bắt đầu tham khảo demo để xem lịch sử yêu cầu của bạn tại đây
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                    >
                        <Sparkles size={18} />
                        Khám phá mẫu demo
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map(order => (
                        <Link
                            key={order.id}
                            href={`/tracking?orderId=${order.id}`}
                            className="block bg-white rounded-2xl border border-slate-100 p-4 md:p-6 hover:border-blue-200 hover:shadow-xl transition-all group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    {/* Order Icon */}
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                        <Receipt size={24} className="text-blue-600" />
                                    </div>

                                    {/* Order Info */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                                                Đơn #{order.id}
                                            </span>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-blue-400" />
                                                {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <CreditCard size={14} className="text-purple-400" />
                                                {order.payment_method || 'Momo'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Price & Action */}
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xl font-black text-orange-600">
                                            {Number(order.total).toLocaleString('vi-VN')}₫
                                        </p>
                                        {order.discount > 0 && (
                                            <p className="text-xs text-emerald-600 font-medium">
                                                Giảm {Number(order.discount).toLocaleString('vi-VN')}₫
                                            </p>
                                        )}
                                    </div>
                                    <ChevronRight size={24} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
