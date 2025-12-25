'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Users, ShoppingBag, DollarSign, TrendingUp, ArrowUpRight,
    ArrowDownRight, Clock, Activity, Star, MoreHorizontal, Calendar,
    Package, AlertCircle, CheckCircle, XCircle, Loader, Eye,
    TrendingDown, Zap, Target, Award, MessageSquare, BarChart3,
    RefreshCcw, Download, Filter, Search, ChevronRight, Sparkles,
    ShoppingCart, BookOpen, CreditCard, MapPin, Phone, Mail, ExternalLink,
    Hand
} from 'lucide-react';
import {
    getAdminStats, getRecentOrders, getTopProducts, getRevenueByFormat,
    type AdminStats, type RecentOrder, type TopProduct, type RevenueByFormat
} from '@/lib/adminStats';
import Image from 'next/image';

const DashboardOverview = () => {
    // State for real data
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [revenueByFormat, setRevenueByFormat] = useState<RevenueByFormat[]>([]);
    const [loading, setLoading] = useState(true);

    // Live Stats Animation
    const [liveVisitors, setLiveVisitors] = useState(1248);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);

    // Load data function
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [statsData, ordersData, productsData, formatData] = await Promise.all([
                getAdminStats(),
                getRecentOrders(6),
                getTopProducts(5),
                getRevenueByFormat(),
            ]);

            setStats(statsData);
            setRecentOrders(ordersData);
            setTopProducts(productsData);
            setRevenueByFormat(formatData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const visitorTimer = setInterval(() => {
            setLiveVisitors(prev => prev + Math.floor(Math.random() * 5) - 2);
        }, 5000);

        const timeTimer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => {
            clearInterval(visitorTimer);
            clearInterval(timeTimer);
        };
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    // Status Badge Component
    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            pending: 'bg-amber-50 text-amber-700 border-amber-200',
            processing: 'bg-orange-50 text-orange-700 border-orange-200',
            cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
            refunded: 'bg-slate-50 text-slate-700 border-slate-200',
        };

        const icons: Record<string, React.ReactNode> = {
            completed: <CheckCircle size={12} />,
            pending: <Clock size={12} />,
            processing: <Loader size={12} className="animate-spin" />,
            cancelled: <XCircle size={12} />,
            refunded: <RefreshCcw size={12} />,
        };

        const statusKey = status.toLowerCase();
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${styles[statusKey] || styles.pending}`}>
                {icons[statusKey] || icons.pending}
                {status}
            </span>
        );
    };

    // Format currency
    const formatCurrency = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M₫`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}K₫`;
        }
        return `${value.toLocaleString('vi-VN')}₫`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader size={40} className="animate-spin text-orange-600 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Không thể tải dữ liệu</h3>
                <p className="text-slate-500 mb-4">Vui lòng thử lại sau</p>
                <button onClick={handleRefresh} className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold">
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                        Dashboard Overview
                        <button
                            onClick={handleRefresh}
                            className={`p-2 hover:bg-slate-100 rounded-lg transition-all ${refreshing ? 'animate-spin' : ''}`}
                            title="Refresh data"
                        >
                            <RefreshCcw size={20} className="text-slate-400" />
                        </button>
                    </h1>
                    <p className="text-slate-600 flex flex-wrap items-center gap-2 text-sm">
                        <Calendar size={16} />
                        {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        <span className="hidden sm:inline mx-2">•</span>
                        <Clock size={16} className="hidden sm:inline" />
                        <span className="hidden sm:inline">{currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all hover:shadow-md">
                        <Download size={16} />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                    <Link href="/admin/reports" className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl font-semibold text-sm hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 hover:shadow-xl">
                        <BarChart3 size={16} />
                        Báo cáo
                    </Link>
                </div>
            </div>

            {/* Welcome Banner + Live Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Welcome Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-orange-600 via-red-600 to-amber-600 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                Live Dashboard
                            </span>
                            {stats.revenueGrowth > 0 && (
                                <span className="bg-emerald-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/30">
                                    <TrendingUp size={12} className="inline mr-1" /> +{stats.revenueGrowth.toFixed(1)}% This Month
                                </span>
                            )}
                        </div>

                        <h2 className="text-2xl lg:text-4xl font-bold mb-4 flex items-center gap-3">
                            Chào mừng trở lại!
                            <Hand size={32} className="text-amber-300" />
                        </h2>
                        <p className="text-white/90 text-base lg:text-lg mb-6 max-w-xl leading-relaxed">
                            Doanh thu hôm nay đã đạt <span className="font-bold text-white">{stats.todayRevenue.toLocaleString('vi-VN')}₫</span>.
                            Có <span className="font-bold">{stats.pendingOrders} đơn hàng</span> mới cần xử lý và <span className="font-bold">{stats.processingOrders} đơn</span> đang xử lý.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <Link href="/admin/orders" className="bg-white text-orange-700 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all shadow-lg flex items-center gap-2 hover:scale-105">
                                <ShoppingBag size={18} /> Xem Đơn Hàng
                            </Link>
                            <Link href="/admin/reports" className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20 flex items-center gap-2">
                                <BarChart3 size={18} /> Báo Cáo
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Live Traffic Card */}
                <div className="bg-slate-900 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Activity size={14} />
                                Đang truy cập
                            </p>
                            <h3 className="text-4xl lg:text-5xl font-mono font-bold text-white">
                                {liveVisitors.toLocaleString()}
                            </h3>
                        </div>
                        <div className="relative">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute"></div>
                            <div className="w-3 h-3 bg-emerald-500 rounded-full relative shadow-lg shadow-emerald-500/50"></div>
                        </div>
                    </div>

                    {/* Sparkline Chart */}
                    <div className="h-16 flex items-end gap-1 mb-4">
                        {[40, 60, 45, 70, 50, 80, 65, 85, 55, 90, 70, 95, 80, 100].map((h, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-gradient-to-t from-orange-600 to-red-500 rounded-t transition-all duration-500 hover:from-orange-500 hover:to-red-400 cursor-pointer"
                                style={{ height: `${h}%` }}
                            />
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400 flex items-center gap-2">
                            <TrendingUp size={14} className="text-emerald-400" />
                            <span className="text-emerald-400 font-bold">+12.5%</span> vs yesterday
                        </p>
                        <button className="text-slate-400 hover:text-white transition-colors">
                            <Eye size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Key Metrics - 4 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[
                    {
                        label: 'Tổng Doanh Thu',
                        val: formatCurrency(stats.totalRevenue),
                        change: `+${stats.revenueGrowth.toFixed(1)}%`,
                        isUp: stats.revenueGrowth >= 0,
                        icon: DollarSign,
                        bgGradient: 'from-emerald-500 to-teal-500',
                        href: '/admin/reports'
                    },
                    {
                        label: 'Đơn Hàng',
                        val: stats.totalOrders,
                        change: `+${stats.pendingOrders}`,
                        isUp: true,
                        icon: ShoppingBag,
                        bgGradient: 'from-blue-500 to-cyan-500',
                        href: '/admin/orders'
                    },
                    {
                        label: 'Khách Hàng',
                        val: stats.totalCustomers,
                        change: `+${stats.newCustomersThisWeek}`,
                        isUp: true,
                        icon: Users,
                        bgGradient: 'from-red-500 to-amber-500',
                        href: '/admin/customers'
                    },
                    {
                        label: 'Giá Trị TB / Đơn',
                        val: formatCurrency(stats.avgOrderValue),
                        change: '+3.2%',
                        isUp: true,
                        icon: Target,
                        bgGradient: 'from-orange-500 to-red-500',
                        href: '/admin/reports'
                    },
                ].map((stat, idx) => (
                    <Link
                        key={idx}
                        href={stat.href}
                        className="group bg-white p-5 lg:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgGradient} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                <stat.icon size={24} strokeWidth={2.5} />
                            </div>
                            <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${stat.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.val}</h3>
                        <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                    </Link>
                ))}
            </div>

            {/* Main Content: 2 Columns */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left: Top Products */}
                <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 lg:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                <Award className="text-amber-500" size={22} />
                                Sản Phẩm Bán Chạy
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Top 5 sản phẩm có doanh số cao nhất</p>
                        </div>
                        <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-orange-600 font-semibold transition-colors">
                            <Filter size={16} /> Lọc
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        {topProducts.length > 0 ? (
                            <table className="w-full">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold">
                                    <tr>
                                        <th className="px-4 lg:px-6 py-4 text-left">#</th>
                                        <th className="px-4 lg:px-6 py-4 text-left">Sản phẩm</th>
                                        <th className="px-4 lg:px-6 py-4 text-left hidden sm:table-cell">Loại</th>
                                        <th className="px-4 lg:px-6 py-4 text-left">Doanh số</th>
                                        <th className="px-4 lg:px-6 py-4 text-right">Doanh thu</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {topProducts.map((p, i) => (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-4 lg:px-6 py-4">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold text-sm shadow-md">
                                                    {i + 1}
                                                </div>
                                            </td>
                                            <td className="px-4 lg:px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        {p.image ? (
                                                            <Image
                                                                src={p.image}
                                                                width={48}
                                                                height={48}
                                                                className="w-12 h-12 rounded-xl object-cover border-2 border-slate-100 group-hover:border-orange-200 transition-all"
                                                                alt={p.name}
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                                                                <Package size={20} className="text-slate-400" />
                                                            </div>
                                                        )}
                                                        {i === 0 && (
                                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                                                                <Star size={12} className="text-white fill-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm text-slate-900 truncate max-w-[200px] group-hover:text-orange-600 transition-colors">
                                                            {p.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">{formatCurrency(p.price)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 lg:px-6 py-4 hidden sm:table-cell">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold">
                                                    <Package size={12} />
                                                    {p.format}
                                                </span>
                                            </td>
                                            <td className="px-4 lg:px-6 py-4">
                                                <div>
                                                    <span className="text-sm font-bold text-slate-700">{p.sales_count}</span>
                                                    <span className="text-xs text-slate-400 ml-1">bán</span>
                                                </div>
                                            </td>
                                            <td className="px-4 lg:px-6 py-4 text-right">
                                                <span className="font-bold text-orange-700">{formatCurrency(p.revenue)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-12 text-center text-slate-400">
                                <Package size={48} className="mx-auto mb-4" />
                                <p className="font-medium">Chưa có dữ liệu sản phẩm</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                        <Link href="/admin/products" className="w-full py-2.5 text-sm font-bold text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all flex items-center justify-center gap-2">
                            Xem tất cả sản phẩm
                            <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>

                {/* Right: Recent Orders */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="p-5 lg:p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                            <Clock size={20} className="text-slate-400" />
                            Đơn Hàng Gần Đây
                        </h3>
                        <button className="text-slate-400 hover:text-orange-600 transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>

                    <div className="p-4 space-y-3 flex-1 overflow-auto max-h-[600px]">
                        {recentOrders.length > 0 ? (
                            recentOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/admin/orders/${order.id}`}
                                    className="group block p-4 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-slate-900 group-hover:text-orange-700 transition-colors truncate">
                                                #{String(order.id).slice(-8).toUpperCase()}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                                <Users size={12} />
                                                {order.customer_name}
                                            </p>
                                        </div>
                                        <StatusBadge status={order.status} />
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Calendar size={12} />
                                            {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                        </div>
                                        <p className="font-bold text-orange-700">
                                            {order.total.toLocaleString('vi-VN')}₫
                                        </p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <ShoppingBag size={32} className="mx-auto mb-2" />
                                <p className="font-medium">Chưa có đơn hàng</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-100">
                        <Link href="/admin/orders" className="w-full py-3 text-sm font-bold text-orange-600 hover:text-white hover:bg-orange-600 rounded-xl transition-all border-2 border-orange-200 hover:border-orange-600 flex items-center justify-center gap-2">
                            Xem tất cả đơn hàng
                            <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Stats Bar + Format Sales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Đơn hoàn thành', value: stats.completedOrders, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', suffix: null },
                        { label: 'Đang xử lý', value: stats.processingOrders, icon: Loader, color: 'text-orange-600', bg: 'bg-orange-50', suffix: null },
                        { label: 'Sản phẩm', value: stats.activeProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', suffix: null },
                        { label: 'Đánh giá TB', value: stats.avgRating, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50', suffix: <Star size={14} className="text-amber-500 fill-amber-500 inline ml-1" /> },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer">
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <stat.icon size={20} className={stat.color} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 flex items-center">
                                    {stat.value}
                                    {stat.suffix}
                                </p>
                                <p className="text-xs text-slate-500">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sales by Format */}
                <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                        <BarChart3 size={20} className="text-orange-600" />
                        Doanh Số Theo Loại
                    </h3>
                    {revenueByFormat.length > 0 ? (
                        <div className="space-y-3">
                            {revenueByFormat.map((item) => {
                                const maxRevenue = Math.max(...revenueByFormat.map(r => r.revenue));
                                const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                                return (
                                    <div key={item.format} className="group">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-semibold text-slate-700">{item.format}</span>
                                            <span className="text-sm font-bold text-orange-600">{item.count} bán</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500 group-hover:from-orange-600 group-hover:to-red-600"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            <BarChart3 size={32} className="mx-auto mb-2" />
                            <p className="font-medium">Chưa có dữ liệu</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
