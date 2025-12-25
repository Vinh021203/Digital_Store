'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    CheckCircle, Package, Download, Key, ArrowRight, Home,
    ChevronRight, Loader2, PartyPopper, Mail, Copy, Check,
    Sparkles, ShieldCheck, Clock, User, CreditCard, FileText,
    ExternalLink, Star, Gift, Zap
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { addToast } = useToast();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(true);

    const orderId = searchParams.get('orderId');

    const loadOrder = useCallback(async () => {
        if (!orderId) {
            router.push('/');
            return;
        }
        setLoading(true);
        try {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            if (!supabase) return;

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        product:product_id (name, slug, image)
                    )
                `)
                .eq('id', parseInt(orderId))
                .single();

            if (error || !data) {
                addToast('Không tìm thấy đơn hàng', 'error');
                router.push('/');
                return;
            }
            setOrder(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }, [orderId, router, addToast]);

    useEffect(() => {
        loadOrder();
        // Hide confetti after 5 seconds
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
    }, [loadOrder]);

    const handleCopyKey = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        addToast('Đã sao chép license key', 'success');
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Package size={24} className="text-emerald-600" />
                        </div>
                    </div>
                    <p className="mt-4 text-slate-600 font-medium">Đang tải đơn hàng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" />
                <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Confetti Animation */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-3 h-3 rounded-full animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 5)],
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${3 + Math.random() * 2}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-16">
                {/* Success Header */}
                <div className="text-center mb-10 sm:mb-14">
                    {/* Animated Success Icon */}
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full blur-2xl opacity-40 animate-pulse scale-150" />
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-bounce-once">
                            <CheckCircle size={48} className="text-white sm:w-14 sm:h-14" strokeWidth={2.5} />
                        </div>
                        {/* Sparkles */}
                        <Sparkles size={24} className="absolute -top-2 -right-2 text-amber-400 animate-pulse" />
                        <Sparkles size={18} className="absolute -bottom-1 -left-3 text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-3">
                        <span className="inline-flex items-center gap-2">
                            <PartyPopper className="text-amber-500 animate-wiggle" size={36} />
                            Đặt hàng thành công!
                        </span>
                    </h1>
                    <p className="text-slate-500 text-lg sm:text-xl max-w-md mx-auto">
                        Cảm ơn bạn đã tin tưởng mua sắm. Đơn hàng của bạn đã được xác nhận.
                    </p>
                </div>

                {/* Order Info Card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden mb-6">
                    {/* Order Header */}
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <p className="text-emerald-100 text-sm font-medium mb-1">Mã đơn hàng</p>
                                <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
                                    #{orderId}
                                    <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full uppercase">
                                        {order?.status === 'paid' ? 'Đã thanh toán' : order?.status === 'pending' ? 'Chờ thanh toán' : order?.status}
                                    </span>
                                </h2>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-100 text-sm">
                                <Clock size={16} />
                                <span>{order?.created_at ? formatDate(order.created_at) : '--'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Payment Info */}
                    <div className="grid sm:grid-cols-2 gap-4 p-5 sm:p-6 border-b border-slate-100">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <User size={20} className="text-slate-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Khách hàng</p>
                                <p className="font-bold text-slate-900">{order?.billing_name || 'N/A'}</p>
                                <p className="text-sm text-slate-500">{order?.billing_email || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <CreditCard size={20} className="text-slate-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Thanh toán</p>
                                <p className="font-bold text-slate-900">
                                    {order?.payment_method === 'sepay' ? 'Chuyển khoản QR' :
                                        order?.payment_method === 'momo' ? 'Ví MoMo' :
                                            order?.payment_method || 'N/A'}
                                </p>
                                <p className="text-sm text-slate-500">
                                    {order?.status === 'paid' ? 'Hoàn tất' : 'Đang xử lý'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-5 sm:p-6">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Package size={18} className="text-emerald-600" />
                            Sản phẩm đã mua ({order?.order_items?.length || 0})
                        </h3>
                        <div className="space-y-4">
                            {order?.order_items?.map((item: any) => (
                                <div key={item.id} className="flex gap-4 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden relative flex-shrink-0 border border-slate-200">
                                        <Image
                                            src={item.product?.image || item.product_image || '/placeholder.png'}
                                            alt={item.product?.name || item.product_name || 'Product'}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                                            {item.product?.name || item.product_name || 'Sản phẩm'}
                                        </h4>
                                        <p className="text-sm text-slate-500 mt-1">
                                            License: <span className="font-medium text-slate-700">{item.license_type || 'Regular'}</span>
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-emerald-600 font-black text-lg">{item.price?.toLocaleString()}₫</span>
                                        </div>
                                    </div>
                                    {item.product?.slug && (
                                        <Link
                                            href={`/products/${item.product.slug}`}
                                            className="hidden sm:flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold self-center"
                                        >
                                            Xem <ExternalLink size={14} />
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Price Summary */}
                        <div className="mt-6 pt-5 border-t border-dashed border-slate-200">
                            <div className="flex justify-between items-center mb-2 text-slate-600">
                                <span>Tạm tính</span>
                                <span className="font-semibold">{order?.total?.toLocaleString()}₫</span>
                            </div>
                            {order?.discount > 0 && (
                                <div className="flex justify-between items-center mb-2 text-emerald-600">
                                    <span>Giảm giá</span>
                                    <span className="font-semibold">-{order.discount.toLocaleString()}₫</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                                <span className="text-lg font-black text-slate-900">Tổng thanh toán</span>
                                <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                    {order?.total?.toLocaleString()}₫
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Steps Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 p-6 sm:p-8 mb-6">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <Zap size={20} />
                        </div>
                        Bước tiếp theo
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Mail size={24} className="text-amber-600" />
                            </div>
                            <h4 className="font-bold text-slate-900 mb-1">Kiểm tra Email</h4>
                            <p className="text-sm text-slate-500">Thông tin đơn hàng và hóa đơn đã được gửi qua email</p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Download size={24} className="text-emerald-600" />
                            </div>
                            <h4 className="font-bold text-slate-900 mb-1">Tải sản phẩm</h4>
                            <p className="text-sm text-slate-500">Truy cập trang Downloads trong Profile để tải về</p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Key size={24} className="text-purple-600" />
                            </div>
                            <h4 className="font-bold text-slate-900 mb-1">License Key</h4>
                            <p className="text-sm text-slate-500">Key sẽ được gửi qua email trong vài phút</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <Link
                        href="/profile/downloads"
                        className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 px-6 rounded-2xl font-bold hover:shadow-xl hover:shadow-emerald-500/25 transition-all hover:-translate-y-1 group"
                    >
                        <Download size={20} className="group-hover:animate-bounce" />
                        Đi tới Downloads
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/products"
                        className="flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-700 py-4 px-6 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all group"
                    >
                        <Package size={20} />
                        Tiếp tục mua sắm
                    </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-10 pt-8 border-t border-slate-200">
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={18} className="text-emerald-500" />
                            <span>Giao dịch an toàn</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star size={18} className="text-amber-500" />
                            <span>Chất lượng đảm bảo</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Gift size={18} className="text-purple-500" />
                            <span>Hỗ trợ 24/7</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Animations */}
            <style jsx global>{`
                @keyframes confetti {
                    0% {
                        transform: translateY(-10vh) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                .animate-confetti {
                    animation: confetti 5s ease-out forwards;
                }
                @keyframes bounce-once {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                .animate-bounce-once {
                    animation: bounce-once 0.6s ease-out;
                }
                @keyframes wiggle {
                    0%, 100% { transform: rotate(-5deg); }
                    50% { transform: rotate(5deg); }
                }
                .animate-wiggle {
                    animation: wiggle 0.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        }>
            <OrderSuccessContent />
        </Suspense>
    );
}
