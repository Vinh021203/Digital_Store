'use client';

import React, { useState, useEffect, Suspense, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    CreditCard, Lock, ChevronRight, Home, ShoppingBag, User, FileCheck,
    Loader2, Check, Shield, ShieldCheck, ArrowLeft, ArrowRight, Wallet,
    Building2, CheckCircle2, Package, QrCode, Copy, Clock, RefreshCw,
    Smartphone, Timer, CheckCircle, XCircle, Tag, Sparkles, ReceiptText,
    BadgeCheck, Landmark, Mail, Phone, KeyRound
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useToast } from '@/context/ToastContext';
import { createPaymentQR, getSepayConfig, type QRCodeData } from '@/lib/sepay';
import { validateCouponForUser } from '@/lib/coupons';
import { useSiteMode } from '@/hooks/useSiteSettings';
import CatalogModeNotice from '@/components/common/CatalogModeNotice';

// Step configuration - 3 steps
const STEPS = [
    { id: 1, title: 'Thông tin', icon: User, shortTitle: 'Info' },
    { id: 2, title: 'Xác nhận tư vấn', icon: CreditCard, shortTitle: 'Pay' },
    { id: 3, title: 'Xác nhận', icon: CheckCircle2, shortTitle: 'Done' },
];

// Payment methods
const PAYMENT_METHODS = [
    { id: 'sepay', name: 'VietQR tự động', brand: 'VietQR', icon: QrCode, description: 'Quét mã bằng app ngân hàng, hệ thống tự xác nhận.', color: 'blue', badge: 'Khuyên dùng' },
    { id: 'momo', name: 'Ví MoMo', brand: 'MoMo', icon: Wallet, description: 'Xác nhận tư vấn qua ví điện tử, đang chuẩn bị tích hợp.', color: 'rose', badge: 'Sắp có' },
    { id: 'banking', name: 'Chuyển khoản thủ công', brand: 'BANK', icon: Building2, description: 'Chuyển khoản theo thông tin tài khoản và chờ đối soát.', color: 'slate', badge: null },
];

const PaymentBrand = ({ brand, active }: { brand: string; active: boolean }) => {
    const brandStyle: Record<string, string> = {
        VietQR: active ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700',
        MoMo: active ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-700',
        BANK: active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700',
    };

    return (
        <span className={`inline-flex h-9 min-w-16 items-center justify-center rounded-xl px-3 text-xs font-black tracking-wide ${brandStyle[brand] || brandStyle.BANK}`}>
            {brand}
        </span>
    );
};

function CheckoutPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { cart, totalPrice, clearCart } = useCart();
    const { user, profile } = useSupabaseAuth();
    const { addToast } = useToast();
    const { isCatalogMode, loading: siteModeLoading } = useSiteMode();

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
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ id: number; code: string; discount: number } | null>(null);
    const [applyingCoupon, setApplyingCoupon] = useState(false);

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

    const productIds = useMemo(() => safeCart.map((item: any) => Number(item.id)).filter(Boolean), [safeCart]);
    const discountAmount = appliedCoupon?.discount || 0;
    const payableTotal = Math.max(totalPrice - discountAmount, 0);

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
                addToast('Xác nhận tư vấn thành công!', 'success');
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

    const applyCoupon = async () => {
        const code = couponCode.trim().toUpperCase();
        if (!code) {
            addToast('Vui lòng nhập mã ưu đãi tham khảo', 'warning');
            return;
        }

        setApplyingCoupon(true);
        try {
            const result = await validateCouponForUser(code, totalPrice, user?.id, productIds);
            if (!result.valid || !result.couponId) {
                setAppliedCoupon(null);
                addToast(result.error || 'Mã ưu đãi tham khảo không hợp lệ', 'error');
                return;
            }

            setCouponCode(code);
            setAppliedCoupon({ id: result.couponId, code, discount: result.discount });
            addToast(`Đã áp dụng mã ${code}`, 'success');
        } catch (error) {
            console.error('Apply coupon error:', error);
            addToast('Không thể kiểm tra mã ưu đãi tham khảo', 'error');
        } finally {
            setApplyingCoupon(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        addToast('Đã bỏ mã ưu đãi tham khảo', 'info');
    };

    // Process payment (create order and show QR if sepay)
    const handlePayment = async () => {
        if (!user) {
            addToast('Vui lòng đăng nhập để xác nhận tư vấn', 'error');
            router.push('/login?redirect=/checkout');
            return;
        }
        if (safeCart.length === 0) {
            addToast('Danh sách quan tâm trống', 'error');
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
                    total: payableTotal,
                    discount: discountAmount,
                    coupon_id: appliedCoupon?.id || null,
                    coupon_code: appliedCoupon?.code || null,
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
                    amount: payableTotal,
                    description: `DM${order.id}`
                });
                setQrData(qr);
                setCountdown(900);
                setPaymentStatus('pending');
                setShowQRPayment(true);
            } else {
                // For other payment methods, redirect to success (simulate)
                clearCart();
                addToast('Yêu cầu tư vấn đã được ghi nhận!', 'success');
                router.push(`/order-success?orderId=${order.id}`);
            }

        } catch (error) {
            console.error('Yêu cầu tư vấn error:', error);
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

    if (siteModeLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (isCatalogMode) {
        return (
            <CatalogModeNotice
                title="Yêu cầu tư vấn đang tạm dừng"
                description="Web Giá Rẻ - Portfolio đang ở chế độ portfolio/demo tư vấn nên chưa nhận xác nhận trực tiếp. Hãy gửi nhu cầu, mẫu quan tâm và ngân sách để được tư vấn trước."
            />
        );
    }

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
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Danh sách quan tâm trống</h1>
                    <p className="text-slate-500 mb-8 text-lg">Thêm mẫu demo vào danh sách quan tâm để tiến hành xác nhận tư vấn</p>
                    <Link href="/products" className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-blue-500/25 transition-all hover:-translate-y-1">
                        <Package size={22} /> Khám phá mẫu demo
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
                        <Link href="/cart" className="hover:text-blue-600 transition-colors">Danh sách quan tâm</Link>
                        <ChevronRight size={14} className="text-slate-300" />
                        <span className="text-slate-900 font-semibold">Xác nhận tư vấn</span>
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
                                            <p className="text-slate-500 text-sm mt-1">Điền thông tin để nhận mẫu demo</p>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700"><User size={15} className="text-orange-600" /> Họ và tên <span className="text-rose-500">*</span></label>
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
                                                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700"><Mail size={15} className="text-orange-600" /> Email <span className="text-rose-500">*</span></label>
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
                                                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700"><Phone size={15} className="text-orange-600" /> Số điện thoại <span className="text-rose-500">*</span></label>
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
                                            <p>Thông tin của bạn được bảo mật tuyệt đối. Giao diện website sẽ được gửi qua email sau khi xác nhận tư vấn thành công.</p>
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
                                            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Phương thức xác nhận tư vấn</h2>
                                            <p className="text-slate-500 text-sm mt-1">Chọn cách bạn muốn xác nhận tư vấn</p>
                                        </div>
                                    </div>

                                    <div className="mb-5 grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:grid-cols-3">
                                        {[
                                            { icon: ShieldCheck, label: 'SSL bảo mật' },
                                            { icon: BadgeCheck, label: 'VietQR chuẩn' },
                                            { icon: KeyRound, label: 'Cấp license tự động' },
                                        ].map((item) => (
                                            <div key={item.label} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm">
                                                <item.icon size={16} className="text-orange-600" />
                                                {item.label}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        {PAYMENT_METHODS.map(method => {
                                            const isSelected = selectedPayment === method.id;
                                            const MethodIcon = method.icon;
                                            const isDisabled = method.id !== 'sepay';
                                            return (
                                                <button
                                                    key={method.id}
                                                    onClick={() => {
                                                        if (isDisabled) {
                                                            addToast('Phương thức này đang được hoàn thiện, vui lòng dùng VietQR tự động.', 'info');
                                                            return;
                                                        }
                                                        setSelectedPayment(method.id);
                                                    }}
                                                    className={`
                                                        w-full p-4 sm:p-5 rounded-2xl border text-left transition-all flex items-center gap-4 relative overflow-hidden
                                                        ${isSelected
                                                            ? 'border-orange-300 bg-orange-50/60 shadow-lg shadow-orange-500/10'
                                                            : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/30'
                                                        }
                                                        ${isDisabled ? 'opacity-75' : ''}
                                                    `}
                                                >
                                                    {method.badge && (
                                                        <span className={`absolute right-4 top-3 rounded-full px-3 py-1 text-[11px] font-black shadow ${isDisabled ? 'bg-slate-100 text-slate-500' : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'}`}>
                                                            {method.badge}
                                                        </span>
                                                    )}
                                                    <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-2xl border border-white bg-white shadow-sm">
                                                        <PaymentBrand brand={method.brand} active={isSelected} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 pr-16">
                                                            <MethodIcon size={18} className={isSelected ? 'text-orange-600' : 'text-slate-500'} />
                                                            <h3 className="font-black text-slate-900">{method.name}</h3>
                                                        </div>
                                                        <p className="mt-1 text-sm font-medium text-slate-500">{method.description}</p>
                                                    </div>
                                                    <div className={`
                                                        w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                                                        ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-slate-300'}
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
                                                    Xác nhận tư vấn {payableTotal.toLocaleString()}₫ <ArrowRight size={18} />
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
                                            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Quét mã QR để xác nhận tư vấn</h2>
                                            <p className="text-slate-500 text-sm mt-1">Mã yêu cầu: <span className="font-bold text-blue-600">DM{orderId}</span></p>
                                        </div>
                                    </div>

                                    {/* Payment Status Banner */}
                                    {paymentStatus === 'paid' && (
                                        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl text-white flex items-center gap-3">
                                            <CheckCircle size={28} />
                                            <div>
                                                <p className="font-bold text-lg">Xác nhận tư vấn thành công!</p>
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
                                            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
                                                {/* QR Image */}
                                                <div className="rounded-3xl border border-blue-100 bg-gradient-to-b from-blue-50 to-white p-4 text-center shadow-xl shadow-blue-100/70">
                                                    <div className="mb-3 flex items-center justify-center gap-2">
                                                        <PaymentBrand brand="VietQR" active />
                                                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Tự xác nhận</span>
                                                    </div>
                                                    <div className="mx-auto rounded-2xl border-2 border-white bg-white p-3 shadow-inner">
                                                        <img
                                                            src={qrData.qrDataUrl}
                                                            alt="VietQR Payment Code"
                                                            className="mx-auto h-56 w-56 object-contain sm:h-64 sm:w-64"
                                                        />
                                                    </div>
                                                    <p className="mt-3 text-xs font-bold text-slate-500">Quét đúng mã này để hệ thống tự khớp đơn.</p>
                                                </div>

                                                {/* Bank Info */}
                                                <div className="flex-1 w-full space-y-4">
                                                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-100">
                                                        <h4 className="font-black text-slate-900 mb-3 flex items-center gap-2">
                                                            <Landmark size={18} className="text-orange-600" /> Thông tin chuyển khoản
                                                        </h4>
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                                <div>
                                                                    <p className="text-xs text-slate-500">Ngân hàng</p>
                                                                    <p className="font-bold text-slate-900">{sepayConfig.bankName}</p>
                                                                </div>
                                                                <PaymentBrand brand="BANK" active={false} />
                                                            </div>
                                                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
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
                                                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                                                                <div>
                                                                    <p className="text-xs text-slate-500">Số tiền</p>
                                                                    <p className="font-black text-xl text-blue-600">{payableTotal.toLocaleString()}₫</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => copyToClipboard(payableTotal.toString())}
                                                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                                                >
                                                                    <Copy size={16} className="text-slate-400" />
                                                                </button>
                                                            </div>
                                                            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-100">
                                                                <div>
                                                                    <p className="text-xs text-orange-700">Nội dung CK (bắt buộc)</p>
                                                                    <p className="font-black text-orange-800 font-mono">DM{orderId}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => copyToClipboard(`DM${orderId}`)}
                                                                    className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
                                                                >
                                                                    <Copy size={16} className="text-orange-600" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Checking status indicator */}
                                                    <div className="flex items-center gap-3 p-4 bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-xl shadow-slate-200">
                                                        <div className="relative">
                                                            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping absolute" />
                                                            <div className="w-3 h-3 bg-emerald-400 rounded-full relative" />
                                                        </div>
                                                        <p className="text-sm text-slate-200">Đang chờ xác nhận tư vấn... Hệ thống sẽ tự động xác nhận sau khi tiền vào.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Instructions */}
                                            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                    <Smartphone size={18} /> Hướng dẫn xác nhận tư vấn
                                                </h4>
                                                <ol className="space-y-2 text-sm text-slate-600">
                                                    <li className="flex gap-2"><span className="font-bold text-blue-600">1.</span> Mở ứng dụng ngân hàng có hỗ trợ VietQR</li>
                                                    <li className="flex gap-2"><span className="font-bold text-blue-600">2.</span> Chọn "Quét mã QR" và quét mã bên trên</li>
                                                    <li className="flex gap-2"><span className="font-bold text-blue-600">3.</span> Kiểm tra thông tin và xác nhận xác nhận tư vấn</li>
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
                                                <RefreshCw size={18} /> Kiểm tra xác nhận tư vấn
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-5 order-1 lg:order-2">
                        <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-2xl shadow-orange-100/60 lg:sticky lg:top-36">
                            <div className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-white p-5 sm:p-6">
                                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-200">
                                        <ReceiptText size={20} />
                                    </span>
                                    Yêu cầu
                                </span>
                                <span className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{safeCart.length} mẫu demo</span>
                                </h2>
                                <p className="mt-3 text-sm font-medium text-slate-500">Kiểm tra mẫu demo, áp mã ưu đãi và hoàn tất xác nhận tư vấn.</p>
                            </div>

                            <div className="p-5 sm:p-6">

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

                            {/* Coupon */}
                            <div className="mb-5 rounded-2xl border border-orange-100 bg-orange-50/50 p-3 sm:p-4">
                                <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-900">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
                                        <Tag size={16} />
                                    </span>
                                    Mã ưu đãi tham khảo
                                </div>

                                {appliedCoupon ? (
                                    <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-white p-3">
                                        <div className="min-w-0">
                                            <p className="flex items-center gap-1.5 text-sm font-black text-emerald-700">
                                                <Sparkles size={15} /> {appliedCoupon.code}
                                            </p>
                                            <p className="mt-0.5 text-xs font-semibold text-slate-500">
                                                Đã giảm {appliedCoupon.discount.toLocaleString('vi-VN')}₫
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeCoupon}
                                            className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                        >
                                            Bỏ mã
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            value={couponCode}
                                            onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') {
                                                    event.preventDefault();
                                                    applyCoupon();
                                                }
                                            }}
                                            placeholder="Nhập mã ưu đãi"
                                            className="min-w-0 flex-1 rounded-xl border border-orange-100 bg-white px-3 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                                        />
                                        <button
                                            type="button"
                                            onClick={applyCoupon}
                                            disabled={applyingCoupon}
                                            className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {applyingCoupon ? <Loader2 size={17} className="animate-spin" /> : 'Áp dụng'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Price Summary */}
                            <div className="border-t border-slate-100 pt-5 space-y-3">
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Tạm tính</span>
                                    <span className="font-semibold">{totalPrice.toLocaleString()}₫</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-600">
                                        <span>Giảm giá</span>
                                        <span className="font-bold">-{discountAmount.toLocaleString('vi-VN')}₫</span>
                                    </div>
                                )}
                                <div className="pt-4 mt-2 border-t border-dashed border-slate-200 flex justify-between items-center">
                                    <span className="font-black text-slate-900">Tổng xác nhận tư vấn</span>
                                    <span className="font-black text-2xl text-blue-600">{payableTotal.toLocaleString()}₫</span>
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
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Đang tải trang xác nhận tư vấn...</p>
                </div>
            </div>
        }>
            <CheckoutPageContent />
        </Suspense>
    );
}
