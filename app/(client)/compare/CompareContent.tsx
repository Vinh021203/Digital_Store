'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Layers, Trash2, ShoppingCart, Star, Download, Check, X,
    Home, ChevronRight, Sparkles, Package, Zap, Award,
    ShieldCheck, Smartphone, Target, Trophy, ArrowRight, Plus, MessageCircle
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useSiteMode } from '@/hooks/useSiteSettings';
import { Product } from '@/types';

export default function ComparePage() {
    const { compareList, removeFromCompare, addToCart, clearCompare } = useCart();
    const { addToast } = useToast();
    const { isCatalogMode } = useSiteMode();

    // --- SMART ANALYSIS LOGIC ---
    const analysis = useMemo(() => {
        if (compareList.length < 2) return null;

        const sortedByPrice = [...compareList].sort((a, b) => a.price - b.price);
        const sortedByRating = [...compareList].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        const sortedByPopularity = [...compareList].sort((a, b) => ((b.students || 0) + (b.downloads_count || 0)) - ((a.students || 0) + (a.downloads_count || 0)));

        return {
            bestPrice: sortedByPrice[0],
            bestRating: sortedByRating[0],
            mostPopular: sortedByPopularity[0],
            premiumPick: sortedByPrice[sortedByPrice.length - 1]
        };
    }, [compareList]);

    const handleAddToCart = (item: any) => {
        if (isCatalogMode) {
            addToast('Website đang ở chế độ tư vấn. Mình sẽ chuyển bạn sang trang liên hệ.', 'info');
            const productSlug = item.slug || item.id;
            window.location.href = `/contact?product=${encodeURIComponent(String(productSlug))}`;
            return;
        }
        addToCart(item);
        addToast(`Đã thêm "${item.name}" vào giỏ hàng`, 'success');
    };

    if (compareList.length === 0) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-l from-blue-50/50 to-transparent" />
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
                </div>

                <div className="relative z-10 max-w-lg w-full px-6 text-center">
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/10 border border-white rotate-3 hover:rotate-6 transition-transform">
                        <Layers size={48} className="text-blue-600" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                        So sánh sản phẩm
                    </h1>
                    <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                        Chưa có sản phẩm nào trong danh sách so sánh. Thêm ít nhất 2 sản phẩm để thấy sự khác biệt.
                    </p>

                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1"
                    >
                        <Package size={20} />
                        Khám phá sản phẩm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-blue-50 opacity-40" />
                <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-8">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                        <Link href="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
                            <Home size={14} /> Home
                        </Link>
                        <ChevronRight size={14} className="text-slate-300" />
                        <span className="text-slate-900 font-bold">So sánh</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
                                So sánh tính năng
                            </h1>
                            <p className="text-slate-500 text-lg">
                                Phân tích chi tiết và tìm ra sản phẩm phù hợp nhất với nhu cầu của bạn.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm">
                                {compareList.length} / 3 Sản phẩm
                            </span>
                            <button
                                onClick={clearCompare}
                                className="px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                            >
                                <Trash2 size={16} /> Xóa tất cả
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 -mt-4 relative z-10">
                {/* --- SMART RECOMMENDATION SECTION --- */}
                {analysis && (
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Target size={80} />
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                                    <Wallet size={20} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Tiết kiệm nhất</span>
                            </div>
                            <div className="relative">
                                <h3 className="font-bold text-slate-900 line-clamp-1 mb-1">{analysis.bestPrice.name}</h3>
                                <p className="text-2xl font-black text-emerald-600">{analysis.bestPrice.price.toLocaleString()}₫</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Award size={80} />
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
                                    <Star size={20} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Được yêu thích nhất</span>
                            </div>
                            <div className="relative">
                                <h3 className="font-bold text-slate-900 line-clamp-1 mb-1">{analysis.bestRating.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-amber-500">{analysis.bestRating.rating || 5}</span>
                                    <div className="flex gap-0.5 text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} fill="currentColor" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap size={80} />
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                                    <TrendingUp size={20} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Phổ biến nhất</span>
                            </div>
                            <div className="relative">
                                <h3 className="font-bold text-slate-900 line-clamp-1 mb-1">{analysis.mostPopular.name}</h3>
                                <p className="text-lg font-bold text-slate-600">
                                    {(analysis.mostPopular.students || 0).toLocaleString()} <span className="text-sm font-medium text-slate-400">users</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- MOBILE CARD VIEW --- */}
                <div className="md:hidden">
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                        {compareList.map((item, index) => (
                            <div
                                key={item.id}
                                className="flex-shrink-0 w-[85vw] max-w-[320px] bg-white rounded-2xl border border-slate-200 shadow-lg snap-center"
                            >
                                {/* Product Header */}
                                <div className="relative p-4 border-b border-slate-100">
                                    <button
                                        onClick={() => removeFromCompare(item.id)}
                                        className="absolute top-3 right-3 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <X size={16} />
                                    </button>

                                    {analysis?.bestPrice.id === item.id && (
                                        <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                            <Wallet size={10} /> BEST PRICE
                                        </div>
                                    )}
                                    {analysis?.bestRating.id === item.id && (
                                        <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                            <Trophy size={10} /> TOP RATED
                                        </div>
                                    )}

                                    <div className="w-full aspect-[16/10] relative rounded-xl overflow-hidden mb-3 mt-6">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <Link href={`/product/${item.slug || item.id}`} className="block text-lg font-bold text-slate-900 hover:text-blue-600 line-clamp-2 min-h-[48px]">
                                        {item.name}
                                    </Link>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-2xl font-black text-blue-600">{item.price.toLocaleString()}₫</span>
                                        {item.originalPrice && (
                                            <span className="text-sm text-slate-400 line-through">{item.originalPrice.toLocaleString()}₫</span>
                                        )}
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-500">Rating</span>
                                        <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                            <span className="font-bold text-amber-700">{item.rating || 5}</span>
                                            <Star size={14} className="fill-amber-500 text-amber-500" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-500">Thể loại</span>
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold">
                                            {typeof item.category === 'string' ? item.category : (item.category as any)?.name || 'Resource'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-500">Responsive</span>
                                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-500">Công nghệ</span>
                                        <div className="flex gap-1">
                                            {['React', 'Tailwind'].map(tech => (
                                                <span key={tech} className="text-[10px] font-bold border border-slate-200 px-2 py-0.5 rounded text-slate-500">{tech}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-500">Cập nhật</span>
                                        <span className="text-sm font-medium text-emerald-600">Miễn phí trọn đời</span>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="p-4 pt-0">
                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-all"
                                    >
                                        {isCatalogMode ? <MessageCircle size={18} /> : <ShoppingCart size={18} />}
                                        {isCatalogMode ? 'Nhận tư vấn' : 'Thêm vào giỏ'}
                                    </button>
                                </div>

                                {/* Card Index */}
                                <div className="text-center pb-3">
                                    <span className="text-xs text-slate-400">{index + 1} / {compareList.length}</span>
                                </div>
                            </div>
                        ))}

                        {/* Add More Card */}
                        {compareList.length < 3 && (
                            <Link
                                href="/products"
                                className="flex-shrink-0 w-[85vw] max-w-[320px] bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 min-h-[400px] snap-center hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                            >
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                    <Plus size={32} className="text-slate-400" />
                                </div>
                                <span className="text-slate-500 font-bold">Thêm sản phẩm</span>
                            </Link>
                        )}
                    </div>

                    {/* Scroll Hint */}
                    <p className="text-center text-xs text-slate-400 mt-2">← Vuốt để xem thêm →</p>
                </div>

                {/* --- DESKTOP COMPARISON TABLE --- */}
                <div className="hidden md:block bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="p-4 md:p-6 text-left w-24 md:w-64 bg-slate-50 sticky left-0 z-20 border-r border-slate-100 hidden md:table-cell">
                                        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Sản phẩm</div>
                                    </th>
                                    {compareList.map(item => (
                                        <th key={item.id} className="p-4 md:p-6 w-56 md:w-80 align-top relative group">
                                            {analysis?.bestPrice.id === item.id && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg z-10 flex items-center gap-1">
                                                    <Wallet size={10} /> BEST PRICE
                                                </div>
                                            )}
                                            {analysis?.bestRating.id === item.id && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg z-10 flex items-center gap-1">
                                                    <Trophy size={10} /> TOP RATED
                                                </div>
                                            )}

                                            <button
                                                onClick={() => removeFromCompare(item.id)}
                                                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <X size={16} />
                                            </button>

                                            <div className="w-full aspect-[4/3] relative rounded-2xl overflow-hidden mb-4 border border-slate-100 group-hover:shadow-lg transition-all">
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            </div>
                                            <Link href={`/product/${item.slug || item.id}`} className="block text-lg font-bold text-slate-900 hover:text-blue-600 mb-2 line-clamp-2 min-h-[56px]">
                                                {item.name}
                                            </Link>
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-2xl font-black text-blue-600">{item.price.toLocaleString()}₫</span>
                                                {item.originalPrice && (
                                                    <span className="text-sm text-slate-400 line-through Decoration-rose-500">{item.originalPrice.toLocaleString()}₫</span>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                    {compareList.length < 3 && (
                                        <th className="p-6 w-80 align-middle">
                                            <Link href="/products" className="block w-full h-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center gap-4 group">
                                                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Plus size={32} className="text-slate-300 group-hover:text-blue-500" />
                                                </div>
                                                <span className="text-slate-500 font-bold group-hover:text-blue-600">Thêm sản phẩm</span>
                                            </Link>
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {/* -- Overview -- */}
                                <tr className="bg-slate-50/50">
                                    <td colSpan={compareList.length + 2} className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest sticky left-0">
                                        Tổng quan
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-4 md:p-6 font-bold text-slate-700 sticky left-0 bg-white border-r border-slate-100 hidden md:table-cell">Rating</td>
                                    {compareList.map(item => (
                                        <td key={item.id} className="p-4 md:p-6 text-center">
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1 md:hidden">Rating</span>
                                            <div className="flex flex-col items-center gap-1 md:gap-2">
                                                <div className="flex items-center justify-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                                    <span className="font-bold text-amber-700">{item.rating || 5}</span>
                                                    <Star size={14} className="fill-amber-500 text-amber-500" />
                                                </div>
                                                <span className="text-xs text-slate-400">{Math.floor(Math.random() * 500) + 50} đánh giá</span>
                                            </div>
                                        </td>
                                    ))}
                                    {compareList.length < 3 && <td></td>}
                                </tr>
                                <tr>
                                    <td className="p-4 md:p-6 font-bold text-slate-700 sticky left-0 bg-white border-r border-slate-100 hidden md:table-cell">Thể loại</td>
                                    {compareList.map(item => (
                                        <td key={item.id} className="p-4 md:p-6 text-center">
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1 md:hidden">Thể loại</span>
                                            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold">
                                                {typeof item.category === 'string' ? item.category : (item.category as any)?.name || 'Resource'}
                                            </span>
                                        </td>
                                    ))}
                                    {compareList.length < 3 && <td></td>}
                                </tr>

                                {/* -- Details -- */}
                                <tr className="bg-slate-50/50">
                                    <td colSpan={compareList.length + 2} className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest sticky left-0">
                                        Chi tiết kỹ thuật
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-4 md:p-6 font-bold text-slate-700 sticky left-0 bg-white border-r border-slate-100 hidden md:table-cell">Responsive</td>
                                    {compareList.map(item => (
                                        <td key={item.id} className="p-4 md:p-6 text-center">
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1 md:hidden">Responsive</span>
                                            <div className="flex justify-center">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                    <Check size={16} strokeWidth={3} />
                                                </div>
                                            </div>
                                        </td>
                                    ))}
                                    {compareList.length < 3 && <td></td>}
                                </tr>
                                <tr>
                                    <td className="p-4 md:p-6 font-bold text-slate-700 sticky left-0 bg-white border-r border-slate-100 hidden md:table-cell">Công nghệ</td>
                                    {compareList.map(item => (
                                        <td key={item.id} className="p-4 md:p-6 text-center">
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1 md:hidden">Công nghệ</span>
                                            <div className="flex flex-wrap justify-center gap-1">
                                                {['React', 'Tailwind'].map(tech => (
                                                    <span key={tech} className="text-[10px] font-bold border border-slate-200 px-2 py-0.5 rounded text-slate-500">{tech}</span>
                                                ))}
                                            </div>
                                        </td>
                                    ))}
                                    {compareList.length < 3 && <td></td>}
                                </tr>
                                <tr>
                                    <td className="p-4 md:p-6 font-bold text-slate-700 sticky left-0 bg-white border-r border-slate-100 hidden md:table-cell">Cập nhật</td>
                                    {compareList.map(item => (
                                        <td key={item.id} className="p-4 md:p-6 text-center">
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1 md:hidden">Cập nhật</span>
                                            <span className="text-sm font-medium text-slate-600">Miễn phí trọn đời</span>
                                        </td>
                                    ))}
                                    {compareList.length < 3 && <td></td>}
                                </tr>

                                {/* -- Actions -- */}
                                <tr className="bg-slate-50">
                                    <td className="p-4 md:p-6 sticky left-0 bg-slate-50 border-r border-slate-100 hidden md:table-cell"></td>
                                    {compareList.map(item => (
                                        <td key={item.id} className="p-6">
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 hover:shadow-blue-200"
                                            >
                                                {isCatalogMode ? <MessageCircle size={18} /> : <ShoppingCart size={18} />}
                                                {isCatalogMode ? 'Nhận tư vấn' : 'Thêm vào giỏ'}
                                            </button>
                                        </td>
                                    ))}
                                    {compareList.length < 3 && <td></td>}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Legend / Info */}
            <div className="max-w-7xl mx-auto px-4 mt-8">
                <div className="flex items-center gap-6 text-sm text-slate-500 justify-center">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span>Giá tốt nhất</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span>Rating cao nhất</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={14} />
                        <span>Tư vấn rõ ràng</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
// Helper Icons for Stats
import { Wallet as WalletIcon, TrendingUp as TrendingUpIcon } from 'lucide-react';
const Wallet = ({ size, className }: { size?: number, className?: string }) => <WalletIcon size={size} className={className} />;
const TrendingUp = ({ size, className }: { size?: number, className?: string }) => <TrendingUpIcon size={size} className={className} />;

