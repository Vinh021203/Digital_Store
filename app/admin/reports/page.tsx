'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    DollarSign, TrendingUp, TrendingDown, Calendar, Download,
    CreditCard, PieChart, ArrowUpRight, Wallet, Loader,
    ArrowDownRight, Package, Users, ShoppingCart, Eye, ChevronRight,
    Percent, Target, Activity, BookOpen, Award, Sparkles, ExternalLink,
    AlertCircle, RefreshCcw
} from 'lucide-react';
import {
    getAdminStats, getRecentOrders, getRevenueByFormat, getMonthlyRevenue,
    type AdminStats, type RecentOrder, type RevenueByFormat
} from '@/lib/adminStats';

const RevenueReport = () => {
    const [timeRange, setTimeRange] = useState('thisMonth');
    const [chartView, setChartView] = useState<'bar' | 'line'>('bar');

    // State for real data
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [revenueByFormat, setRevenueByFormat] = useState<RevenueByFormat[]>([]);
    const [monthlyData, setMonthlyData] = useState<{ month: string; revenue: number; orders: number }[]>([]);
    const [topOrders, setTopOrders] = useState<RecentOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Load data
    const loadData = useCallback(async () => {
        try {
            const [statsData, formatData, monthlyRevenue, orders] = await Promise.all([
                getAdminStats(),
                getRevenueByFormat(),
                getMonthlyRevenue(),
                getRecentOrders(10), // Get more to sort by value
            ]);

            setStats(statsData);
            setRevenueByFormat(formatData);
            setMonthlyData(monthlyRevenue);

            // Sort by total for top transactions
            const sortedOrders = orders.sort((a, b) => b.total - a.total).slice(0, 5);
            setTopOrders(sortedOrders);
        } catch (error) {
            console.error('Error loading report data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    // Format currency
    const formatCurrency = (value: number, short = false) => {
        if (short) {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M₫`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}K₫`;
        }
        return `${value.toLocaleString('vi-VN')}₫`;
    };

    // Calculate derived values
    const totalCosts = stats ? stats.totalRevenue * 0.32 : 0; // Mock 32% costs
    const netProfit = stats ? stats.totalRevenue - totalCosts : 0;
    const profitMargin = stats && stats.totalRevenue > 0
        ? ((netProfit / stats.totalRevenue) * 100).toFixed(1)
        : '0';

    // Max for chart scaling
    const maxMonthlyRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);

    const formatColors = [
        { name: 'Template', color: 'bg-indigo-500', gradient: 'from-indigo-500 to-purple-500' },
        { name: 'Course', color: 'bg-emerald-500', gradient: 'from-emerald-500 to-teal-500' },
        { name: 'Plugin', color: 'bg-amber-500', gradient: 'from-amber-500 to-orange-500' },
        { name: 'Ebook', color: 'bg-rose-500', gradient: 'from-rose-500 to-pink-500' },
        { name: 'Software', color: 'bg-blue-500', gradient: 'from-blue-500 to-cyan-500' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader size={40} className="animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Đang tải báo cáo...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Không thể tải dữ liệu</h3>
                <button onClick={handleRefresh} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        Báo Cáo Doanh Thu
                        <button
                            onClick={handleRefresh}
                            className={`p-2 hover:bg-slate-100 rounded-lg transition-all ${refreshing ? 'animate-spin' : ''}`}
                        >
                            <RefreshCcw size={18} className="text-slate-400" />
                        </button>
                        {stats.revenueGrowth !== 0 && (
                            <span className={`px-3 py-1 text-sm font-bold rounded-lg border flex items-center gap-1.5 ${stats.revenueGrowth >= 0
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                {stats.revenueGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}%
                            </span>
                        )}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Theo dõi hiệu quả kinh doanh và dòng tiền thời gian thực</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 transition-colors cursor-pointer outline-none"
                    >
                        <option value="today">Hôm nay</option>
                        <option value="thisWeek">Tuần này</option>
                        <option value="thisMonth">Tháng này</option>
                        <option value="lastMonth">Tháng trước</option>
                        <option value="thisYear">Năm nay</option>
                    </select>
                    <button className="flex items-center bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl gap-2">
                        <Download size={16} /> Xuất Excel
                    </button>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group hover:scale-105 transition-transform cursor-pointer">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-white/80 font-bold text-xs uppercase tracking-wider">Tổng Doanh Thu</p>
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <DollarSign size={20} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold mb-3">{formatCurrency(stats.totalRevenue)}</h3>
                        <div className="flex items-center gap-2 text-sm bg-white/20 w-fit px-2.5 py-1 rounded-lg backdrop-blur-sm">
                            {stats.revenueGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}% vs tháng trước
                        </div>
                    </div>
                </div>

                {/* Net Profit */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Lợi Nhuận Ròng</p>
                            <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(netProfit)}</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Wallet size={24} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <Percent size={14} />
                            {profitMargin}% margin
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 text-xs">Chi phí: {formatCurrency(totalCosts)}</span>
                    </div>
                </div>

                {/* Average Order Value */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Giá Trị Đơn TB</p>
                            <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(stats.avgOrderValue)}</h3>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                            <ShoppingCart size={24} />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                        <Target size={12} /> {stats.completedOrders} đơn hoàn thành
                    </div>
                </div>

                {/* Wallet Balance */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group hover:scale-105 transition-transform cursor-pointer">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-slate-300 font-bold text-xs uppercase tracking-wider">Số Dư Khả Dụng</p>
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                <CreditCard size={20} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold mb-4">{formatCurrency(netProfit * 0.3)}</h3>
                        <Link href="/admin/settings/finance" className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors backdrop-blur-sm border border-white/20 flex items-center justify-center gap-2">
                            <Wallet size={16} /> Rút tiền
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Chart Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Revenue Trend Chart */}
                <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Biểu Đồ Tăng Trưởng 12 Tháng</h3>
                            <p className="text-sm text-slate-500 mt-1">Doanh thu theo tháng trong năm</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setChartView('bar')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${chartView === 'bar' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                Bar
                            </button>
                            <button
                                onClick={() => setChartView('line')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${chartView === 'line' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                Line
                            </button>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex gap-6 mb-6 text-sm font-medium">
                        <span className="flex items-center gap-2 text-indigo-600">
                            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></span>
                            Doanh thu
                        </span>
                        <span className="flex items-center gap-2 text-slate-400">
                            <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                            Số đơn
                        </span>
                    </div>

                    {/* Chart Container */}
                    <div className="h-72 w-full relative flex items-end justify-between gap-2">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                            {[100, 75, 50, 25, 0].map(val => (
                                <div key={val} className="w-full border-t border-slate-100 h-0 flex items-center">
                                    <span className="text-xs text-slate-300 -mt-2 w-12">
                                        {formatCurrency(maxMonthlyRevenue * val / 100, true)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Bars */}
                        {monthlyData.map((data, i) => {
                            const heightPercent = maxMonthlyRevenue > 0 ? (data.revenue / maxMonthlyRevenue) * 100 : 0;
                            return (
                                <div key={i} className="relative z-10 flex-1 flex flex-col justify-end h-full group cursor-pointer">
                                    {/* Tooltip */}
                                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl z-20">
                                        <div className="mb-1">Doanh thu: {formatCurrency(data.revenue)}</div>
                                        <div className="text-slate-300">Số đơn: {data.orders}</div>
                                    </div>

                                    {/* Revenue Bar */}
                                    <div className="flex gap-1 h-full items-end mb-8">
                                        <div
                                            className="bg-gradient-to-t from-indigo-600 to-purple-500 w-full rounded-t opacity-90 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-indigo-200"
                                            style={{ height: `${heightPercent}%`, minHeight: data.revenue > 0 ? '4px' : '0' }}
                                        ></div>
                                    </div>

                                    {/* Month Label */}
                                    <div className="text-xs text-slate-500 text-center font-semibold absolute bottom-0 left-0 right-0">{data.month}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sales by Category */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-8">
                    <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                        <PieChart className="text-indigo-600" size={22} />
                        Nguồn Doanh Thu
                    </h3>
                    {revenueByFormat.length > 0 ? (
                        <div className="space-y-5">
                            {revenueByFormat.map((cat, i) => {
                                const colorConfig = formatColors[i % formatColors.length];
                                return (
                                    <div key={cat.format} className="group">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-3 h-3 rounded-full ${colorConfig.color}`}></span>
                                                <span className="text-sm font-semibold text-slate-700">{cat.format}</span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">{formatCurrency(cat.revenue)}</span>
                                        </div>
                                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${colorConfig.gradient} rounded-full transition-all duration-500 group-hover:opacity-90`}
                                                style={{ width: `${cat.percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <p className="text-xs text-slate-400">{cat.percentage.toFixed(1)}% tổng doanh thu</p>
                                            <p className="text-xs text-slate-500">{cat.count} bán</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            <PieChart size={32} className="mx-auto mb-2" />
                            <p className="font-medium">Chưa có dữ liệu</p>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
                        <Link href="/admin/products" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group">
                            <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Package size={16} className="text-slate-400" />
                                Quản lý sản phẩm
                            </span>
                            <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600" />
                        </Link>
                        <Link href="/admin/marketing" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group">
                            <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Award size={16} className="text-slate-400" />
                                Chiến dịch Marketing
                            </span>
                            <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Tổng đơn hàng', value: stats.completedOrders, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Khách hàng', value: stats.totalCustomers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Sản phẩm', value: stats.activeProducts, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Tỉ lệ hoàn thành', value: stats.totalOrders > 0 ? `${((stats.completedOrders / stats.totalOrders) * 100).toFixed(0)}%` : '0%', icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer">
                        <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                            <stat.icon size={20} className={stat.color} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                            <p className="text-xs text-slate-500">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Top Transactions Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                            <Award className="text-amber-500" size={22} />
                            Top 5 Đơn Hàng Giá Trị Cao
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">Những giao dịch có doanh thu lớn nhất</p>
                    </div>
                    <Link href="/admin/orders" className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                        <Eye size={16} /> Xem tất cả
                    </Link>
                </div>

                {topOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4 text-left">Rank</th>
                                    <th className="px-6 py-4 text-left">Mã đơn</th>
                                    <th className="px-6 py-4 text-left">Khách hàng</th>
                                    <th className="px-6 py-4 text-left hidden md:table-cell">Ngày</th>
                                    <th className="px-6 py-4 text-left">Trạng thái</th>
                                    <th className="px-6 py-4 text-right">Giá trị</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {topOrders.map((order, idx) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                                                idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                                                    idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}>
                                                #{idx + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link href={`/admin/orders/${order.id}`} className="text-sm font-mono font-bold text-indigo-600 hover:underline">
                                                #{String(order.id).slice(-8).toUpperCase()}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {order.customer_name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-slate-900">{order.customer_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">
                                            {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${order.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                                                order.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                                                    'bg-slate-50 text-slate-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-bold text-emerald-600">{formatCurrency(order.total)}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center text-slate-400">
                        <ShoppingCart size={48} className="mx-auto mb-4" />
                        <p className="font-medium">Chưa có đơn hàng</p>
                    </div>
                )}

                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                    <Link href="/admin/orders" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-2">
                        Xem toàn bộ lịch sử giao dịch
                        <ChevronRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RevenueReport;
