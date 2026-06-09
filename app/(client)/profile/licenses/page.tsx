'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Key, Shield, Copy, CheckCircle, XCircle, Clock,
    ChevronRight, Home, Search, Loader2, Eye, Calendar,
    Globe, Zap, AlertCircle, Package, RefreshCw, Sparkles, ArrowLeft
} from 'lucide-react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useToast } from '@/context/ToastContext';
import { fetchUserLicenses, activateLicense, type DbLicense } from '@/lib/licenses';

export default function LicensesPage() {
    const { user, profile, loading: authLoading } = useSupabaseAuth();
    const { addToast } = useToast();
    const [licenses, setLicenses] = useState<DbLicense[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'revoked'>('all');
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [activatingId, setActivatingId] = useState<number | null>(null);

    const loadLicenses = useCallback(async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const data = await fetchUserLicenses(user.id);
            setLicenses(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user) {
            loadLicenses();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading, loadLicenses]);

    const handleCopyKey = (license: DbLicense) => {
        navigator.clipboard.writeText(license.license_key);
        addToast('Đã sao chép license key!', 'success');
        setCopiedId(license.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleActivate = async (license: DbLicense) => {
        setActivatingId(license.id);
        try {
            const success = await activateLicense(license.id);
            if (success) {
                addToast('Kích hoạt license thành công!', 'success');
                loadLicenses();
            } else {
                addToast('Không thể kích hoạt license', 'error');
            }
        } catch (error) {
            addToast('Có lỗi xảy ra', 'error');
        } finally {
            setActivatingId(null);
        }
    };

    const getStatusInfo = (license: DbLicense) => {
        const isExpired = license.expires_at && new Date(license.expires_at) < new Date();
        const status = isExpired ? 'expired' : license.status;

        const statusMap = {
            active: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Active' },
            expired: { icon: Clock, color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Hết hạn' },
            revoked: { icon: XCircle, color: 'bg-red-100 text-red-700 border-red-200', label: 'Thu hồi' },
        };

        return statusMap[status as keyof typeof statusMap] || statusMap.active;
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'Regular': 'bg-slate-100 text-slate-600',
            'Extended': 'bg-violet-100 text-violet-600',
            'Unlimited': 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
        };
        return colors[type] || colors['Regular'];
    };

    // Filter
    const filteredLicenses = licenses.filter(license => {
        const matchesSearch = license.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            license.license_key.toLowerCase().includes(searchQuery.toLowerCase());

        if (statusFilter === 'all') return matchesSearch;

        const isExpired = license.expires_at && new Date(license.expires_at) < new Date();
        const currentStatus = isExpired ? 'expired' : license.status;

        return matchesSearch && currentStatus === statusFilter;
    });

    // Stats
    const stats = {
        total: licenses.length,
        active: licenses.filter(l => l.status === 'active' && (!l.expires_at || new Date(l.expires_at) > new Date())).length,
        expired: licenses.filter(l => l.expires_at && new Date(l.expires_at) < new Date()).length,
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Đang tải licenses...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Key size={32} className="text-slate-300" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Vui lòng đăng nhập</h2>
                    <p className="text-slate-500 mb-4">Bạn cần đăng nhập để xem licenses</p>
                    <Link href="/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all">
                        Đăng nhập
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Dark Premium Header */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
                </div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

                <div className="relative z-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                        <Link href="/" className="hover:text-white transition-colors"><Home size={14} /></Link>
                        <ChevronRight size={14} />
                        <Link href="/profile" className="hover:text-white transition-colors">Profile</Link>
                        <ChevronRight size={14} />
                        <span className="text-white font-medium">Licenses</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                                <Key size={28} className="text-white" />
                            </div>
                            <div>
                                <span className="bg-violet-500/20 text-violet-300 px-2.5 py-0.5 rounded-full text-xs font-bold mb-2 inline-block">
                                    <Sparkles size={10} className="inline mr-1" /> License Manager
                                </span>
                                <h1 className="text-2xl md:text-3xl font-black">License Keys</h1>
                                <p className="text-slate-400 text-sm">{licenses.length} licenses đã sở hữu</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link href="/profile" className="flex items-center gap-2 bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-white/20 transition-all">
                                <ArrowLeft size={16} />
                                Quay lại
                            </Link>
                            <button
                                onClick={loadLicenses}
                                className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white px-4 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                            >
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                Làm mới
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                            <Key size={22} className="text-slate-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                            <p className="text-xs text-slate-500 font-medium">Tổng licenses</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
                            <CheckCircle size={22} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-emerald-600">{stats.active}</p>
                            <p className="text-xs text-slate-500 font-medium">Đang hoạt động</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                            <Clock size={22} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-amber-600">{stats.expired}</p>
                            <p className="text-xs text-slate-500 font-medium">Hết hạn</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo sản phẩm hoặc key..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                    />
                </div>
                <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-1">
                    {(['all', 'active', 'expired'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === status
                                ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {status === 'all' ? 'Tất cả' : status === 'active' ? 'Active' : 'Hết hạn'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Licenses List */}
            {filteredLicenses.length > 0 ? (
                <div className="grid gap-4">
                    {filteredLicenses.map((license) => {
                        const statusInfo = getStatusInfo(license);
                        const StatusIcon = statusInfo.icon;
                        const canActivate = license.status === 'active' && license.activations_used < license.activations_limit;

                        return (
                            <div
                                key={license.id}
                                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-violet-200 hover:shadow-xl transition-all"
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* Product Image */}
                                    <div className="md:w-44 h-36 md:h-auto flex-shrink-0 relative overflow-hidden bg-slate-100">
                                        {license.product?.image ? (
                                            <Image
                                                src={license.product.image}
                                                alt={license.product.name || 'Product'}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package size={40} className="text-slate-300" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-5">
                                        <div className="flex flex-col h-full">
                                            {/* Header Row */}
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div>
                                                    {/* Badges */}
                                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold border ${statusInfo.color}`}>
                                                            <StatusIcon size={12} />
                                                            {statusInfo.label}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${getTypeColor(license.type)}`}>
                                                            {license.type}
                                                        </span>
                                                    </div>
                                                    {/* Product Name */}
                                                    <h3 className="font-bold text-lg text-slate-900 hover:text-violet-600 transition-colors">
                                                        <Link href={`/product/${license.product?.slug || license.product_id}`}>
                                                            {license.product?.name || `Product #${license.product_id}`}
                                                        </Link>
                                                    </h3>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-col gap-2">
                                                    {canActivate && (
                                                        <button
                                                            onClick={() => handleActivate(license)}
                                                            disabled={activatingId === license.id}
                                                            className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 hover:shadow-xl"
                                                        >
                                                            {activatingId === license.id ? (
                                                                <Loader2 size={14} className="animate-spin" />
                                                            ) : (
                                                                <Shield size={14} />
                                                            )}
                                                            Kích hoạt
                                                        </button>
                                                    )}
                                                    <Link
                                                        href={`/product/${license.product?.slug || license.product_id}`}
                                                        className="flex items-center justify-center gap-1.5 border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                                                    >
                                                        <Eye size={14} />
                                                        Chi tiết
                                                    </Link>
                                                </div>
                                            </div>

                                            {/* License Key */}
                                            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3">
                                                <Key size={14} className="text-violet-500 flex-shrink-0" />
                                                <code className="flex-1 font-mono text-sm text-slate-700 truncate">
                                                    {license.license_key}
                                                </code>
                                                <button
                                                    onClick={() => handleCopyKey(license)}
                                                    className={`flex-shrink-0 p-2 rounded-lg transition-all ${copiedId === license.id
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-violet-100 text-violet-600 hover:bg-violet-200'
                                                        }`}
                                                >
                                                    {copiedId === license.id ? <CheckCircle size={14} /> : <Copy size={14} />}
                                                </button>
                                            </div>

                                            {/* Meta Info */}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} className="text-violet-400" />
                                                    Tạo: {new Date(license.created_at).toLocaleDateString('vi-VN')}
                                                </span>
                                                {license.expires_at && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} className="text-amber-400" />
                                                        Hết hạn: {new Date(license.expires_at).toLocaleDateString('vi-VN')}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Zap size={12} className="text-emerald-400" />
                                                    Kích hoạt: {license.activations_used}/{license.activations_limit}
                                                </span>
                                                {license.domain && (
                                                    <span className="flex items-center gap-1">
                                                        <Globe size={12} className="text-blue-400" />
                                                        {license.domain}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Key size={32} className="text-slate-300" />
                    </div>
                    <h3 className="font-bold text-xl text-slate-900 mb-2">
                        {searchQuery || statusFilter !== 'all' ? 'Không tìm thấy license' : 'Chưa có license nào'}
                    </h3>
                    <p className="text-slate-500 mb-6">
                        {searchQuery ? 'Thử với từ khóa khác' : 'Mua sản phẩm để nhận license key'}
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                    >
                        Khám phá sản phẩm
                        <ChevronRight size={18} />
                    </Link>
                </div>
            )}

            {/* Info Box */}
            <div className="p-5 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-100">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertCircle size={20} className="text-violet-600" />
                    </div>
                    <div className="text-sm">
                        <p className="font-bold text-violet-900 mb-2">Về License Keys</p>
                        <ul className="text-violet-700 space-y-1">
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-violet-400 rounded-full"></span> <strong>Regular:</strong> 1 dự án cá nhân hoặc client</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-violet-400 rounded-full"></span> <strong>Extended:</strong> Không giới hạn số dự án</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-violet-400 rounded-full"></span> <strong>Unlimited:</strong> Sử dụng vĩnh viễn + hỗ trợ ưu tiên</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
