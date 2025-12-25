'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Gift, Users, DollarSign, Link2, Copy, Check,
    Home, ChevronRight, ArrowRight, Loader2, Sparkles,
    TrendingUp, Wallet, Star, Shield, Zap, Target,
    Share2, BarChart3, Award, Clock
} from 'lucide-react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useToast } from '@/context/ToastContext';

function AffiliatePageContent() {
    const { user, profile } = useSupabaseAuth();
    const { addToast } = useToast();
    const [copied, setCopied] = useState(false);

    const affiliateCode = profile?.affiliate_code || 'DIGITALMART';
    const affiliateLink = typeof window !== 'undefined'
        ? `${window.location.origin}?ref=${affiliateCode}`
        : `https://digitalmart.vn?ref=${affiliateCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(affiliateLink);
        setCopied(true);
        addToast('Đã sao chép link affiliate!', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    // Stats data
    const stats = [
        { label: 'Hoa hồng', value: '20%', icon: DollarSign, color: 'from-emerald-500 to-green-600' },
        { label: 'Thời hạn cookie', value: '30 ngày', icon: Clock, color: 'from-blue-500 to-indigo-600' },
        { label: 'Thanh toán', value: 'Hàng tháng', icon: Wallet, color: 'from-purple-500 to-pink-600' },
        { label: 'Sản phẩm', value: '500+', icon: Gift, color: 'from-amber-500 to-orange-600' },
    ];

    // How it works steps
    const steps = [
        {
            icon: Link2,
            title: 'Đăng ký & Nhận link',
            desc: 'Tạo tài khoản affiliate miễn phí và nhận link giới thiệu độc quyền của bạn',
            color: 'bg-blue-500'
        },
        {
            icon: Share2,
            title: 'Chia sẻ sản phẩm',
            desc: 'Chia sẻ link với bạn bè, cộng đồng qua mạng xã hội, blog hoặc email',
            color: 'bg-purple-500'
        },
        {
            icon: Users,
            title: 'Khách hàng mua sắm',
            desc: 'Khi ai đó click vào link và mua hàng, bạn sẽ được ghi nhận hoa hồng',
            color: 'bg-emerald-500'
        },
        {
            icon: Wallet,
            title: 'Nhận tiền hoa hồng',
            desc: 'Hoa hồng được thanh toán hàng tháng qua chuyển khoản ngân hàng',
            color: 'bg-amber-500'
        },
    ];

    // Benefits
    const benefits = [
        { icon: TrendingUp, title: 'Hoa hồng cao nhất', desc: 'Lên đến 20% cho mỗi đơn hàng' },
        { icon: Clock, title: 'Cookie 30 ngày', desc: 'Theo dõi trong 30 ngày sau click' },
        { icon: BarChart3, title: 'Dashboard chi tiết', desc: 'Theo dõi hiệu quả real-time' },
        { icon: Shield, title: 'Thanh toán đúng hạn', desc: 'Thanh toán vào ngày 15 hàng tháng' },
        { icon: Award, title: 'Bonus thưởng', desc: 'Thưởng thêm cho top affiliates' },
        { icon: Zap, title: 'Hỗ trợ 24/7', desc: 'Team hỗ trợ riêng cho affiliates' },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navigation Bar */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors">
                        <Home size={18} />
                        <span className="font-medium text-sm">Về trang chủ</span>
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Link href="/" className="hover:text-orange-600">Trang chủ</Link>
                        <ChevronRight size={14} />
                        <span className="text-slate-900 font-medium">Affiliate</span>
                    </div>
                    <Link
                        href="/affiliate/dashboard"
                        className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-orange-700 transition-colors"
                    >
                        <BarChart3 size={16} />
                        Dashboard
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative bg-slate-900 overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src="https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1920&q=80"
                        alt="Affiliate Background"
                        fill
                        className="object-cover opacity-20"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/80" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
                </div>

                {/* Decorative Blobs */}
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 sm:py-20 lg:py-24">
                    <div className="max-w-3xl">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
                            <Sparkles size={16} /> CHƯƠNG TRÌNH ĐỐI TÁC
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                            Kiếm tiền cùng{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                                DigitalMart
                            </span>
                        </h1>

                        <p className="text-slate-400 text-lg sm:text-xl mb-8 leading-relaxed max-w-2xl">
                            Tham gia chương trình Affiliate và nhận hoa hồng lên đến <strong className="text-orange-400">20%</strong> cho mỗi đơn hàng thành công. Không giới hạn thu nhập!
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/affiliate/dashboard"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-orange-500/30 transition-all hover:-translate-y-1"
                            >
                                <Target size={22} />
                                Bắt đầu ngay
                                <ArrowRight size={20} />
                            </Link>
                            {user && (
                                <button
                                    onClick={handleCopy}
                                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all"
                                >
                                    {copied ? <Check size={20} /> : <Copy size={20} />}
                                    {copied ? 'Đã copy link!' : 'Copy link giới thiệu'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center hover:bg-white/15 transition-colors">
                                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                    <stat.icon size={24} className="text-white" />
                                </div>
                                <p className="text-2xl sm:text-3xl font-black text-white">{stat.value}</p>
                                <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
                {/* Affiliate Link Box */}
                {user && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 sm:p-8 mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                                <Link2 size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 text-lg">Link giới thiệu của bạn</h3>
                                <p className="text-slate-500 text-sm">Chia sẻ link này để nhận hoa hồng</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={affiliateLink}
                                readOnly
                                className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                            />
                            <button
                                onClick={handleCopy}
                                className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all ${copied
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:shadow-lg hover:shadow-orange-500/30'
                                    }`}
                            >
                                {copied ? <Check size={20} /> : <Copy size={20} />}
                                {copied ? 'Đã copy!' : 'Copy link'}
                            </button>
                        </div>
                    </div>
                )}

                {/* How it works */}
                <div className="mb-16">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
                            Cách thức <span className="text-orange-600">hoạt động</span>
                        </h2>
                        <p className="text-slate-500 max-w-xl mx-auto">
                            Chỉ 4 bước đơn giản để bắt đầu kiếm tiền với DigitalMart Affiliate
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((step, idx) => (
                            <div key={idx} className="relative bg-white rounded-2xl border border-slate-100 p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                                {/* Step Number */}
                                <div className="absolute -top-3 -left-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-sm">
                                    {idx + 1}
                                </div>
                                {/* Icon */}
                                <div className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <step.icon size={28} className="text-white" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg mb-2">{step.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>

                                {/* Arrow connector */}
                                {idx < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                                        <ChevronRight size={24} className="text-slate-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Benefits Grid */}
                <div className="mb-16">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
                            Tại sao chọn <span className="text-orange-600">chúng tôi?</span>
                        </h2>
                        <p className="text-slate-500 max-w-xl mx-auto">
                            Chương trình affiliate hấp dẫn nhất thị trường sản phẩm số
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map((benefit, idx) => (
                            <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-orange-200 hover:shadow-lg transition-all group">
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-500 transition-colors">
                                    <benefit.icon size={24} className="text-orange-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">{benefit.title}</h3>
                                <p className="text-slate-500 text-sm">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:32px_32px]" />

                    <div className="relative z-10">
                        <Gift size={48} className="mx-auto mb-4 animate-bounce" />
                        <h2 className="text-3xl sm:text-4xl font-black mb-4">
                            Sẵn sàng kiếm tiền?
                        </h2>
                        <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
                            Đăng ký ngay hôm nay và bắt đầu nhận hoa hồng từ những đơn hàng đầu tiên!
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/affiliate/dashboard"
                                className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-2xl font-bold hover:bg-orange-50 transition-colors"
                            >
                                <BarChart3 size={20} />
                                Đi tới Dashboard
                                <ArrowRight size={18} />
                            </Link>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/30 transition-colors"
                            >
                                <Home size={20} />
                                Về trang chủ
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Trust badges */}
                <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-400 text-sm">
                    <div className="flex items-center gap-2">
                        <Shield size={18} className="text-emerald-500" />
                        <span>Thanh toán đảm bảo</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Star size={18} className="text-amber-500" />
                        <span>500+ đối tác tin tưởng</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap size={18} className="text-purple-500" />
                        <span>Hỗ trợ 24/7</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AffiliatePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-600 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Đang tải...</p>
                </div>
            </div>
        }>
            <AffiliatePageContent />
        </Suspense>
    );
}
