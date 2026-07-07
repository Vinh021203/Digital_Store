'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    Heart, Package, Home, ChevronRight, ShoppingCart,
    Search, SlidersHorizontal, Grid, List, Trash2,
    TrendingUp, Wallet, Sparkles, Filter, X, ArrowRight
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/product/ProductCard';

export default function WishlistPage() {
    const { wishlist, removeFromWishlist } = useCart();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); // all, onSale, themes, templates

    // Derived Statistics
    const stats = useMemo(() => {
        const totalValue = wishlist.reduce((acc, item) => acc + item.price, 0);
        const totalSaved = wishlist.reduce((acc, item) => {
            if (item.originalPrice && item.originalPrice > item.price) {
                return acc + (item.originalPrice - item.price);
            }
            return acc;
        }, 0);
        return { totalValue, totalSaved };
    }, [wishlist]);

    // Filter Logic
    const filteredItems = useMemo(() => {
        return wishlist.filter(item => {
            // Search Match
            const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

            // Category/Filter Match
            let matchFilter = true;
            if (activeFilter === 'onSale') {
                matchFilter = !!(item.originalPrice && item.originalPrice > item.price);
            } else if (activeFilter === 'themes') {
                const catName = typeof item.category === 'string' ? item.category : (item.category as any)?.name;
                matchFilter = catName?.toLowerCase().includes('theme');
            }
            // Add more filters as needed

            return matchSearch && matchFilter;
        });
    }, [wishlist, searchQuery, activeFilter]);

    // Empty State (No Items at all)
    if (!wishlist || wishlist.length === 0) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-orange-50/50 to-transparent" />
                    <div className="absolute top-20 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                    <div className="absolute top-20 right-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                    <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
                </div>

                <div className="relative z-10 max-w-lg w-full px-6 text-center">
                    <div className="mx-auto w-32 h-32 relative mb-8 group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-400 to-rose-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                        <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                            <Heart size={48} className="text-rose-500 fill-rose-50" />
                        </div>
                        <div className="absolute top-0 right-0 p-2.5 bg-orange-600 rounded-full text-white shadow-lg animate-bounce duration-[2000ms]">
                            <Sparkles size={16} fill="currentColor" />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                        Danh sách trống
                    </h1>
                    <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                        Bạn chưa lưu mẫu demo nào cả. Hãy dạo một vòng cửa hàng và "thả tim" những món đồ công nghệ xịn xò nhé!
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/products"
                            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-xl hover:shadow-orange-500/20 hover:-translate-y-1"
                        >
                            <Package size={20} />
                            Khám phá mẫu demo
                        </Link>
                        <Link
                            href="/"
                            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all hover:-translate-y-1"
                        >
                            <Home size={20} />
                            Về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Rich Header Section */}
            <div className="bg-white border-b border-slate-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-white to-rose-50 opacity-50" />
                <div className="absolute right-0 top-0 w-1/3 h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />

                <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-12">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                        <Link href="/" className="hover:text-orange-600 flex items-center gap-1 transition-colors">
                            <Home size={14} /> Home
                        </Link>
                        <ChevronRight size={14} className="text-slate-300" />
                        <span className="text-slate-900 font-bold">Wishlist</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
                                    My Collection
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="text-slate-500 text-sm font-medium">
                                    Cập nhật hôm nay
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                                Mẫu yêu thích
                            </h1>
                            <p className="text-slate-500 text-lg max-w-xl">
                                Nơi lưu giữ những ý tưởng và tài nguyên tuyệt vời cho dự án tiếp theo của bạn.
                            </p>
                        </div>

                        {/* Stats Cards */}
                        <div className="flex gap-4">
                            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 min-w-[180px]">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">Số lượng</p>
                                    <p className="text-xl font-black text-slate-900">{wishlist.length}</p>
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 min-w-[180px]">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <Wallet size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">Tổng giá trị</p>
                                    <p className="text-xl font-black text-slate-900">
                                        {stats.totalValue.toLocaleString('vi-VN')}<span className="text-sm text-slate-400">₫</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar & Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 -mt-8 relative z-10">
                {/* Toolbar */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-4 mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
                        {/* Search & Filter Group */}
                        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm trong wishlist..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                />
                            </div>

                            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                                {[
                                    { id: 'all', label: 'Tất cả' },
                                    { id: 'onSale', label: 'Đang giảm giá' },
                                    { id: 'themes', label: 'Themes UI' },
                                ].map(filter => (
                                    <button
                                        key={filter.id}
                                        onClick={() => setActiveFilter(filter.id)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeFilter === filter.id
                                            ? 'bg-slate-900 text-white shadow-md'
                                            : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                                            }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* View Options */}
                        <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <Grid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <List size={18} />
                                </button>
                            </div>

                            {filteredItems.length > 0 && (
                                <button
                                    onClick={() => {
                                        if (window.confirm('Xóa tất cả mẫu demo?')) {
                                            wishlist.forEach(i => removeFromWishlist(i.id));
                                        }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-sm font-bold transition-colors"
                                >
                                    <Trash2 size={16} />
                                    <span className="hidden md:inline">Xóa tất cả</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Grid Content */}
                {filteredItems.length > 0 ? (
                    <div className={`grid gap-6 ${viewMode === 'grid'
                        ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : 'grid-cols-1'
                        }`}>
                        {filteredItems.map(item => (
                            <ProductCard
                                key={item.id}
                                product={item}
                                viewMode={viewMode}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Search size={32} />
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg">Không tìm thấy mẫu demo</h3>
                        <p className="text-slate-500">Thử thay đổi từ khóa hoặc bộ lọc của bạn xem sao.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                            className="mt-4 text-orange-600 font-bold text-sm hover:underline"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
