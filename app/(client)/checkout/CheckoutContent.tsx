'use client';

import React, { useState, useEffect, Suspense, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    CreditCard, Lock, ChevronRight, Home, ShoppingBag, User, FileCheck,
    Loader2, Check, Shield, ShieldCheck, ArrowLeft, ArrowRight, Wallet,
    Building2, CheckCircle2, Package, QrCode, Copy, Clock, RefreshCw,
    Smartphone, Timer, CheckCircle, XCircle
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useToast } from '@/context/ToastContext';
import { createPaymentQR, getSepayConfig, type QRCodeData } from '@/lib/sepay';

// Step configuration - 3 steps
const STEPS = [
    { id: 1, title: 'Thông tin', icon: User, shortTitle: 'Info' },
    { id: 2, title: 'Thanh toán', icon: CreditCard, shortTitle: 'Pay' },
    { id: 3, title: 'Xác nhận', icon: CheckCircle2, shortTitle: 'Done' },
];

// Payment methods
const PAYMENT_METHODS = [
    { id: 'sepay', name: 'QR Code - Chuyển khoản', icon: QrCode, description: 'Quét mã VietQR bằng app ngân hàng bất kỳ', color: 'blue', badge: 'Khuyên dùng' },
    { id: 'momo', name: 'Ví MoMo', icon: Wallet, description: 'Thanh toán nhanh qua ví điện tử MoMo', color: 'rose', badge: null },
    { id: 'banking', name: 'Chuyển khoản thủ công', icon: Building2, description: 'Chuyển khoản theo thông tin tài khoản', color: 'slate', badge: null },
];

function CheckoutPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { cart, totalPrice, clearCart } = useCart();
    const { user, profile } = useSupabaseAuth();
    const { addToast } = useToast();

    const safeCart = cart || [];

    // Multi-step state
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState('sepay');

    // Order & Payment state
    const [orderId, setOrderId] = useState<number | null>(null);
    const [qrData, setQrData] = useState<QRCodeData | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'checking' | 'paid' | 'expired'>('pending');
    const [countdown, setCountdown] = useState(900); // 15 minutes in seconds
    const [copied, setCopied] = useState(false);
    const [showQRPayment, setShowQRPayment] = useState(false);

    // Polling ref
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const [formData, setFormData] = useState({
        fullName: profile?.name || '',
        email: user?.email || '',
        phone: profile?.phone || '',
    });

    // Sync form data with profile
    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                fullName: profile.name || prev.fullName,
                phone: profile.phone || prev.phone
            }));
        }
        if (user) {
            setFormData(prev => ({ ...prev, email: user.email || prev.email }));
        }
    }, [profile, user]);

    // Validation for step 1
    const canProceedStep1 = useMemo(() => {
        return formData.fullName.trim().length > 0 &&
            formData.email.trim().length > 0 &&
            formData.phone.trim().length > 0;
    }, [formData]);

    // Countdown timer for QR expiration
    useEffect(() => {
        if (showQRPayment && paymentStatus === 'pending' && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        setPaymentStatus('expired');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [showQRPayment, paymentStatus, countdown]);

    // Poll for payment status
    const checkPaymentStatus = useCallback(async () => {
        if (!orderId) return;

        try {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            if (!supabase) return;

            const { data: order } = await supabase
                .from('orders')
                .select('status')
                .eq('id', orderId)
                .single();

            if (order?.status === 'paid') {
                setPaymentStatus('paid');
                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                }
                addToast('Thanh toán thành công!', 'success');
                // Navigate to success after brief delay
                setTimeout(() => {
                    clearCart();
                    router.push(`/order-success?orderId=${orderId}`);
                }, 2000);
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
        }
    }, [orderId, clearCart, router, addToast]);

    // Start polling when showing QR
    useEffect(() => {
        if (showQRPayment && orderId && paymentStatus === 'pending') {
            checkPaymentStatus();
            pollingRef.current = setInterval(checkPaymentStatus, 5000);

            return () => {
                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                }
            };
        }
    }, [showQRPayment, orderId, paymentStatus, checkPaymentStatus]);

    // Navigate to step 2
    const goToStep2 = () => {
        if (!canProceedStep1) {
            addToast('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }
        setCurrentStep(2);
    };

    // Process payment (create order and show QR if sepay)
    const handlePayment = async () => {
        if (!user) {
            addToast('Vui lòng đăng nhập để thanh toán', 'error');
            router.push('/login?redirect=/checkout');
            return;
        }
        if (safeCart.length === 0) {
            addToast('Giỏ hàng trống', 'error');
            return;
        }

        setLoading(true);
        try {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            if (!supabase) throw new Error('Supabase not initialized');

            // Create order with correct column names from schema
            const { data: order, error } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    total: totalPrice,
                    status: 'pending',
                    billing_name: formData.fullName,
                    billing_email: formData.email,
                    payment_method: selectedPayment,
                    notes: `Phone: ${formData.phone}`,
                })
                .select()
                .single();

            if (error) throw error;

            // Create order items
            const orderItems = safeCart.map((item: any) => ({
                order_id: order.id,
                product_id: item.id,
                product_name: item.name,
                product_image: item.image,
                price: item.price,
                license_type: 'Regular'
            }));

            await supabase.from('order_items').insert(orderItems);

            setOrderId(order.id);

            if (selectedPayment === 'sepay') {
                // Generate QR Code
                const qr = createPaymentQR({
                    orderId: order.id,
                    amount: totalPrice,
                    description: `DM${order.id}`
                });
                setQrData(qr);
                setCountdown(900);
                setPaymentStatus('pending');
                setShowQRPayment(true);
            } else {
                // For other payment methods, redirect to success (simulate)
                clearCart();
                addToast('Đặt hàng thành công!', 'success');
                router.push(`/order-success?orderId=${order.id}`);
            }

        } catch (error) {
            console.error('Checkout error:', error);
            addToast('Có lỗi xảy ra, vui lòng thử lại', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Format countdown
    const formatCountdown = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Copy to clipboard
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            addToast('Đã sao chép!', 'success');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            addToast('Không thể sao chép', 'error');
        }
    };

    // Refresh QR (create new order)
    const refreshQR = () => {
        setShowQRPayment(false);
        setOrderId(null);
        setQrData(null);
        setPaymentStatus('pending');
        setCountdown(900);
        handlePayment();
    };

    // Get SePay config for display
    const sepayConfig = getSepayConfig();

    // Empty cart state
    if (safeCart.length === 0 && currentStep === 1 && !showQRPayment) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center relative overflow-hidden px-4">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
                <div className="relative z-10 max-w-md w-full text-center">
                    <div className="w-28 h-28 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/10 border border-white/50 rotate-3 hover:rotate-6 transition-transform">
                        <ShoppingBag size={56} className="text-blue-600" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Giỏ hàng trống</h1>
                    <p className="text-slate-500 mb-8 text-lg">Thêm sản phẩm vào giỏ hàng để tiến hành thanh toán</p>
                    <Link href="/products" className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-blue-500/25 transition-all hover:-translate-y-1">
                        <Package size={22} /> Khám phá sản phẩm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Header with Steps */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb - Hidden on mobile */}
                    <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 pt-4 pb-2">
                        <Link href="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
                            <Home size={14} /> Home
                        </Link>
                        <ChevronRight size={14} className="text-slate-300" />
                        <Link href="/cart" className="hover:text-blue-600 transition-colors">Giỏ hàng</Link>
                        <ChevronRight size={14} className="text-slate-300" />
                        <span className="text-slate-900 font-semibold">Thanh toán</span>
                    </div>

                    {/* Step Indicator */}
                    <div className="py-4 sm:py-6">
                        <div className="flex items-center justify-between max-w-md mx-auto">
                            {STEPS.map((step, index) => {
                                const stepNum = showQRPayment ? 3 : currentStep;
                                const isCompleted = stepNum > step.id;
                                const isCurrent = stepNum === step.id || (showQRPayment && step.id === 3);
                                const StepIcon = step.icon;

                                return (
                                    <React.Fragment key={step.id}>
                                        <div className="flex flex-col items-center gap-2">
                                            <div
                                                className={`
                                                    w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300
                                                    ${isCompleted ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30' : ''}
                                                    ${isCurrent ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-110' : ''}
                                                    ${!isCompleted && !isCurrent ? 'bg-slate-100 text-slate-400' : ''}
                                                `}
                                            >
                                                {isCompleted ? <Check size={24} strokeWidth={3} /> : <StepIcon size={22} />}
                                            </div>
                                            <span className={`text-xs sm:text-sm font-bold transition-colors ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                <span className="hidden sm:inline">{step.title}</span>
                                                <span className="sm:hidden">{step.shortTitle}</span>
                                            </span>
                                        </div>

                                        {index < STEPS.length - 1 && (
                                            <div className="flex-1 h-1 mx-2 sm:mx-4 rounded-full overflow-hidden bg-slate-100">
                                                <div
                                                    className={`h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500 ${isCompleted ? 'w-full' : 'w-0'}`}
                                                />
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
                <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">
                    {/* Left Column - Form Steps */}
                    <div className="lg:col-span-7 order-2 lg:order-1">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">

                            {/* Step 1: Customer Information */}
                            {currentStep === 1 && !showQRPayment && (
                                <div className="p-6 sm:p-8">
                                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Thông tin khách hàng</h2>
                                            <p className="text-slate-500 text-sm mt-1">Điền thông tin để nhận sản phẩm</p>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="text-sm font-bold text-slate-700 block mb-2">Họ và tên <span className="text-rose-500">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="VD: Nguyễn Văn A"
                                                value={formData.fullName}
                                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                            />
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="text-sm font-bold text-slate-700 block mb-2">Email <span className="text-rose-500">*</span></label>
                                                <input
                                                    type="email"
                                                    required
                                                    placeholder="name@example.com"
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-bold text-slate-700 block mb-2">Số điện thoại <span className="text-rose-500">*</span></label>
                                                <input
                                                    type="tel"
                                                    required
                                                    placeholder="0912 xxx xxx"
                                                    value={formData.phone}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 rounded-xl p-4 flex gap-3 text-blue-800 text-sm border border-blue-100">
                                            <ShieldCheck size={20} className="flex-shrink-0 mt-0.5" />
                                            <p>Thông tin của bạn được bảo mật tuyệt đối. Giao diện website sẽ được gửi qua email sau khi thanh toán thành công.</p>
                                        </div>
                                    </div>

                                    {/* Navigation */}
                                    <div className="mt-8 flex items-center justify-between gap-4">
                                        <Link href="/cart" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors">
                                            <ArrowLeft size={18} /> Quay lại
                                        </Link>
                                        <button
                                            onClick={goToStep2}
                                            disabled={!canProceedStep1}
                                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 sm:px-8 py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                                        >
                                            Tiếp tục <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Payment Method Selection */}
                            {currentStep === 2 && !showQRPayment && (
                                <div className="p-6 sm:p-8">
                                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            <CreditCard size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Phương thức thanh toán</h2>
                                            <p className="text-slate-500 text-sm mt-1">Chọn cách bạn muốn thanh toán</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {PAYMENT_METHODS.map(method => {
                                            const isSelected = selectedPayment === method.id;
                                            const MethodIcon = method.icon;
                                            return (
                                                <button
                                                    key={method.id}
                                                    onClick={() => setSelectedPayment(method.id)}
                                                    className={`
                                                        w-full p-4 sm:p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 relative
                                                        ${isSelected
                                                            ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-500/10'
                                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                        }
                                                    `}
                                                >
                                                    {method.badge && (
                                                        <span className="absolute -top-2 right-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                                                            {method.badge}
                                                        </span>
                                                    )}
                                                    <div
                                                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0`}
                                                        style={{
                                                            backgroundColor: isSelected ? (method.color === 'blue' ? '#dbeafe' : method.color === 'rose' ? '#ffe4e6' : '#f1f5f9') : '#f1f5f9',
                                                            color: isSelected ? (method.color === 'blue' ? '#2563eb' : method.color === 'rose' ? '#e11d48' : '#475569') : '#64748b'
                                                        }}
                                                    >
                                                        <MethodIcon size={24} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-slate-900">{method.name}</h3>
                                                        <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{method.description}</p>
                                                    </div>
                                                    <div className={`
                                                        w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                                                        ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}
                                                    `}>
                                                        {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Order Summary */}
                                    <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-slate-600">Thông tin người nhận</span>
                                            <button onClick={() => setCurrentStep(1)} className="text-blue-600 text-sm font-bold hover:underline">Sửa</button>
                                        </div>
                                        <p className="font-bold text-slate-900">{formData.fullName}</p>
                                        <p className="text-sm text-slate-500">{formData.email} • {formData.phone}</p>
                                    </div>

                                    {/* Navigation */}
                                    <div className="mt-8 flex items-center justify-between gap-4">
                                        <button onClick={() => setCurrentStep(1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors">
                                            <ArrowLeft size={18} /> Quay lại
                                        </button>
                                        <button
                                            onClick={handlePayment}
                                            disabled={loading}
                                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 sm:px-8 py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" /> Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    Thanh toán {totalPrice.toLocaleString()}₫ <ArrowRight size={18} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: QR Payment (when sepay is selected) */}
                            {showQRPayment && qrData && (
                                <div className="p-6 sm:p-8">
                                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            <QrCode size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Quét mã QR để thanh toán</h2>
                                            <p className="text-slate-500 text-sm mt-1">Mã đơn hàng: <span className="font-bold text-blue-600">DM{orderId}</span></p>
                                        </div>
                                    </div>

                                    {/* Payment Status Banner */}
                                    {paymentStatus === 'paid' && (
                                        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl text-white flex items-center gap-3">
                                            <CheckCircle size={28} />
                                            <div>
                                                <p className="font-bold text-lg">Thanh toán thành công!</p>
                                                <p className="text-emerald-100 text-sm">Đang chuyển hướng đến trang xác nhận...</p>
                                            </div>
                                        </div>
                                    )}

                                    {paymentStatus === 'expired' && (
                                        <div className="mb-6 p-4 bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl text-white flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <XCircle size={28} />
                                                <div>
                                                    <p className="font-bold">Mã QR đã hết hạn</p>
                                                    <p className="text-rose-100 text-sm">Vui lòng tạo lại mã QR mới</p>
                                                </div>
                                            </div>
                                            <button onClick={refreshQR} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-bold transition-colors">
                                                <RefreshCw size={16} /> Tạo lại
                                            </button>
                                        </div>
                                    )}

                                    {paymentStatus === 'pending' && (
                                        <>
                                            {/* Timer */}
                                            <div className="mb-6 flex items-center justify-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                                <Timer size={20} className="text-amber-600" />
                                                <span className="text-amber-800 font-medium">Mã QR hết hạn sau</span>
                                                <span className="font-mono font-black text-2xl text-amber-700 bg-amber-100 px-3 py-1 rounded-lg">{formatCountdown(countdown)}</span>
                                            </div>

                                            {/* QR Code Display */}
                                            <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
                                                {/* QR Image */}
                                                <div className="flex-shrink-0 p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-lg">
                                                    <img
                                                        src={qrData.qrDataUrl}
                                                        alt="VietQR Payment Code"
                                                        className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                                                    />
                                                </div>

                                                {/* Bank Info */}
                                                <div className="flex-1 w-full space-y-4">
                                                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                                        <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                                            <Building2 size={18} /> Thông tin chuyển khoản
                                                        </h4>
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                                                <div>
                                                                    <p className="text-xs text-slate-500">Ngân hàng</p>
                                                                    <p className="font-bold text-slate-900">{sepayConfig.bankName}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                                                <div>
                                                                    <p className="text-xs text-slate-500">Số tài khoản</p>
                                                                    <p className="font-bold text-slate-900 font-mono">{sepayConfig.accountNumber}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => copyToClipboard(sepayConfig.accountNumber)}
                                                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                                                >
                                                                    <Copy size={16} className={copied ? 'text-emerald-500' : 'text-slate-400'} />
                                                                </button>
                                                            </div>
                                                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                                                <div>
                                                                    <p className="text-xs text-slate-500">Số tiền</p>
                                                                    <p className="font-black text-xl text-blue-600">{totalPrice.toLocaleString()}₫</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => copyToClipboard(totalPrice.toString())}
                                                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                                                >
                                                                    <Copy size={16} className="text-slate-400" />
                                                                </button>
                                                            </div>
                                                            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                                                                <div>
                                                                    <p className="text-xs text-amber-700">Nội dung CK (bắt buộc)</p>
                                                                    <p className="font-black text-amber-800 font-mono">DM{orderId}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => copyToClipboard(`DM${orderId}`)}
                                                                    className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
                                                                >
                                                                    <Copy size={16} className="text-amber-600" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Checking status indicator */}
                                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                        <div className="relative">
                                                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping absolute" />
                                                            <div className="w-3 h-3 bg-blue-500 rounded-full relative" />
                                                        </div>
                                                        <p className="text-sm text-slate-600">Đang chờ thanh toán... Hệ thống sẽ tự động xác nhận.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Instructions */}
                                            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                    <Smartphone size={18} /> Hướng dẫn thanh toán
                                                </h4>
                                                <ol className="space-y-2 text-sm text-slate-600">
                                                    <li className="flex gap-2"><span className="font-bold text-blue-600">1.</span> Mở ứng dụng ngân hàng có hỗ trợ VietQR</li>
                                                    <li className="flex gap-2"><span className="font-bold text-blue-600">2.</span> Chọn "Quét mã QR" và quét mã bên trên</li>
                                                    <li className="flex gap-2"><span className="font-bold text-blue-600">3.</span> Kiểm tra thông tin và xác nhận thanh toán</li>
                                                    <li className="flex gap-2"><span className="font-bold text-blue-600">4.</span> Chờ hệ thống tự động xác nhận (thường dưới 1 phút)</li>
                                                </ol>
                                            </div>
                                        </>
                                    )}

                                    {/* Navigation */}
                                    {paymentStatus !== 'paid' && (
                                        <div className="mt-8 flex items-center justify-between gap-4">
                                            <button
                                                onClick={() => {
                                                    setShowQRPayment(false);
                                                    setCurrentStep(2);
                                                }}
                                                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
                                            >
                                                <ArrowLeft size={18} /> Đổi PTTT
                                            </button>
                                            <button
                                                onClick={checkPaymentStatus}
                                                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition-colors"
                                            >
                                                <RefreshCw size={18} /> Kiểm tra thanh toán
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-5 order-1 lg:order-2">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-5 sm:p-6 lg:sticky lg:top-36">
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-5 flex items-center justify-between">
                                <span>Đơn hàng</span>
                                <span className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{safeCart.length} sản phẩm</span>
                            </h2>

                            {/* Products */}
                            <div className="space-y-3 mb-5 max-h-[200px] lg:max-h-[280px] overflow-y-auto pr-1">
                                {safeCart.map((item: any) => (
                                    <div key={item.id} className="flex gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden relative flex-shrink-0 border border-slate-100">
                                            <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h4 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">{item.name}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">{item.format}</p>
                                        </div>
                                        <div className="flex flex-col justify-center items-end flex-shrink-0">
                                            <span className="font-bold text-slate-900 text-sm">{item.price.toLocaleString()}₫</span>
                                            {item.originalPrice && item.originalPrice > item.price && (
                                                <span className="text-xs text-slate-400 line-through">{item.originalPrice.toLocaleString()}₫</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Price Summary */}
                            <div className="border-t border-slate-100 pt-5 space-y-3">
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Tạm tính</span>
                                    <span className="font-semibold">{totalPrice.toLocaleString()}₫</span>
                                </div>
                                <div className="pt-4 mt-2 border-t border-dashed border-slate-200 flex justify-between items-center">
                                    <span className="font-black text-slate-900">Tổng thanh toán</span>
                                    <span className="font-black text-2xl text-blue-600">{totalPrice.toLocaleString()}₫</span>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-6 pt-5 border-t border-slate-100">
                                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <ShieldCheck size={16} className="text-emerald-500" />
                                        <span>Bảo mật SSL</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle2 size={16} className="text-blue-500" />
                                        <span>VietQR Chuẩn</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Lock size={16} className="text-slate-400" />
                                        <span>Xác nhận tự động</span>
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

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Đang tải trang thanh toán...</p>
                </div>
            </div>
        }>
            <CheckoutPageContent />
        </Suspense>
    );
}
