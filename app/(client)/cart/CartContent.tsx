'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ShoppingCart, Trash2, ArrowRight, Package,
    Home, ChevronRight, Loader2, Tag, ShieldCheck, CreditCard, Lock, Landmark, Wallet
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { fetchActiveProducts } from '@/lib/products';
import { useSiteMode } from '@/hooks/useSiteSettings';
import CatalogModeNotice from '@/components/common/CatalogModeNotice';

function CartPageContent() {
    // FIX: Using 'cart' instead of 'cartItems' and 'totalPrice' instead of 'getTotal'
    const { cart, removeFromCart, totalPrice, clearCart } = useCart();
    const { isCatalogMode, loading: siteModeLoading } = useSiteMode();

    // Safety check for cart
    const safeCart = cart || [];

    const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSuggestions = async () => {
            try {
                const products = await fetchActiveProducts({ limit: 4 });
                // Ensure IDs match types (string vs number) for correct filtering
                setSuggestedProducts(products.filter(p => !safeCart.some(c => c.id === p.id)).slice(0, 4));
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        loadSuggestions();
    }, []); // Removed cart dependency to prevent loop if cart changes frequently

    if (siteModeLoading || !cart) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    }

    if (isCatalogMode) {
        return (
            <CatalogModeNotice
                title="Danh sách quan tâm đang tạm tắt"
                description="Website hiện chỉ mở ở chế độ portfolio/demo tư vấn. Bạn vẫn có thể xem demo, chọn mẫu phù hợp và gửi yêu cầu để được tư vấn hướng triển khai."
            />
        );
    }

    if (safeCart.length === 0) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-l from-orange-50/50 to-transparent" />
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
                </div>

                <div className="relative z-10 max-w-lg w-full px-6 text-center">
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-orange-500/10 border border-white rotate-3 hover:rotate-6 transition-transform">
                        <ShoppingCart size={48} className="text-orange-600" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                        Danh sách quan tâm trống
                    </h1>
                    <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                        Bạn chưa chọn mẫu demo nào. Hãy khám phá kho tài nguyên chất lượng cao ngay!
                    </p>

                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl hover:shadow-orange-500/20 hover:-translate-y-1"
                    >
                        <Package size={20} />
                        Khám phá ngay
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-white to-blue-50 opacity-40" />
                <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-8">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                        <Link href="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
                            <Home size={14} /> Home
                        </Link>
                        <ChevronRight size={14} className="text-slate-300" />
                        <span className="text-slate-900 font-bold">Danh sách quan tâm</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
                        Danh sách quan tâm của bạn
                    </h1>
                    <p className="text-slate-500 text-lg flex items-center gap-2">
                        <ShieldCheck size={18} className="text-emerald-500" />
                        Xác nhận tư vấn an toàn & Bảo mật thông tin
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Cart Items List - Left Column */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-slate-900 text-lg">{safeCart.length} Mẫu demo</h2>
                            <button
                                onClick={clearCart}
                                className="text-sm font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                            >
                                <Trash2 size={14} /> Xóa tất cả
                            </button>
                        </div>

                        <div className="space-y-4">
                            {safeCart.map(item => (
                                <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex gap-5">
                                        <div className="w-28 aspect-[4/3] rounded-xl overflow-hidden relative flex-shrink-0 bg-slate-100">
                        <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                            <div>
                                                <div className="flex justify-between items-start gap-4">
                                                    <Link href={`/product/${item.slug || item.id}`} className="font-bold text-lg text-slate-900 hover:text-blue-600 line-clamp-1 transition-colors">
                                                        {item.name}
                                                    </Link>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-slate-300 hover:text-rose-500 p-1 hover:bg-rose-50 rounded-lg transition-all"
                                                        aria-label="Remove item"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{item.format}</span>
                                                    <span>•</span>
                                                    <span>{typeof item.category === 'string' ? item.category : (item.category as any)?.name}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center gap-2">
                                                    {item.originalPrice && item.originalPrice > item.price && (
                                                        <span className="text-sm text-slate-400 line-through">{item.originalPrice.toLocaleString()}₫</span>
                                                    )}
                                                    <span className="font-black text-xl text-blue-600">{item.price.toLocaleString()}₫</span>
                                                </div>
                                                <div className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                                    License: Regular
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Suggested Products (Optional) */}
                        {!loading && suggestedProducts.length > 0 && (
                            <div className="mt-12 pt-12 border-t border-slate-200">
                                <h3 className="text-xl font-bold text-slate-900 mb-6">Có thể bạn cũng thích</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {suggestedProducts.map(product => (
                                        <Link href={`/product/${product.slug}`} key={product.id} className="group">
                                            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-3 relative">
                        <Image src={product.image} alt={product.name} fill sizes="96px" className="object-cover group-hover:scale-105 transition-transform" />
                                            </div>
                                            <h4 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600">{product.name}</h4>
                                            <p className="text-sm font-bold text-slate-500">{product.price.toLocaleString()}₫</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Checkbox Summary - Right Column */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 sticky top-24">
                            <h3 className="font-black text-xl text-slate-900 mb-6">Tổng yêu cầu</h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-slate-600">
                                    <span>Tạm tính</span>
                                    <span className="font-bold">{totalPrice.toLocaleString()}₫</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Giảm giá</span>
                                    <span className="text-emerald-600 font-bold">-0₫</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Thuế (VAT)</span>
                                    <span className="text-slate-400 text-sm">Đã bao gồm</span>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <span className="font-black text-lg text-slate-900">Tổng xác nhận tư vấn</span>
                                    <span className="font-black text-2xl text-blue-600">{totalPrice.toLocaleString()}₫</span>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 group"
                            >
                                <Lock size={18} className="text-slate-400 group-hover:text-blue-200 transition-colors" />
                                Xác nhận tư vấn ngay
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <p className="text-center text-xs text-slate-400 mt-4">
                                Bằng việc xác nhận tư vấn, bạn đồng ý với <Link href="/policy/terms" className="underline hover:text-slate-600">Điều khoản dịch vụ</Link>
                            </p>

                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <p className="text-center text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">Phương thức xác nhận tư vấn</p>
                                <div className="flex items-center justify-center gap-3">
                                    <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-transform hover:-translate-y-0.5" title="Banking">
                                        <Landmark size={16} className="text-blue-600" />
                                        <span className="text-xs font-bold text-blue-700">Banking</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-transform hover:-translate-y-0.5" title="Credit Card">
                                        <CreditCard size={16} className="text-slate-700" />
                                        <span className="text-xs font-bold text-slate-700">VISA/Master</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 transition-transform hover:-translate-y-0.5" title="Momo">
                                        <Wallet size={16} className="text-rose-600" />
                                        <span className="text-xs font-bold text-rose-700">Momo</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CartPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
            <CartPageContent />
        </Suspense>
    );
}
