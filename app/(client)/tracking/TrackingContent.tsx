'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Home, ChevronRight, Search, Package, Truck, CheckCircle, Loader2,
    Clock, XCircle, CreditCard, ArrowRight, Sparkles, Star, ShieldCheck,
    MapPin, Calendar, Receipt, Box, Download, AlertCircle, HelpCircle
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const TRACKING_FEATURES = [
    { icon: Search, title: 'Tra cứu nhanh', desc: 'Nhập mã và xem ngay' },
    { icon: ShieldCheck, title: 'Bảo mật', desc: 'Thông tin được mã hóa' },
    { icon: Clock, title: 'Realtime', desc: 'Cập nhật tức thì' },
];

interface OrderData {
    id: number;
    status: string;
    total: number;
    created_at: string;
    payment_method?: string;
    customer_email?: string;
    items?: { name: string; price: number; quantity: number }[];
}

export default function TrackingContent() {
    const { addToast } = useToast();
    const [orderCode, setOrderCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<OrderData | null>(null);
    const [notFound, setNotFound] = useState(false);

    // Extract order ID from input (handles "ĐON 8", "#8", "8", etc.)
    const extractOrderId = (input: string): number | null => {
        // Remove common prefixes and extract number
        const cleaned = input.replace(/[đĐ][oOơƠ][nN]\s*#?/gi, '')
            .replace(/^#/, '')
            .trim();
        const num = parseInt(cleaned, 10);
        return isNaN(num) ? null : num;
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderCode.trim()) {
            addToast('Vui lòng nhập mã đơn hàng', 'error');
            return;
        }

        const orderId = extractOrderId(orderCode);
        if (!orderId) {
            addToast('Mã đơn hàng không hợp lệ. VD: 123, #123, ĐƠN 123', 'error');
            return;
        }

        setLoading(true);
        setNotFound(false);
        setOrder(null);

        try {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            if (!supabase) return;

            // Fetch order with items
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id, status, total, created_at, payment_method, customer_email,
                    order_items (
                        quantity, price,
                        products (name)
                    )
                `)
                .eq('id', orderId)
                .single();

            if (error || !data) {
                setNotFound(true);
                addToast('Không tìm thấy đơn hàng', 'error');
            } else {
                // Transform order items
                const items = data.order_items?.map((item: any) => ({
                    name: item.products?.name || 'Sản phẩm',
                    price: item.price,
                    quantity: item.quantity
                })) || [];

                setOrder({
                    ...data,
                    items
                });
                addToast('Đã tìm thấy đơn hàng!', 'success');
            }
        } catch (error) {
            addToast('Có lỗi xảy ra khi tra cứu', 'error');
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'completed':
            case 'paid':
                return {
                    label: 'Hoàn thành',
                    color: 'emerald',
                    icon: CheckCircle,
                    bgClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    iconClass: 'text-emerald-500'
                };
            case 'pending':
                return {
                    label: 'Chờ thanh toán',
                    color: 'amber',
                    icon: Clock,
                    bgClass: 'bg-amber-100 text-amber-700 border-amber-200',
                    iconClass: 'text-amber-500'
                };
            case 'cancelled':
            case 'failed':
                return {
                    label: 'Đã hủy',
                    color: 'red',
                    icon: XCircle,
                    bgClass: 'bg-red-100 text-red-700 border-red-200',
                    iconClass: 'text-red-500'
                };
            case 'processing':
                return {
                    label: 'Đang xử lý',
                    color: 'blue',
                    icon: Loader2,
                    bgClass: 'bg-blue-100 text-blue-700 border-blue-200',
                    iconClass: 'text-blue-500'
                };
            default:
                return {
                    label: status,
                    color: 'slate',
                    icon: Package,
                    bgClass: 'bg-slate-100 text-slate-700 border-slate-200',
                    iconClass: 'text-slate-500'
                };
        }
    };

    const getTimeline = (status: string) => {
        const steps = [
            { id: 'created', label: 'Đặt hàng', icon: Receipt },
            { id: 'pending', label: 'Chờ thanh toán', icon: CreditCard },
            { id: 'paid', label: 'Đã thanh toán', icon: CheckCircle },
            { id: 'completed', label: 'Hoàn thành', icon: Download },
        ];

        const statusOrder = ['created', 'pending', 'paid', 'completed'];
        const currentIndex = status === 'completed' ? 3 : status === 'paid' ? 2 : status === 'pending' ? 1 : 0;

        return steps.map((step, idx) => ({
            ...step,
            completed: idx <= currentIndex,
            current: idx === currentIndex
        }));
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80"
                        alt="Tracking Background"
                        fill
                        className="object-cover opacity-20"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/80" />
                </div>

                {/* Decorative Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 sm:py-20 lg:py-24">
                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                        {/* Left Content */}
                        <div className="text-center lg:text-left">
                            {/* Breadcrumb */}
                            <div className="inline-flex items-center gap-2 text-sm text-slate-400 mb-6">
                                <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
                                    <Home size={14} /> Trang chủ
                                </Link>
                                <ChevronRight size={14} />
                                <span className="text-white font-semibold">Theo dõi đơn hàng</span>
                            </div>

                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 px-4 py-2 rounded-full text-sm font-bold mb-6 backdrop-blur-sm">
                                <Truck size={16} />
                                TRA CỨU ĐƠN HÀNG
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                                Theo Dõi <br className="hidden sm:block" />
                                <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Đơn Hàng</span>
                            </h1>

                            <p className="text-slate-400 text-lg sm:text-xl max-w-md mx-auto lg:mx-0 mb-8">
                                Nhập mã đơn hàng để kiểm tra trạng thái và thông tin chi tiết ngay lập tức.
                            </p>

                            {/* Search Box */}
                            <form onSubmit={handleSearch} className="relative max-w-lg mx-auto lg:mx-0">
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <Package className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                                        <input
                                            type="text"
                                            placeholder="VD: 123, #123, ĐƠN 123..."
                                            value={orderCode}
                                            onChange={e => setOrderCode(e.target.value)}
                                            className="w-full pl-14 pr-5 py-4 sm:py-5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-sm transition-all font-medium"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 sm:px-8 rounded-2xl font-bold hover:shadow-xl hover:shadow-orange-500/25 transition-all disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                                        <span className="hidden sm:inline">Tra cứu</span>
                                    </button>
                                </div>
                            </form>

                            {/* Quick Features */}
                            <div className="grid grid-cols-3 gap-4 mt-8 text-sm">
                                {TRACKING_FEATURES.map((feat, idx) => (
                                    <div key={idx} className="text-center lg:text-left">
                                        <feat.icon size={20} className="text-orange-400 mx-auto lg:mx-0 mb-2" />
                                        <p className="font-bold text-white text-xs sm:text-sm">{feat.title}</p>
                                        <p className="text-slate-500 hidden sm:block text-xs">{feat.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right - Illustration */}
                        <div className="hidden lg:block">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-2xl" />

                                <div className="relative space-y-4">
                                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 flex items-center gap-4 transform hover:translate-x-2 transition-transform">
                                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <Package size={28} className="text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg">Đơn hàng #123</h4>
                                            <p className="text-slate-400 text-sm">Hoàn thành • 299.000₫</p>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 flex items-center gap-4 transform translate-x-8 hover:translate-x-10 transition-transform">
                                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <CheckCircle size={28} className="text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg">Đã thanh toán</h4>
                                            <p className="text-slate-400 text-sm">Sẵn sàng tải xuống</p>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 flex items-center gap-4 transform hover:translate-x-2 transition-transform">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <Download size={28} className="text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg">Tải sản phẩm</h4>
                                            <p className="text-slate-400 text-sm">Truy cập ngay tức thì</p>
                                        </div>
                                    </div>
                                </div>

                                <Sparkles size={24} className="absolute -top-4 right-8 text-amber-400 animate-pulse" />
                                <Star size={18} className="absolute bottom-4 -left-4 text-orange-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
                {/* Order Result */}
                {order && (
                    <div className="space-y-6">
                        {/* Order Header */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                            <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                            <Receipt size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900">Đơn hàng #{order.id}</h2>
                                            <p className="text-slate-500 flex items-center gap-2">
                                                <Calendar size={14} />
                                                {new Date(order.created_at).toLocaleDateString('vi-VN', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-bold ${getStatusInfo(order.status).bgClass}`}>
                                        {React.createElement(getStatusInfo(order.status).icon, { size: 18 })}
                                        {getStatusInfo(order.status).label}
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="p-6 sm:p-8 border-b border-slate-100">
                                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <MapPin size={18} className="text-orange-500" />
                                    Tiến trình đơn hàng
                                </h3>
                                <div className="flex items-center justify-between relative">
                                    {/* Progress Line */}
                                    <div className="absolute left-0 right-0 top-6 h-1 bg-slate-200 rounded-full" />
                                    <div
                                        className="absolute left-0 top-6 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                                        style={{ width: `${(getTimeline(order.status).filter(s => s.completed).length - 1) / 3 * 100}%` }}
                                    />

                                    {getTimeline(order.status).map((step, idx) => (
                                        <div key={step.id} className="relative flex flex-col items-center z-10">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${step.completed
                                                    ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                                                    : 'bg-slate-100 text-slate-400'
                                                } ${step.current ? 'ring-4 ring-orange-500/30' : ''}`}>
                                                <step.icon size={20} />
                                            </div>
                                            <p className={`mt-3 text-xs sm:text-sm font-semibold text-center ${step.completed ? 'text-slate-900' : 'text-slate-400'
                                                }`}>
                                                {step.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Details */}
                            <div className="p-6 sm:p-8">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Box size={18} className="text-orange-500" />
                                    Chi tiết đơn hàng
                                </h3>

                                {/* Items */}
                                {order.items && order.items.length > 0 && (
                                    <div className="space-y-3 mb-6">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center">
                                                        <Package size={20} className="text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{item.name}</p>
                                                        <p className="text-sm text-slate-500">x{item.quantity}</p>
                                                    </div>
                                                </div>
                                                <p className="font-bold text-slate-900">{item.price.toLocaleString()}₫</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Summary */}
                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    {order.payment_method && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 flex items-center gap-2">
                                                <CreditCard size={16} />
                                                Thanh toán
                                            </span>
                                            <span className="font-semibold text-slate-900 uppercase">{order.payment_method}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                        <span className="text-lg font-bold text-slate-900">Tổng cộng</span>
                                        <span className="text-2xl font-black text-orange-600">{order.total?.toLocaleString()}₫</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        {(order.status === 'paid' || order.status === 'completed') && (
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/profile/downloads"
                                    className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-orange-500/25 transition-all"
                                >
                                    <Download size={20} />
                                    Xem Downloads
                                </Link>
                                <Link
                                    href="/profile/orders"
                                    className="flex-1 flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                                >
                                    <Receipt size={20} />
                                    Lịch sử đơn hàng
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Not Found State */}
                {notFound && !order && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-12 text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={40} className="text-red-500" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3">Không tìm thấy đơn hàng</h3>
                        <p className="text-slate-500 mb-6 max-w-md mx-auto">
                            Vui lòng kiểm tra lại mã đơn hàng. Bạn có thể tìm mã trong email xác nhận hoặc trang lịch sử đơn hàng.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => { setNotFound(false); setOrderCode(''); }}
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-orange-500/25 transition-all"
                            >
                                <Search size={20} />
                                Thử lại
                            </button>
                            <Link
                                href="/contact"
                                className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                            >
                                <HelpCircle size={20} />
                                Liên hệ hỗ trợ
                            </Link>
                        </div>
                    </div>
                )}

                {/* Empty State - No Search Yet */}
                {!order && !notFound && !loading && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-12 text-center">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search size={40} className="text-orange-500" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3">Nhập mã đơn hàng</h3>
                        <p className="text-slate-500 mb-6 max-w-md mx-auto">
                            Nhập mã đơn hàng vào ô tìm kiếm phía trên để xem trạng thái và thông tin chi tiết đơn hàng của bạn.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                            <div className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl">
                                <span className="font-bold">VD:</span> 123
                            </div>
                            <div className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl">
                                <span className="font-bold">VD:</span> #123
                            </div>
                            <div className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl">
                                <span className="font-bold">VD:</span> ĐƠN 123
                            </div>
                        </div>
                    </div>
                )}

                {/* Help Section */}
                <div className="mt-12 grid sm:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
                        <HelpCircle size={32} className="mb-4 opacity-80" />
                        <h3 className="text-xl font-black mb-2">Cần hỗ trợ?</h3>
                        <p className="text-blue-100 text-sm mb-4">Đội ngũ hỗ trợ sẵn sàng giúp đỡ bạn 24/7</p>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 bg-white text-blue-600 px-5 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all"
                        >
                            Liên hệ ngay <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 text-white shadow-xl">
                        <Receipt size={32} className="mb-4 opacity-80" />
                        <h3 className="text-xl font-black mb-2">Xem tất cả đơn hàng</h3>
                        <p className="text-slate-300 text-sm mb-4">Đăng nhập để xem lịch sử mua hàng đầy đủ</p>
                        <Link
                            href="/profile/orders"
                            className="inline-flex items-center gap-2 bg-white text-slate-800 px-5 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all"
                        >
                            Đơn hàng của tôi <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
