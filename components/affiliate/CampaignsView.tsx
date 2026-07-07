// components/affiliate/CampaignsView.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Copy, Eye, TrendingUp, Star, Zap, Gift, ChevronLeft, ChevronRight, Loader2, Search, MessageCircle } from 'lucide-react';
import { fetchActiveProducts } from '@/lib/products';
import { useToast } from '@/context/ToastContext';
import type { Product } from '@/types';

interface CampaignsViewProps {
    user: {
        affiliateCode: string;
    };
}

interface ProductWithCommission extends Product {
    commission_rate?: number;
}

const ITEMS_PER_PAGE = 12;

export const CampaignsView = ({ user }: CampaignsViewProps) => {
    const { addToast } = useToast();
    const [products, setProducts] = useState<ProductWithCommission[]>([]);
    const [allProducts, setAllProducts] = useState<ProductWithCommission[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState<number | null>(null);

    // Load all products on mount
    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            const data = await fetchActiveProducts({ limit: 500 }); // Fetch all
            setAllProducts(data as ProductWithCommission[]);
            setLoading(false);
        };
        loadProducts();
    }, []);

    // Filter and paginate products
    useEffect(() => {
        let filtered = allProducts;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = allProducts.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.author?.toLowerCase().includes(query) ||
                p.category?.toLowerCase().includes(query)
            );
        }

        setProducts(filtered);
        setCurrentPage(1); // Reset to first page on filter change
    }, [allProducts, searchQuery]);

    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
    const paginatedProducts = products.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const getCommissionRate = (product: ProductWithCommission) => {
        return product.commission_rate || 10;
    };

    const handleCopy = (product: ProductWithCommission) => {
        const slug = (product as any).slug || product.id;
        const link = `${window.location.origin}/product/${slug}?ref=${user.affiliateCode}`;
        navigator.clipboard.writeText(link);
        addToast('Đã sao chép link giới thiệu!', 'success');
        setCopiedId(product.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible + 2) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);

            if (currentPage > 3) pages.push('...');

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) pages.push(i);

            if (currentPage < totalPages - 2) pages.push('...');

            pages.push(totalPages);
        }

        return pages;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-3" />
                    <p className="text-slate-500">Đang tải mẫu demo...</p>
                </div>
            </div>
        );
    }

    const maxRate = allProducts.length > 0
        ? Math.max(...allProducts.map(p => getCommissionRate(p)))
        : 10;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-[1.75rem] p-6 text-white shadow-xl shadow-slate-900/10">
                <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
                <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Zap size={18} className="text-orange-300" />
                            <span className="text-orange-200 text-sm font-bold">Mẫu demo nổi bật</span>
                        </div>
                        <h2 className="text-2xl font-black">Tất cả mẫu demo ({allProducts.length})</h2>
                        <p className="text-slate-300 text-sm mt-1">Chọn mẫu phù hợp, copy link ref và gửi cho khách đang cần tư vấn giao diện.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur px-4 py-2 rounded-2xl text-sm">
                            <Gift size={16} />
                            <span className="font-bold">Quyền lợi đến {maxRate}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm mẫu demo..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:border-orange-500 outline-none transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>Hiển thị {paginatedProducts.length} / {products.length} mẫu demo</span>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            {paginatedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                    {paginatedProducts.map(product => {
                        const rate = getCommissionRate(product);
                        const commission = product.price * rate / 100;
                        const isCopied = copiedId === product.id;

                        return (
                            <div
                                key={product.id}
                                className="bg-white rounded-[1.35rem] border border-slate-200 overflow-hidden group hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-200 transition-all duration-300 flex flex-col"
                            >
                                {/* Image */}
                                <div className="relative aspect-video overflow-hidden bg-slate-100">
                                    <Image
                                        src={product.image || '/hero_section/banner_1.webp'}
                                        alt={product.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {/* Commission Badge */}
                                    <div className={`absolute top-2 right-2 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 ${rate >= 15 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                                            rate >= 10 ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                                                'bg-slate-700'
                                        }`}>
                                        <TrendingUp size={10} />
                                        {rate}%
                                    </div>
                                    {rate >= 15 && (
                                        <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                            <Star size={8} fill="currentColor" /> HOT
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-black text-slate-950 text-base line-clamp-2 mb-3 group-hover:text-orange-600 transition-colors leading-tight">
                                        {product.name}
                                    </h3>

                                    <div className="flex items-center justify-between mb-4 py-3 px-3 bg-slate-50 rounded-xl text-sm border border-slate-100">
                                        <div>
                                            <p className="text-[10px] text-slate-400">Giá tham khảo</p>
                                            <p className="font-black text-slate-900">Liên hệ tư vấn</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400">Quyền lợi</p>
                                            <p className="font-bold text-orange-600">+{commission.toLocaleString('vi-VN')}₫</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-auto flex gap-2">
                                        <Link
                                            href={`/product/${(product as any).slug || product.id}`}
                                            className="flex-shrink-0 w-11 h-11 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center"
                                        >
                                            <Eye size={16} />
                                        </Link>
                                        <button
                                            onClick={() => handleCopy(product)}
                                            className={`flex-1 font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 text-sm ${isCopied
                                                    ? 'bg-green-500 text-white'
                                                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                                                }`}
                                        >
                                            {isCopied ? <Copy size={14} /> : <MessageCircle size={14} />}
                                            {isCopied ? 'Đã copy!' : 'Copy link'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                    <Gift size={48} className="mx-auto text-slate-200 mb-4" />
                    <h4 className="font-bold text-slate-900 mb-2">Không tìm thấy mẫu demo</h4>
                    <p className="text-slate-500 text-sm">Thử tìm kiếm với từ khóa khác</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">
                        Trang <span className="font-bold text-slate-900">{currentPage}</span> / {totalPages}
                        <span className="hidden sm:inline"> • {products.length} mẫu demo</span>
                    </p>

                    <div className="flex items-center gap-1">
                        {/* Prev Button */}
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {/* Page Numbers */}
                        {getPageNumbers().map((page, idx) => (
                            page === '...' ? (
                                <span key={`dots-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-400">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page as number)}
                                    className={`w-9 h-9 rounded-lg font-bold text-sm transition-all ${currentPage === page
                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                            : 'border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                                        }`}
                                >
                                    {page}
                                </button>
                            )
                        ))}

                        {/* Next Button */}
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignsView;
