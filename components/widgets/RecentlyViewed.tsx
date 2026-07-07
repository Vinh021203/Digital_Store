'use client';

import React, { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, X, ChevronRight, Eye, ShoppingCart, MessageCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useSiteMode } from '@/hooks/useSiteSettings';
import type { Product } from '@/types';

const STORAGE_KEY = 'shopwebre_recently_viewed';
const MAX_ITEMS = 10;

// Hook to manage recently viewed products
export function useRecentlyViewed() {
    const [items, setItems] = useState<Product[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setItems(JSON.parse(stored));
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, []);

    const addItem = (product: Product) => {
        setItems(prev => {
            // Remove if exists, then add to front
            const filtered = prev.filter(p => p.id !== product.id);
            const updated = [product, ...filtered].slice(0, MAX_ITEMS);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const removeItem = (productId: number) => {
        setItems(prev => {
            const updated = prev.filter(p => p.id !== productId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const clearAll = () => {
        setItems([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return { items, addItem, removeItem, clearAll };
}

// Compact view for sidebar/footer
interface RecentlyViewedCompactProps {
    maxItems?: number;
}

export const RecentlyViewedCompact = memo(({ maxItems = 4 }: RecentlyViewedCompactProps) => {
    const { items } = useRecentlyViewed();
    const displayItems = items.slice(0, maxItems);

    if (displayItems.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-orange-500" />
                    Đã xem gần đây
                </h3>
                <Link href="/products" className="text-xs text-orange-600 hover:text-orange-700 font-medium">
                    Xem tất cả
                </Link>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {displayItems.map(product => (
                    <Link
                        key={product.id}
                        href={`/product/${(product as any).slug || product.id}`}
                        className="group relative aspect-square rounded-lg overflow-hidden"
                    >
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <Eye size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
});
RecentlyViewedCompact.displayName = 'RecentlyViewedCompact';

// Full section view for pages
interface RecentlyViewedSectionProps {
    title?: string;
    maxItems?: number;
    showClear?: boolean;
}

export const RecentlyViewedSection = memo(({
    title = 'Mẫu demo đã xem',
    maxItems = 6,
    showClear = true,
}: RecentlyViewedSectionProps) => {
    const { items, removeItem, clearAll } = useRecentlyViewed();
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const { isCatalogMode } = useSiteMode();
    const displayItems = items.slice(0, maxItems);

    if (displayItems.length === 0) return null;

    const handleAddToCart = (product: Product, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isCatalogMode) {
            addToast('Website đang ở chế độ tư vấn. Mình sẽ chuyển bạn sang trang liên hệ.', 'info');
            const productSlug = (product as any).slug || product.id;
            window.location.href = `/contact?product=${encodeURIComponent(String(productSlug))}`;
            return;
        }
        addToCart(product);
        addToast('Đã thêm vào danh sách quan tâm!', 'success');
    };

    return (
        <section className="py-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                        <Clock size={20} className="text-white" />
                    </div>
                    {title}
                </h2>
                {showClear && items.length > 0 && (
                    <button
                        onClick={clearAll}
                        className="text-sm text-slate-500 hover:text-red-600 font-medium transition-colors"
                    >
                        Xóa tất cả
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {displayItems.map(product => (
                    <Link
                        key={product.id}
                        href={`/product/${(product as any).slug || product.id}`}
                        className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all"
                    >
                        {/* Image */}
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            {/* Remove button */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeItem(product.id);
                                }}
                                className="absolute top-2 right-2 w-6 h-6 bg-white/80 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <X size={12} />
                            </button>
                            {/* Quick action */}
                            <button
                                onClick={(e) => handleAddToCart(product, e)}
                                className="absolute bottom-2 right-2 w-8 h-8 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                aria-label={isCatalogMode ? 'Nhận tư vấn' : 'Thêm vào danh sách quan tâm'}
                            >
                                {isCatalogMode ? <MessageCircle size={14} /> : <ShoppingCart size={14} />}
                            </button>
                        </div>

                        {/* Info */}
                        <div className="p-3">
                            <h3 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                                {product.name}
                            </h3>
                            <div className="flex items-center justify-between mt-2">
                                <span className="font-black text-orange-600">
                                    {product.price.toLocaleString('vi-VN')}₫
                                </span>
                                <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
                                    {product.format}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {items.length > maxItems && (
                <div className="text-center mt-6">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold"
                    >
                        Xem thêm {items.length - maxItems} mẫu demo
                        <ChevronRight size={16} />
                    </Link>
                </div>
            )}
        </section>
    );
});
RecentlyViewedSection.displayName = 'RecentlyViewedSection';

// Floating widget (bottom bar)
export const RecentlyViewedBar = memo(() => {
    const { items } = useRecentlyViewed();
    const [isExpanded, setIsExpanded] = useState(false);

    if (items.length === 0) return null;

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="fixed bottom-24 left-4 z-40 bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2 text-sm font-bold text-slate-700 hover:shadow-xl transition-all border border-slate-100"
            >
                <Clock size={16} className="text-orange-500" />
                <span className="hidden sm:inline">Đã xem</span>
                <span className="w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                    {items.length}
                </span>
            </button>

            {/* Expanded Panel */}
            {isExpanded && (
                <div className="fixed bottom-36 left-4 z-40 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 w-80 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900">Đã xem gần đây</h3>
                        <button onClick={() => setIsExpanded(false)} className="p-1 hover:bg-slate-100 rounded">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {items.slice(0, 5).map(product => (
                            <Link
                                key={product.id}
                                href={`/product/${(product as any).slug || product.id}`}
                                onClick={() => setIsExpanded(false)}
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
                                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm text-slate-900 truncate">{product.name}</h4>
                                    <p className="text-sm font-bold text-orange-600">{product.price.toLocaleString('vi-VN')}₫</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <Link
                        href="/products"
                        className="block text-center text-orange-600 font-bold text-sm mt-4 hover:text-orange-700"
                    >
                        Xem tất cả →
                    </Link>
                </div>
            )}
        </>
    );
});
RecentlyViewedBar.displayName = 'RecentlyViewedBar';

export default RecentlyViewedSection;
