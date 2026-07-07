'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Users, DollarSign, Copy, TrendingUp, Gift,
    Loader2, CheckCircle, Wallet, RefreshCw, Link2, BarChart3,
    CreditCard, X, Home, Settings, Megaphone, Wrench,
    Menu, LogOut, Bell, MousePointerClick, Target,
    ArrowUpRight, Clock, Award, Sparkles, ChevronRight,
    Building2, QrCode, Plus, Trash2, Star, Check, AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useToast } from '@/context/ToastContext';
import {
    getAffiliateStats,
    fetchUserReferrals,
    fetchUserWithdrawals,
    createWithdrawalRequest,
    type DbAffiliateReferral,
    type DbAffiliateWithdrawal
} from '@/lib/affiliate';
import { DashboardOverview, CampaignsView, ToolsView, SettingsView } from '@/components/affiliate';

type TabType = 'dashboard' | 'campaigns' | 'tools' | 'settings' | 'referrals' | 'withdrawals';

export default function AffiliateDashboardPage() {
    const router = useRouter();
    const { user, profile, signOut } = useSupabaseAuth();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawing, setWithdrawing] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');
    const [referrals, setReferrals] = useState<DbAffiliateReferral[]>([]);
    const [withdrawals, setWithdrawals] = useState<DbAffiliateWithdrawal[]>([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'bank' | 'momo' | 'zalopay' | null>(null);
    const [paymentMethods, setPaymentMethods] = useState<Array<{
        id: string;
        type: 'bank' | 'momo' | 'zalopay';
        name: string;
        accountNumber: string;
        bankName?: string;
        isDefault: boolean;
    }>>([]);
    const [newPayment, setNewPayment] = useState({
        type: 'bank' as 'bank' | 'momo' | 'zalopay',
        accountName: '',
        accountNumber: '',
        bankName: '',
    });
    const [stats, setStats] = useState({
        affiliateCode: '',
        totalReferrals: 0,
        pendingReferrals: 0,
        approvedReferrals: 0,
        totalCommission: 0,
        paidOut: 0,
        availableBalance: 0,
        pendingCommission: 0,
    });


    const affiliateLink = typeof window !== 'undefined'
        ? `${window.location.origin}?ref=${stats.affiliateCode || 'SHOPWEBRE'}`
        : `https://webgiare.id.vn?ref=${stats.affiliateCode || 'SHOPWEBRE'}`;

    const loadData = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const statsData = await getAffiliateStats(user.id);
            if (statsData) {
                setStats(statsData);
            }

            const referralsData = await fetchUserReferrals(user.id);
            setReferrals(referralsData);

            const withdrawalsData = await fetchUserWithdrawals(user.id);
            setWithdrawals(withdrawalsData);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (!user) {
            router.push('/login?redirect=/affiliate/dashboard');
            return;
        }
        if (profile && !profile.is_affiliate) {
            router.push('/affiliate');
            return;
        }
        loadData();
    }, [user, profile, loadData, router]);

    const handleCopy = () => {
        navigator.clipboard.writeText(affiliateLink);
        setCopied(true);
        addToast('Đã sao chép link giới thiệu', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWithdraw = async () => {
        const amount = parseInt(withdrawAmount);
        if (!user?.id || isNaN(amount) || amount < 500000) {
            addToast('Giá trị đối soát tối thiểu là 500.000₫', 'error');
            return;
        }
        if (amount > stats.availableBalance) {
            addToast('Giá trị khả dụng không đủ', 'error');
            return;
        }

        setWithdrawing(true);
        try {
            await createWithdrawalRequest({
                user_id: user.id,
                amount,
            });
            addToast('Yêu cầu đối soát đã được gửi!', 'success');
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            loadData();
        } catch (error: any) {
            addToast(error.message || 'Có lỗi xảy ra', 'error');
        } finally {
            setWithdrawing(false);
        }
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        setMobileMenuOpen(false);
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { color: string; label: string }> = {
            pending: { color: 'bg-amber-100 text-amber-700', label: 'Chờ duyệt' },
            processing: { color: 'bg-blue-100 text-blue-700', label: 'Đang xử lý' },
            completed: { color: 'bg-green-100 text-green-700', label: 'Hoàn thành' },
            failed: { color: 'bg-red-100 text-red-700', label: 'Thất bại' },
            approved: { color: 'bg-green-100 text-green-700', label: 'Đã duyệt' },
            paid: { color: 'bg-emerald-100 text-emerald-700', label: 'Đã xác nhận tư vấn' },
            rejected: { color: 'bg-red-100 text-red-700', label: 'Từ chối' },
        };
        const badge = badges[status] || { color: 'bg-slate-100 text-slate-600', label: status };
        return (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    // Sidebar menu items - minimal
    const menuItems = [
        { id: 'dashboard', label: 'Tổng quan', icon: BarChart3 },
        { id: 'campaigns', label: 'Mẫu giới thiệu', icon: Megaphone },
        { id: 'referrals', label: 'Giới thiệu', icon: Users },
        { id: 'withdrawals', label: 'Đối soát', icon: Wallet },
        { id: 'tools', label: 'Công cụ link', icon: Link2 },
        { id: 'settings', label: 'Cài đặt', icon: Settings },
    ];

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            {/* Desktop Sidebar - Partner Portal Theme */}
            <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 overflow-hidden bg-slate-950 border-r border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_30%)]" />
                <div className="relative flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain no-scrollbar p-4">
                    {/* Logo */}
                    <Link href="/" className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Gift size={24} className="text-white" />
                        </div>
                        <div>
                            <p className="text-white font-black leading-tight">Partner Portal</p>
                            <p className="text-xs font-bold text-slate-400">Web Giá Rẻ Portfolio</p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as TabType)}
                                title={item.label}
                                className={`w-full rounded-2xl flex items-center gap-3 px-4 py-3 transition-all group relative ${activeTab === item.id
                                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                                    : 'text-slate-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${activeTab === item.id ? 'bg-white/15' : 'bg-white/5 group-hover:bg-white/10'}`}>
                                    <item.icon size={20} />
                                </span>
                                <span className="text-sm font-black">{item.label}</span>
                                {activeTab === item.id && <span className="ml-auto h-2 w-2 rounded-full bg-white" />}
                            </button>
                        ))}
                    </nav>

                    <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-300">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-white">Mã đối tác</p>
                                <p className="text-xs font-mono font-bold text-orange-300">{stats.affiliateCode || 'SHOPWEBRE'}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-orange-50"
                        >
                            {copied ? <CheckCircle size={16} className="text-emerald-500" /> : <Copy size={16} />}
                            {copied ? 'Đã copy link' : 'Copy link'}
                        </button>
                    </div>

                    {/* Bottom Actions */}
                    <div className="space-y-2 pt-4 border-t border-white/10">
                        <Link
                            href="/"
                            title="Về trang chủ"
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                        >
                            <Home size={20} />
                            <span className="text-sm font-bold">Về trang chủ</span>
                        </Link>
                        <button
                            onClick={() => signOut()}
                            title="Đăng xuất"
                            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                        >
                            <LogOut size={20} />
                            <span className="text-sm font-bold">Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Menu Overlay - Dark Theme */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <div className="fixed inset-y-0 left-0 w-72 bg-slate-900 shadow-2xl">
                        <div className="flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain no-scrollbar">
                            {/* Mobile Header */}
                            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                        <Gift size={20} className="text-white" />
                                    </div>
                                    <span className="font-black text-white">Web Giá Rẻ - Portfolio</span>
                                </div>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            {/* Mobile Navigation */}
                            <nav className="flex-1 p-4 space-y-1">
                                {menuItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleTabChange(item.id as TabType)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === item.id
                                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                            }`}
                                    >
                                        <item.icon size={20} />
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </nav>

                            {/* Mobile Bottom */}
                            <div className="p-4 border-t border-slate-800 space-y-2">
                                <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-white">
                                    <Home size={20} />
                                    <span>Về trang chủ</span>
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 rounded-xl hover:bg-red-500/10"
                                >
                                    <LogOut size={20} />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="lg:pl-72 min-h-screen flex flex-col">
                {/* Top Header with User Info & Stats */}
                <header className="bg-white/85 border-b border-slate-200 sticky top-0 z-30 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-4 sm:px-6 py-4">
                        {/* Left - Menu & Title */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="lg:hidden p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600"
                            >
                                <Menu size={20} />
                            </button>
                            <div>
                                <p className="hidden sm:block text-xs font-black uppercase tracking-widest text-orange-500">Đối tác giới thiệu</p>
                                <h1 className="font-black text-slate-950 text-xl">
                                    {menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
                                </h1>
                            </div>
                        </div>

                        {/* Right - User, Balance, Actions */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Balance - Desktop */}
                            <button
                                onClick={() => setShowWithdrawModal(true)}
                                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2.5 rounded-2xl font-black text-sm shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-orange-500/30"
                            >
                                <Wallet size={16} />
                                <span>{stats.availableBalance.toLocaleString('vi-VN')}₫</span>
                            </button>

                            {/* Copy Link */}
                            <button
                                onClick={handleCopy}
                                className={`hidden md:flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-sm transition-all ${copied
                                    ? 'bg-green-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:-translate-y-0.5 hover:bg-orange-100 hover:text-orange-600'
                                    }`}
                            >
                                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                                <span className="hidden lg:inline">{copied ? 'Đã copy!' : 'Copy Link'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('withdrawals')}
                                className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-2xl relative transition hover:-translate-y-0.5"
                                aria-label="Xem lịch sử đối soát"
                                title="Xem lịch sử đối soát"
                            >
                                <Bell size={18} className="text-slate-600" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                            </button>

                            <button onClick={loadData} className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-2xl transition hover:-translate-y-0.5">
                                <RefreshCw size={18} className={`text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                            </button>

                            {/* User Avatar with Dropdown */}
                            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-bold text-slate-900 leading-tight">{profile?.name || 'Đối tác'}</p>
                                    <p className="text-xs text-orange-600 font-mono">{stats.affiliateCode}</p>
                                </div>
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
                                    {profile?.name?.charAt(0) || 'A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Affiliate Link Bar - Compact */}
                    <div className="px-4 sm:px-6 pb-4">
                        <div className="flex items-center gap-2 bg-slate-50 rounded-2xl p-2 border border-slate-200 shadow-sm">
                            <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Link2 size={14} className="text-orange-600" />
                            </div>
                            <input
                                type="text"
                                value={affiliateLink}
                                readOnly
                                className="flex-1 bg-transparent text-xs sm:text-sm text-slate-600 font-mono outline-none min-w-0"
                            />
                            <button
                                onClick={handleCopy}
                                className={`flex-shrink-0 px-4 py-2 rounded-xl font-black text-xs transition-all ${copied ? 'bg-green-500 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'
                                    }`}
                            >
                                {copied ? '✓' : 'Copy'}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-8">
                    {activeTab === 'dashboard' ? (
                        <DashboardOverview
                            user={{
                                id: user?.id || '',
                                name: profile?.name || 'Đối tác',
                                affiliateCode: stats.affiliateCode
                            }}
                            handleCopyLink={handleCopy}
                            copied={copied}
                        />
                    ) : activeTab === 'campaigns' ? (
                        <CampaignsView user={{ affiliateCode: stats.affiliateCode }} />
                    ) : activeTab === 'tools' ? (
                        <ToolsView user={{ affiliateCode: stats.affiliateCode }} />
                    ) : activeTab === 'settings' ? (
                        <SettingsView user={{ id: user?.id || '', name: profile?.name || '' }} />
                    ) : activeTab === 'referrals' ? (
                        <div className="space-y-6">
                            {/* Stats Row */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Users size={16} className="text-orange-600" />
                                        <span className="text-xs text-slate-500">Tổng</span>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900">{referrals.length}</p>
                                </div>
                                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle size={16} className="text-green-600" />
                                        <span className="text-xs text-slate-500">Duyệt</span>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900">{referrals.filter(r => r.status === 'approved' || r.status === 'paid').length}</p>
                                </div>
                                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock size={16} className="text-amber-600" />
                                        <span className="text-xs text-slate-500">Chờ</span>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900">{referrals.filter(r => r.status === 'pending').length}</p>
                                </div>
                                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <DollarSign size={16} className="text-blue-600" />
                                        <span className="text-xs text-slate-500">Quyền lợi</span>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900">{(stats.totalCommission / 1000).toFixed(0)}K</p>
                                </div>
                            </div>

                            {/* Referrals List */}
                            <div className="bg-white rounded-[1.5rem] border border-slate-200 overflow-hidden shadow-sm">
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900">Danh sách giới thiệu</h3>
                                    <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold">
                                        {referrals.length}
                                    </span>
                                </div>
                                <div className="p-4">
                                    {referrals.length === 0 ? (
                                        <div className="text-center py-10">
                                            <Users size={40} className="mx-auto text-slate-200 mb-3" />
                                            <p className="text-slate-500 text-sm">Chưa có referral nào</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {referrals.map(ref => (
                                                <div key={ref.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-orange-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                                                            {ref.referred?.name?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 text-sm">{ref.referred?.name || 'Ẩn danh'}</p>
                                                            <p className="text-xs text-slate-500">{new Date(ref.created_at).toLocaleDateString('vi-VN')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-green-600 text-sm">+{Number(ref.commission).toLocaleString('vi-VN')}₫</p>
                                                        {getStatusBadge(ref.status)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Balance & Quick Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Main Balance Card */}
                                <div className="md:col-span-2 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-[1.5rem] p-6 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
                                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                                                <Wallet size={20} />
                                            </div>
                                            <span className="text-slate-400 text-sm font-medium">Số dư khả dụng</span>
                                        </div>
                                        <p className="text-4xl font-black mb-4">{stats.availableBalance.toLocaleString('vi-VN')}₫</p>
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => setShowWithdrawModal(true)}
                                                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-2xl font-bold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                                            >
                                                <ArrowUpRight size={18} />
                                                Gửi đối soát
                                            </button>
                                            <button
                                                onClick={() => setShowAddPaymentModal(true)}
                                                className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-2xl font-bold hover:-translate-y-0.5 hover:bg-white/20 transition-all"
                                            >
                                                <Plus size={18} />
                                                Thêm tài khoản
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="space-y-4">
                                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                                <CheckCircle size={20} className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Đã đối soát</p>
                                                <p className="text-lg font-black text-slate-900">{stats.paidOut.toLocaleString('vi-VN')}₫</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                                <Clock size={20} className="text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Đang chờ</p>
                                                <p className="text-lg font-black text-slate-900">{stats.pendingCommission.toLocaleString('vi-VN')}₫</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="bg-white rounded-[1.5rem] border border-slate-200 overflow-hidden shadow-sm">
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <CreditCard size={18} className="text-orange-600" />
                                        Phương thức xác nhận tư vấn
                                    </h3>
                                    <button
                                        onClick={() => setShowAddPaymentModal(true)}
                                        className="flex items-center gap-1 text-orange-600 font-bold text-sm hover:underline"
                                    >
                                        <Plus size={14} />
                                        Thêm mới
                                    </button>
                                </div>
                                <div className="p-4">
                                    {paymentMethods.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Building2 size={28} className="text-slate-300" />
                                            </div>
                                            <p className="text-slate-500 font-medium mb-2">Chưa có tài khoản xác nhận tư vấn</p>
                                            <p className="text-slate-400 text-sm mb-4">Thêm tài khoản ngân hàng hoặc ví điện tử để đối soát quyền lợi</p>
                                            <button
                                                onClick={() => setShowAddPaymentModal(true)}
                                                className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-orange-600"
                                            >
                                                <Plus size={16} />
                                                Thêm tài khoản
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {paymentMethods.map(method => (
                                                <div key={method.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-orange-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method.type === 'bank' ? 'bg-blue-100' :
                                                            method.type === 'momo' ? 'bg-pink-100' : 'bg-blue-100'
                                                            }`}>
                                                            {method.type === 'bank' ? (
                                                                <Building2 size={24} className="text-blue-600" />
                                                            ) : method.type === 'momo' ? (
                                                                <Wallet size={24} className="text-pink-600" />
                                                            ) : (
                                                                <QrCode size={24} className="text-blue-600" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-slate-900">{method.name}</p>
                                                                {method.isDefault && (
                                                                    <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded">Mặc định</span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-slate-500">
                                                                {method.bankName && `${method.bankName} • `}
                                                                {method.accountNumber}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setPaymentMethods(current => current.filter(item => item.id !== method.id));
                                                            addToast('Đã xóa phương thức xác nhận tư vấn', 'success');
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        aria-label={`Xóa phương thức xác nhận tư vấn ${method.name}`}
                                                        title="Xóa phương thức xác nhận tư vấn"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Withdrawal History */}
                            <div className="bg-white rounded-[1.5rem] border border-slate-200 overflow-hidden shadow-sm">
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <Clock size={18} className="text-orange-600" />
                                        Lịch sử đối soát
                                    </h3>
                                    <span className="text-xs font-bold text-slate-400">{withdrawals.length} giao dịch</span>
                                </div>
                                <div className="p-4">
                                    {withdrawals.length === 0 ? (
                                        <div className="text-center py-10">
                                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <CreditCard size={28} className="text-slate-300" />
                                            </div>
                                            <p className="text-slate-500 font-medium">Chưa có lịch sử đối soát</p>
                                            <p className="text-slate-400 text-sm">Tạo yêu cầu đối soát đầu tiên của bạn</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {withdrawals.map(wd => (
                                                <div key={wd.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-orange-50/60 transition">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${wd.status === 'completed' ? 'bg-green-100' :
                                                            wd.status === 'pending' ? 'bg-amber-100' :
                                                                wd.status === 'failed' ? 'bg-red-100' : 'bg-blue-100'
                                                            }`}>
                                                            {wd.status === 'completed' ? (
                                                                <CheckCircle size={20} className="text-green-600" />
                                                            ) : wd.status === 'pending' ? (
                                                                <Clock size={20} className="text-amber-600" />
                                                            ) : wd.status === 'failed' ? (
                                                                <AlertCircle size={20} className="text-red-600" />
                                                            ) : (
                                                                <ArrowUpRight size={20} className="text-blue-600" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{Number(wd.amount).toLocaleString('vi-VN')}₫</p>
                                                            <p className="text-xs text-slate-500">{new Date(wd.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        {getStatusBadge(wd.status)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* Mobile Bottom Navigation */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30">
                    <div className="grid grid-cols-6 gap-0.5 px-1 py-1">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as TabType)}
                                className={`flex flex-col items-center justify-center py-2 rounded-lg transition-colors ${activeTab === item.id ? 'text-orange-600' : 'text-slate-400'
                                    }`}
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeTab === item.id ? 'bg-orange-500 text-white' : ''
                                    }`}>
                                    <item.icon size={18} />
                                </div>
                                <span className="text-[9px] font-medium mt-0.5">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </nav>
            </div>

            {/* Withdraw Modal - Enhanced */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-black flex items-center gap-2">
                                    <Wallet size={20} />
                                    Đối soát quyền lợi
                                </h3>
                                <button onClick={() => setShowWithdrawModal(false)} className="p-1.5 hover:bg-white/10 rounded-lg">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="bg-white/10 rounded-xl p-4">
                                <p className="text-slate-400 text-xs mb-1">Số dư khả dụng</p>
                                <p className="text-3xl font-black">{stats.availableBalance.toLocaleString('vi-VN')}₫</p>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Quick Amount Buttons */}
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">Chọn nhanh</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[500000, 1000000, 2000000].map(amount => (
                                        <button
                                            key={amount}
                                            onClick={() => setWithdrawAmount(amount.toString())}
                                            className={`py-2 px-3 rounded-xl text-sm font-bold transition-all ${withdrawAmount === amount.toString()
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-orange-100 hover:text-orange-600'
                                                }`}
                                        >
                                            {(amount / 1000).toLocaleString()}K
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Amount */}
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">Hoặc nhập số tiền</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={withdrawAmount}
                                        onChange={e => setWithdrawAmount(e.target.value)}
                                        placeholder="Tối thiểu 500,000"
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 outline-none pr-12"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₫</span>
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">Phương thức đối soát</label>
                                {paymentMethods.length === 0 ? (
                                    <button
                                        onClick={() => {
                                            setShowWithdrawModal(false);
                                            setShowAddPaymentModal(true);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-orange-500 hover:text-orange-600 transition-all"
                                    >
                                        <Plus size={18} />
                                        Thêm tài khoản đối soát
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        {paymentMethods.map(method => (
                                            <button
                                                key={method.id}
                                                onClick={() => setSelectedPaymentMethod(method.type)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${selectedPaymentMethod === method.type
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${method.type === 'bank' ? 'bg-blue-100' : method.type === 'momo' ? 'bg-pink-100' : 'bg-blue-100'
                                                    }`}>
                                                    {method.type === 'bank' ? (
                                                        <Building2 size={20} className="text-blue-600" />
                                                    ) : (
                                                        <Wallet size={20} className="text-pink-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="font-bold text-slate-900 text-sm">{method.name}</p>
                                                    <p className="text-xs text-slate-500">{method.bankName} • {method.accountNumber}</p>
                                                </div>
                                                {selectedPaymentMethod === method.type && (
                                                    <Check size={18} className="text-orange-500" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleWithdraw}
                                disabled={withdrawing || !withdrawAmount || parseInt(withdrawAmount) < 500000}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-4 rounded-xl font-bold disabled:opacity-50 hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                            >
                                {withdrawing ? <Loader2 size={18} className="animate-spin" /> : <ArrowUpRight size={18} />}
                                Xác nhận đối soát
                            </button>

                            <p className="text-xs text-slate-400 text-center">
                                Thời gian xử lý: 1-3 ngày làm việc
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Payment Method Modal */}
            {showAddPaymentModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black flex items-center gap-2">
                                    <CreditCard size={20} />
                                    Thêm tài khoản
                                </h3>
                                <button onClick={() => setShowAddPaymentModal(false)} className="p-1.5 hover:bg-white/10 rounded-lg">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Payment Type Tabs */}
                            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
                                {[
                                    { id: 'bank', label: 'Ngân hàng', icon: Building2 },
                                    { id: 'momo', label: 'MoMo', icon: Wallet },
                                    { id: 'zalopay', label: 'ZaloPay', icon: QrCode },
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setNewPayment(prev => ({ ...prev, type: type.id as 'bank' | 'momo' | 'zalopay' }))}
                                        className={`flex flex-col items-center gap-1 py-3 rounded-lg font-bold text-xs transition-all ${newPayment.type === type.id
                                            ? 'bg-white text-orange-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        <type.icon size={20} />
                                        {type.label}
                                    </button>
                                ))}
                            </div>

                            {/* Bank Name (only for bank) */}
                            {newPayment.type === 'bank' && (
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-2 block">Ngân hàng</label>
                                    <select
                                        value={newPayment.bankName}
                                        onChange={e => setNewPayment(prev => ({ ...prev, bankName: e.target.value }))}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 outline-none bg-white"
                                    >
                                        <option value="">Chọn ngân hàng</option>
                                        <option value="Vietcombank">Vietcombank</option>
                                        <option value="VietinBank">VietinBank</option>
                                        <option value="BIDV">BIDV</option>
                                        <option value="Techcombank">Techcombank</option>
                                        <option value="MB Bank">MB Bank</option>
                                        <option value="ACB">ACB</option>
                                        <option value="VPBank">VPBank</option>
                                        <option value="Sacombank">Sacombank</option>
                                        <option value="TPBank">TPBank</option>
                                        <option value="Agribank">Agribank</option>
                                    </select>
                                </div>
                            )}

                            {/* Account Name */}
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">
                                    {newPayment.type === 'bank' ? 'Chủ tài khoản' : 'Tên tài khoản'}
                                </label>
                                <input
                                    type="text"
                                    value={newPayment.accountName}
                                    onChange={e => setNewPayment(prev => ({ ...prev, accountName: e.target.value }))}
                                    placeholder={newPayment.type === 'bank' ? 'NGUYEN VAN A' : 'Tên hiển thị'}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 outline-none uppercase"
                                />
                            </div>

                            {/* Account Number */}
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">
                                    {newPayment.type === 'bank' ? 'Số tài khoản' : 'Số điện thoại'}
                                </label>
                                <input
                                    type="text"
                                    value={newPayment.accountNumber}
                                    onChange={e => setNewPayment(prev => ({ ...prev, accountNumber: e.target.value }))}
                                    placeholder={newPayment.type === 'bank' ? '0123456789' : '0901234567'}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 outline-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={() => {
                                    if (!newPayment.accountName || !newPayment.accountNumber) {
                                        addToast('Vui lòng điền đầy đủ thông tin', 'error');
                                        return;
                                    }
                                    if (newPayment.type === 'bank' && !newPayment.bankName) {
                                        addToast('Vui lòng chọn ngân hàng', 'error');
                                        return;
                                    }
                                    // Add payment method
                                    const newMethod = {
                                        id: Date.now().toString(),
                                        type: newPayment.type,
                                        name: newPayment.accountName,
                                        accountNumber: newPayment.accountNumber,
                                        bankName: newPayment.bankName,
                                        isDefault: paymentMethods.length === 0,
                                    };
                                    setPaymentMethods(prev => [...prev, newMethod]);
                                    setSelectedPaymentMethod(newPayment.type);
                                    setNewPayment({ type: 'bank', accountName: '', accountNumber: '', bankName: '' });
                                    setShowAddPaymentModal(false);
                                    addToast('Đã thêm tài khoản thành công!', 'success');
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                            >
                                <Plus size={18} />
                                Thêm tài khoản
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
