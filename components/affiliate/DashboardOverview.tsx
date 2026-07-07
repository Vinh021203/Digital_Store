// components/affiliate/DashboardOverview.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    DollarSign, Users, TrendingUp, Copy, CreditCard,
    Link as LinkIcon, MousePointerClick, Zap, Award,
    ArrowUpRight, ArrowDownRight, Target, ShoppingCart,
    Calendar, ChevronRight, Sparkles, Gift, Clock,
    BarChart3, PieChart, Activity, Flame, Star, Trophy,
    Share2, PenLine, Hand, MessageCircle, ShieldCheck
} from 'lucide-react';
import { getAffiliateStats, fetchUserReferrals, DbAffiliateReferral } from '@/lib/affiliate';
import Link from 'next/link';

interface DashboardOverviewProps {
    user: {
        id: string;
        name: string;
        affiliateCode: string;
    };
    handleCopyLink: () => void;
    copied: boolean;
}

export const DashboardOverview = ({ user, handleCopyLink, copied }: DashboardOverviewProps) => {
    const [stats, setStats] = useState({
        totalReferrals: 0,
        totalCommission: 0,
        availableBalance: 0,
        pendingCommission: 0,
        paidOut: 0,
    });
    const [referrals, setReferrals] = useState<DbAffiliateReferral[]>([]);
    const [loading, setLoading] = useState(true);
    const [clicks] = useState(42);
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

    const loadData = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const [statsData, referralsData] = await Promise.all([
                getAffiliateStats(user.id),
                fetchUserReferrals(user.id)
            ]);
            if (statsData) {
                setStats({
                    totalReferrals: statsData.totalReferrals || 0,
                    totalCommission: statsData.totalCommission || 0,
                    availableBalance: statsData.availableBalance || 0,
                    pendingCommission: statsData.pendingCommission || 0,
                    paidOut: statsData.paidOut || 0,
                });
            }
            setReferrals(referralsData || []);
        } catch (error) {
            console.error('Error loading affiliate data:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const conversionRate = clicks > 0 ? ((stats.totalReferrals / clicks) * 100).toFixed(1) : '0';

    // Calculate growth (mock data - would come from API in production)
    const growthPercentage = 15.3;
    const isGrowthPositive = growthPercentage > 0;
    const statCards = [
        {
            label: 'Quyền lợi ghi nhận',
            value: `${stats.totalCommission.toLocaleString('vi-VN')}₫`,
            icon: DollarSign,
            accent: 'from-orange-500 to-amber-500',
            ring: 'group-hover:border-orange-200 group-hover:shadow-orange-500/10',
            meta: `${Math.abs(growthPercentage)}% tháng này`,
        },
        {
            label: 'Có thể đối soát',
            value: `${stats.availableBalance.toLocaleString('vi-VN')}₫`,
            icon: CreditCard,
            accent: 'from-emerald-500 to-teal-500',
            ring: 'group-hover:border-emerald-200 group-hover:shadow-emerald-500/10',
            meta: 'Khả dụng',
        },
        {
            label: 'Khách quan tâm',
            value: stats.totalReferrals.toString(),
            icon: Users,
            accent: 'from-blue-500 to-indigo-500',
            ring: 'group-hover:border-blue-200 group-hover:shadow-blue-500/10',
            meta: 'Lead tư vấn',
        },
        {
            label: 'Tỷ lệ chuyển đổi',
            value: `${conversionRate}%`,
            icon: Target,
            accent: 'from-violet-500 to-fuchsia-500',
            ring: 'group-hover:border-violet-200 group-hover:shadow-violet-500/10',
            meta: `${clicks} clicks`,
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Banner - Modern Gradient */}
            <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-[1.75rem] p-6 md:p-8 text-white overflow-hidden shadow-2xl shadow-slate-900/10">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
                </div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-sky-500/15 rounded-full blur-3xl" />
                <div className="absolute right-10 top-10 h-3 w-3 rounded-full bg-orange-300 shadow-[0_0_28px_rgba(251,146,60,0.9)]" />

                <div className="relative z-10">
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                        {/* Left Content */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-orange-500/20">
                                    <Trophy size={12} /> Đối tác chính thức
                                </span>
                                <span className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                                    <ShieldCheck size={12} className="text-emerald-300" /> Catalogue mode
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black mb-3 flex items-center gap-3 tracking-tight">
                                Xin chào, {user.name}!
                                <Hand size={26} className="text-amber-300" />
                            </h1>
                            <p className="text-slate-300 max-w-2xl leading-7">
                                Bạn đã giới thiệu thành công <span className="text-orange-400 font-bold">{stats.totalReferrals}</span> khách quan tâm
                                và có <span className="text-green-400 font-bold">{stats.totalCommission.toLocaleString('vi-VN')}₫</span> quyền lợi đã ghi nhận.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2">
                                {['Lead tư vấn', 'Link ref riêng', 'Đối soát thủ công'].map(item => (
                                    <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Right - Affiliate Link Card */}
                        <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-4 border border-white/10 min-w-0 xl:min-w-[420px] shadow-xl shadow-black/10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                                    <LinkIcon size={14} />
                                </div>
                                <span className="text-xs text-slate-400 font-medium">Link giới thiệu của bạn</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-white/5 rounded-xl px-3 py-2 min-w-0">
                                    <p className="text-xs font-mono text-slate-300 truncate">
                                        {typeof window !== 'undefined' ? `${window.location.origin}/?ref=${user.affiliateCode}` : ''}
                                    </p>
                                </div>
                                <button
                                    onClick={handleCopyLink}
                                    className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${copied
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/30'
                                        }`}
                                >
                                    <Copy size={14} />
                                    {copied ? 'Đã copy!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(card => (
                    <div key={card.label} className={`group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${card.ring}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${card.accent} rounded-2xl flex items-center justify-center shadow-lg`}>
                                <card.icon size={23} className="text-white" />
                            </div>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-500">{card.meta}</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight">{card.value}</p>
                        <p className="text-sm font-bold text-slate-500 mt-1">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions - 2 cols */}
                <div className="lg:col-span-2 bg-white rounded-[1.5rem] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-bold text-slate-900 flex items-center gap-2">
                            <Activity size={18} className="text-orange-600" />
                            Lead tư vấn gần đây
                        </h2>
                        <div className="flex items-center gap-2">
                            {(['week', 'month', 'all'] as const).map(period => (
                                <button
                                    key={period}
                                    onClick={() => setSelectedPeriod(period)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedPeriod === period
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                >
                                    {period === 'week' ? '7 ngày' : period === 'month' ? '30 ngày' : 'Tất cả'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="px-5 py-3">Khách quan tâm</th>
                                    <th className="px-5 py-3">Ngày</th>
                                    <th className="px-5 py-3">Quyền lợi</th>
                                    <th className="px-5 py-3">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {referrals.length > 0 ? (
                                    referrals.slice(0, 5).map((ref) => (
                                        <tr key={ref.id} className="hover:bg-orange-50/50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                        {ref.referred?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm">{ref.referred?.name || 'Ẩn danh'}</p>
                                                        <p className="text-xs text-slate-400">#{(ref.order_id || ref.id).toString().slice(-6)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                                    <Clock size={12} />
                                                    {new Date(ref.created_at).toLocaleDateString('vi-VN')}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="font-black text-emerald-600">+{ref.commission.toLocaleString('vi-VN')}₫</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold
                                                ${ref.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                        ref.status === 'approved' ? 'bg-orange-100 text-orange-700' :
                                                            ref.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-amber-100 text-amber-700'}`}>
                                                    {ref.status === 'paid' && <DollarSign size={10} />}
                                                    {ref.status === 'paid' ? 'Đã đối soát' :
                                                        ref.status === 'approved' ? 'Đã duyệt' :
                                                            ref.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-12 text-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <MessageCircle size={28} className="text-slate-300" />
                                            </div>
                                            <p className="text-slate-500 font-medium mb-2">Chưa có lead tư vấn nào</p>
                                            <p className="text-slate-400 text-sm">Chia sẻ link giới thiệu để ghi nhận nhu cầu tư vấn.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {referrals.length > 5 && (
                        <div className="p-4 border-t border-slate-100 text-center">
                            <Link href="/affiliate/dashboard?tab=referrals" className="text-orange-600 font-bold text-sm hover:underline inline-flex items-center gap-1">
                                Xem tất cả <ChevronRight size={14} />
                            </Link>
                        </div>
                    )}
                </div>

                {/* Right Column - Goals & Tips */}
                <div className="space-y-6">
                    {/* Monthly Goals */}
                    <div className="bg-white rounded-[1.5rem] border border-slate-200 p-5 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Zap size={18} className="text-amber-500" />
                            Mục tiêu tháng này
                        </h3>
                        <div className="space-y-4">
                            {/* Goal 1 */}
                            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-slate-700">Quyền lợi 5.000.000₫</span>
                                    <span className="text-xs font-black text-orange-600">{Math.min((stats.totalCommission / 5000000) * 100, 100).toFixed(0)}%</span>
                                </div>
                                <div className="h-2 bg-white rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min((stats.totalCommission / 5000000) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                    <Gift size={12} className="text-orange-500" />
                                    Thưởng: <span className="font-bold text-orange-600">200.000₫</span>
                                </p>
                            </div>

                            {/* Goal 2 */}
                            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-slate-700">Giới thiệu 5 lead</span>
                                    <span className="text-xs font-black text-blue-600">{Math.min(stats.totalReferrals, 5)}/5</span>
                                </div>
                                <div className="h-2 bg-white rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min((stats.totalReferrals / 5) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                    <Gift size={12} className="text-blue-500" />
                                    Thưởng: <span className="font-bold text-blue-600">Voucher 500K</span>
                                </p>
                            </div>

                            {/* Goal 3 */}
                            <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-slate-700">100 lượt click</span>
                                    <span className="text-xs font-black text-green-600">{clicks}/100</span>
                                </div>
                                <div className="h-2 bg-white rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min((clicks / 100) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                    <Gift size={12} className="text-green-500" />
                                    Thưởng: <span className="font-bold text-green-600">Badge VIP</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Tips Widget */}
                    <div className="bg-gradient-to-br from-slate-950 to-slate-800 rounded-[1.5rem] p-5 text-white shadow-xl shadow-slate-900/10">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Sparkles size={18} className="text-amber-400" />
                            Mẹo tăng lượt tư vấn
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Share2 size={16} className="text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Chia sẻ trên mạng xã hội</p>
                                    <p className="text-xs text-slate-400">Facebook, TikTok, Instagram</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <PenLine size={16} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Viết review mẫu demo</p>
                                    <p className="text-xs text-slate-400">Tăng độ tin cậy 3x</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Target size={16} className="text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Tập trung niche cụ thể</p>
                                    <p className="text-xs text-slate-400">Developer, Designer...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
