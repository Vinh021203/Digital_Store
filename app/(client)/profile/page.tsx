'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    User, Package, ShoppingBag, Download, Key, Star,
    Settings, ChevronRight, Loader2,
    TrendingUp, Clock, CheckCircle, Heart, MessageSquare,
    Zap, Target, Trophy, BookOpen, CreditCard, LifeBuoy, FileText,
    Sparkles, Crown, Gift, Hand
} from 'lucide-react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { getProfileStats, type ProfileStats } from '@/lib/profileStats';

interface ExtendedStats extends ProfileStats {
    totalOrders: number;
    memberSince: string;
    rank: string;
}

export default function ProfilePage() {
    const { user, profile } = useSupabaseAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<ExtendedStats>({
        downloads: 0,
        licenses: 0,
        wishlistItems: 0,
        reviewsGiven: 0,
        supportTickets: 0,
        activeProducts: 0,
        totalSpent: 0,
        totalOrders: 0,
        memberSince: '',
        rank: 'Member'
    });

    const loadStats = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const profileStats = await getProfileStats(user.id);

            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();

            let totalOrders = 0;
            if (supabase) {
                const { count } = await supabase
                    .from('orders')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', user.id);
                totalOrders = count || 0;
            }

            let rank = 'Member';
            if (profileStats.totalSpent >= 10000000) rank = 'Diamond';
            else if (profileStats.totalSpent >= 5000000) rank = 'Platinum';
            else if (profileStats.totalSpent >= 2000000) rank = 'Gold';
            else if (profileStats.totalSpent >= 500000) rank = 'Silver';
            else if (profileStats.licenses >= 3) rank = 'VIP Member';

            setStats({
                ...profileStats,
                totalOrders,
                memberSince: user.created_at || '',
                rank
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id, user?.created_at]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    // Stat cards with refined colors
    const statCards = [
        {
            href: '/profile/downloads',
            icon: Download,
            label: 'Downloads',
            value: stats.downloads,
            gradient: 'from-orange-500 to-amber-500',
            shadow: 'shadow-orange-500/20',
            hoverBorder: 'hover:border-orange-200'
        },
        {
            href: '/profile/licenses',
            icon: Key,
            label: 'Licenses',
            value: stats.licenses,
            gradient: 'from-violet-500 to-purple-500',
            shadow: 'shadow-violet-500/20',
            hoverBorder: 'hover:border-violet-200'
        },
        {
            href: '/profile/orders',
            icon: Package,
            label: 'Sản phẩm',
            value: stats.activeProducts,
            gradient: 'from-cyan-500 to-blue-500',
            shadow: 'shadow-cyan-500/20',
            hoverBorder: 'hover:border-cyan-200'
        },
        {
            href: '/wishlist',
            icon: Heart,
            label: 'Wishlist',
            value: stats.wishlistItems,
            gradient: 'from-pink-500 to-rose-500',
            shadow: 'shadow-pink-500/20',
            hoverBorder: 'hover:border-pink-200'
        },
        {
            href: '/products?sort=rating',
            icon: Star,
            label: 'Reviews',
            value: stats.reviewsGiven,
            gradient: 'from-amber-500 to-yellow-500',
            shadow: 'shadow-amber-500/20',
            hoverBorder: 'hover:border-amber-200'
        },
        {
            href: '/profile/support',
            icon: LifeBuoy,
            label: 'Tickets',
            value: stats.supportTickets,
            gradient: 'from-emerald-500 to-green-500',
            shadow: 'shadow-emerald-500/20',
            hoverBorder: 'hover:border-emerald-200'
        },
    ];

    // Quick action links with proper colors
    const quickLinks = [
        {
            href: '/profile/orders',
            icon: ShoppingBag,
            label: 'Đơn hàng của tôi',
            desc: 'Xem lịch sử mua hàng',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600'
        },
        {
            href: '/profile/downloads',
            icon: Download,
            label: 'Tải xuống',
            desc: 'Quản lý file đã mua',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600'
        },
        {
            href: '/profile/licenses',
            icon: Key,
            label: 'Giấy phép',
            desc: 'Quản lý license keys',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600'
        },
        {
            href: '/profile/support',
            icon: LifeBuoy,
            label: 'Hỗ trợ',
            desc: 'Tạo ticket hỗ trợ',
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600'
        },
    ];

    // Recent activity with real icons
    const recentActivities = [
        { icon: Download, text: 'Tải xuống Premium Theme v2.0', time: '2 giờ trước', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
        { icon: CreditCard, text: 'Thanh toán đơn hàng #12345', time: '1 ngày trước', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
        { icon: Star, text: 'Đánh giá 5 sao cho Landing Page Kit', time: '3 ngày trước', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
    ];

    // Rank colors
    const getRankStyle = (rank: string) => {
        switch (rank) {
            case 'Diamond': return 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white';
            case 'Platinum': return 'bg-gradient-to-r from-slate-400 to-slate-500 text-white';
            case 'Gold': return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white';
            case 'Silver': return 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800';
            case 'VIP Member': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
            default: return 'bg-white/20 backdrop-blur-sm text-white';
        }
    };

    return (
        <div className="space-y-6">
            {/* Welcome Banner - Dark Premium Theme */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
                </div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-orange-500/20">
                                <Sparkles size={12} /> Shop Web rẻ Member
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black mb-2 flex items-center gap-3">
                            Xin chào, {profile?.name || 'Người dùng'}!
                            <Hand size={28} className="text-amber-400 animate-pulse" />
                        </h1>
                        <p className="text-slate-400 text-sm md:text-base mb-4">
                            Chào mừng bạn trở lại với Shop Web rẻ
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full">
                                <Clock size={14} className="text-slate-400" />
                                Thành viên từ {stats.memberSince ? new Date(stats.memberSince).toLocaleDateString('vi-VN') : '...'}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold ${getRankStyle(stats.rank)}`}>
                                <Crown size={14} />
                                {stats.rank}
                            </span>
                        </div>
                    </div>

                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-0.5 shadow-xl shadow-orange-500/20">
                            <div className="w-full h-full rounded-2xl bg-slate-800 flex items-center justify-center overflow-hidden">
                                {profile?.avatar ? (
                                    <Image src={profile.avatar} alt="Avatar" fill className="object-cover rounded-2xl" />
                                ) : (
                                    <User size={36} className="text-slate-400" />
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-slate-900 rounded-full flex items-center justify-center">
                            <CheckCircle size={12} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {statCards.map((stat, idx) => (
                        <Link
                            key={idx}
                            href={stat.href}
                            className={`bg-white rounded-2xl border border-slate-100 p-5 ${stat.hoverBorder} hover:shadow-xl transition-all duration-300 group`}
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg ${stat.shadow}`}>
                                <stat.icon size={26} className="text-white" strokeWidth={2} />
                            </div>
                            <p className="text-xs text-slate-500 font-semibold mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        </Link>
                    ))}
                </div>
            )}

            {/* Quick Links Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickLinks.map((link, idx) => (
                    <Link
                        key={idx}
                        href={link.href}
                        className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-orange-200 hover:shadow-lg transition-all duration-300 group flex items-center gap-4"
                    >
                        <div className={`w-12 h-12 rounded-xl ${link.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <link.icon size={24} className={link.iconColor} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                                {link.label}
                            </h3>
                            <p className="text-sm text-slate-500 truncate">{link.desc}</p>
                        </div>
                        <ChevronRight size={20} className="text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </Link>
                ))}
            </div>

            {/* Recent Activity & Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <TrendingUp size={18} className="text-orange-600" />
                        </div>
                        Hoạt động gần đây
                    </h3>

                    {stats.totalOrders > 0 || stats.downloads > 0 ? (
                        <div className="space-y-3">
                            {recentActivities.map((activity, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className={`w-10 h-10 rounded-xl ${activity.iconBg} flex items-center justify-center flex-shrink-0`}>
                                        <activity.icon size={18} className={activity.iconColor} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">{activity.text}</p>
                                        <p className="text-xs text-slate-400">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Package size={28} className="text-slate-300" />
                            </div>
                            <p className="font-medium text-slate-500">Chưa có hoạt động nào</p>
                            <p className="text-sm text-slate-400 mt-1">Bắt đầu mua sắm để thấy hoạt động của bạn!</p>
                        </div>
                    )}
                </div>

                {/* Account Summary */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <FileText size={18} className="text-orange-600" />
                        </div>
                        Tổng quan tài khoản
                    </h3>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                            <span className="text-sm text-slate-600">Tổng đơn hàng</span>
                            <span className="font-bold text-slate-900">{stats.totalOrders}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                            <span className="text-sm text-slate-600">Sản phẩm sở hữu</span>
                            <span className="font-bold text-slate-900">{stats.activeProducts}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                            <span className="text-sm text-slate-600">Đã chi tiêu</span>
                            <span className="font-bold text-green-600">
                                {stats.totalSpent.toLocaleString('vi-VN')}đ
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                            <span className="text-sm text-slate-600 flex items-center gap-1.5">
                                <Gift size={14} className="text-orange-500" />
                                Hạng thành viên
                            </span>
                            <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${getRankStyle(stats.rank)}`}>
                                {stats.rank}
                            </span>
                        </div>
                    </div>

                    <Link
                        href="/profile/settings"
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-orange-500/30"
                    >
                        <Settings size={18} />
                        Cài đặt tài khoản
                    </Link>
                </div>
            </div>
        </div>
    );
}
