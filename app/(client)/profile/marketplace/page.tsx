'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Store, Package, Star, TrendingUp, Eye, ShoppingCart,
    Plus, Edit, Loader2, DollarSign, BarChart3,
    Clock, CheckCircle, XCircle, RefreshCw, Search,
    Award, Users, Wallet, ArrowUpRight, Sparkles, Home, ChevronRight, ArrowLeft
} from 'lucide-react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useToast } from '@/context/ToastContext';
import { getSellerByUserId, type DbSeller } from '@/lib/sellers';

interface SellerProduct {
    id: number;
    name: string;
    slug: string;
    image: string;
    price: number;
    status: 'active' | 'pending' | 'rejected' | 'draft';
    views_count: number;
    downloads_count: number;
    rating: number;
    created_at: string;
}

export default function MarketplacePage() {
    const { user, profile } = useSupabaseAuth();
    const { addToast } = useToast();
    const [seller, setSeller] = useState<DbSeller | null>(null);
    const [products, setProducts] = useState<SellerProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const loadData = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            // Get seller info
            const sellerData = await getSellerByUserId(user.id);
            setSeller(sellerData);

            if (sellerData) {
                // Get seller products
                const { createClient } = await import('@/lib/supabase/client');
                const supabase = createClient();
                if (supabase) {
                    const { data } = await supabase
                        .from('products')
                        .select('id, name, slug, image, price, status, views_count, downloads_count, rating, created_at')
                        .eq('seller_id', sellerData.id)
                        .order('created_at', { ascending: false });

                    if (data) {
                        setProducts(data as SellerProduct[]);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full">
                        <CheckCircle size={14} /> Đang bán
                    </span>
                );
            case 'pending':
                return (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full">
                        <Clock size={14} /> Chờ duyệt
                    </span>
                );
            case 'rejected':
                return (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100 px-3 py-1.5 rounded-full">
                        <XCircle size={14} /> Từ chối
                    </span>
                );
            default:
                return (
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                        Nháp
                    </span>
                );
        }
    };

    // Filter products
    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'all' || p.status === filterStatus;
        return matchSearch && matchStatus;
    });

    // Stats
    const stats = {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.status === 'active').length,
        totalViews: products.reduce((sum, p) => sum + (p.views_count || 0), 0),
        totalSales: products.reduce((sum, p) => sum + (p.downloads_count || 0), 0),
        totalRevenue: seller?.total_earnings || 0,
        balance: seller?.balance || 0,
    };

    // Not a seller yet
    if (!loading && !seller) {
        return (
            <div className="space-y-6">
                {/* Dark Premium Header */}
                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
                    </div>
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                            <Link href="/" className="hover:text-white transition-colors"><Home size={14} /></Link>
                            <ChevronRight size={14} />
                            <Link href="/profile" className="hover:text-white transition-colors">Profile</Link>
                            <ChevronRight size={14} />
                            <span className="text-white font-medium">Marketplace</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <Store size={28} className="text-white" />
                            </div>
                            <div>
                                <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-bold mb-2 inline-block">
                                    <Sparkles size={10} className="inline mr-1" /> Seller Program
                                </span>
                                <h1 className="text-2xl md:text-3xl font-black">Trở thành Seller</h1>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Benefits */}
                <div className="text-center py-8">
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                        Bắt đầu bán sản phẩm digital của bạn trên DigitalMart và kiếm thu nhập thụ động
                    </p>

                    <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 text-left hover:shadow-lg transition-all">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center mb-3">
                                <DollarSign size={24} className="text-emerald-600" />
                            </div>
                            <h4 className="font-bold text-slate-900 mb-1">Hoa hồng cao</h4>
                            <p className="text-sm text-slate-500">Giữ lại đến 80% doanh thu</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 text-left hover:shadow-lg transition-all">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mb-3">
                                <Users size={24} className="text-blue-600" />
                            </div>
                            <h4 className="font-bold text-slate-900 mb-1">50K+ khách hàng</h4>
                            <p className="text-sm text-slate-500">Tiếp cận cộng đồng lớn</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 text-left hover:shadow-lg transition-all">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl flex items-center justify-center mb-3">
                                <Award size={24} className="text-purple-600" />
                            </div>
                            <h4 className="font-bold text-slate-900 mb-1">Hỗ trợ 24/7</h4>
                            <p className="text-sm text-slate-500">Đội ngũ tận tâm</p>
                        </div>
                    </div>

                    <Link
                        href="/seller/register"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                    >
                        <Sparkles size={20} />
                        Đăng ký trở thành Seller
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Dark Premium Header */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
                </div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                        <Link href="/" className="hover:text-white transition-colors"><Home size={14} /></Link>
                        <ChevronRight size={14} />
                        <Link href="/profile" className="hover:text-white transition-colors">Profile</Link>
                        <ChevronRight size={14} />
                        <span className="text-white font-medium">Marketplace</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <Store size={28} className="text-white" />
                            </div>
                            <div>
                                <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-bold mb-2 inline-block">
                                    <Sparkles size={10} className="inline mr-1" /> Seller Dashboard
                                </span>
                                <h1 className="text-2xl md:text-3xl font-black">Marketplace</h1>
                                <p className="text-slate-400 text-sm">Quản lý sản phẩm của bạn</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link href="/profile" className="flex items-center gap-2 bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-white/20 transition-all">
                                <ArrowLeft size={16} />
                                Quay lại
                            </Link>
                            <button
                                onClick={loadData}
                                className="flex items-center gap-2 bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-white/20 transition-all"
                            >
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <Link
                                href="/profile/marketplace/new"
                                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                            >
                                <Plus size={18} />
                                Thêm sản phẩm
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seller Info Banner */}
            {seller && (
                <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-5 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center overflow-hidden">
                                {seller.logo ? (
                                    <Image src={seller.logo} alt={seller.store_name} width={56} height={56} className="object-cover" />
                                ) : (
                                    <Store size={24} />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-black text-xl">{seller.store_name}</h3>
                                    {seller.is_verified && (
                                        <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <CheckCircle size={12} /> Verified
                                        </span>
                                    )}
                                </div>
                                <p className="text-emerald-100 text-sm mt-1">
                                    Tham gia từ {new Date(seller.created_at).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-emerald-100 text-sm">Số dư hiện tại</p>
                                <p className="text-2xl font-black">{Number(seller.balance).toLocaleString('vi-VN')}₫</p>
                            </div>
                            <button className="bg-white text-emerald-600 px-4 py-2.5 rounded-xl font-bold hover:bg-emerald-50 transition-colors flex items-center gap-2 shadow-lg">
                                <Wallet size={18} />
                                Rút tiền
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                            <Package size={22} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{stats.totalProducts}</p>
                            <p className="text-xs text-slate-500 font-medium">Sản phẩm</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                            <Eye size={22} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{stats.totalViews.toLocaleString()}</p>
                            <p className="text-xs text-slate-500 font-medium">Lượt xem</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl flex items-center justify-center">
                            <ShoppingCart size={22} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{stats.totalSales}</p>
                            <p className="text-xs text-slate-500 font-medium">Đã bán</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                            <TrendingUp size={22} className="text-orange-600" />
                        </div>
                        <div>
                            <p className="text-lg font-black text-orange-600">
                                {(stats.totalRevenue / 1000000).toFixed(1)}M
                            </p>
                            <p className="text-xs text-slate-500 font-medium">Doanh thu</p>
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
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-600 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang bán</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="draft">Nháp</option>
                </select>
            </div>

            {/* Products List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-medium">Đang tải...</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Package size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có sản phẩm nào</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        Bắt đầu bán hàng bằng cách thêm sản phẩm đầu tiên
                    </p>
                    <Link
                        href="/profile/marketplace/new"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                    >
                        <Plus size={18} />
                        Thêm sản phẩm đầu tiên
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="p-4 md:p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
                                {/* Image */}
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 relative bg-slate-100">
                                    {product.image ? (
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package size={24} className="text-slate-300" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h4 className="font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                                                {product.name}
                                            </h4>
                                            <p className="text-orange-600 font-bold">{product.price.toLocaleString('vi-VN')}₫</p>
                                        </div>
                                        <div className="hidden md:block">
                                            {getStatusBadge(product.status)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Eye size={14} className="text-blue-400" /> {product.views_count}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <ShoppingCart size={14} className="text-purple-400" /> {product.downloads_count}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Star size={14} className="text-amber-400 fill-amber-400" /> {product.rating || '0.0'}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/product/${product.slug}`}
                                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        title="Xem sản phẩm"
                                    >
                                        <ArrowUpRight size={18} />
                                    </Link>
                                    <Link
                                        href={`/profile/marketplace/${product.id}/edit`}
                                        className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                        title="Chỉnh sửa"
                                    >
                                        <Edit size={18} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
