'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Gift, BarChart3, ArrowRight, Loader2, Clock, DollarSign, Wallet, Home, ChevronRight, Users, Sparkles, Link2, Share2 } from 'lucide-react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';

export default function ProfileAffiliatePage() {
    const router = useRouter();
    const { user, profile, loading } = useSupabaseAuth();

    // If user is already an affiliate, redirect to dashboard
    useEffect(() => {
        if (!loading && user && profile?.is_affiliate) {
            router.push('/affiliate/dashboard');
        }
    }, [loading, user, profile, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-600 mx-auto mb-4" />
                    <p className="text-slate-500">Đang tải...</p>
                </div>
            </div>
        );
    }

    // If user is an affiliate, show redirect message (will auto redirect)
    if (profile?.is_affiliate) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-600 mx-auto mb-4" />
                    <p className="text-slate-500">Đang chuyển đến Dashboard...</p>
                </div>
            </div>
        );
    }

    // Show affiliate program info for non-affiliates
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navigation */}
            <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors">
                        <Home size={18} />
                        <span className="font-medium text-sm">Về trang chủ</span>
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Link href="/" className="hover:text-orange-600">Trang chủ</Link>
                        <ChevronRight size={14} />
                        <Link href="/profile" className="hover:text-orange-600">Profile</Link>
                        <ChevronRight size={14} />
                        <span className="text-slate-900 font-medium">Affiliate</span>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white py-16 sm:py-20">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Gift size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
                        Chương trình <span className="text-violet-200">Affiliate</span>
                    </h1>
                    <p className="text-violet-100 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
                        Kiếm hoa hồng lên đến <strong className="text-white">20%</strong> cho mỗi đơn hàng từ người bạn giới thiệu
                    </p>
                    <Link
                        href="/affiliate"
                        className="inline-flex items-center gap-2 bg-white text-violet-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-violet-50 transition-colors shadow-xl"
                    >
                        <Sparkles size={22} />
                        Tìm hiểu thêm
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </div>

            {/* Benefits */}
            <div className="max-w-5xl mx-auto px-4 py-16">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 text-center mb-10">
                    Lợi ích khi tham gia
                </h2>
                <div className="grid sm:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center hover:shadow-lg transition-shadow">
                        <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <DollarSign size={28} className="text-violet-600" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">20% Hoa hồng</h3>
                        <p className="text-sm text-slate-500">Cho mỗi đơn hàng thành công từ link của bạn</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center hover:shadow-lg transition-shadow">
                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Clock size={28} className="text-blue-600" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">30 ngày Cookie</h3>
                        <p className="text-sm text-slate-500">Theo dõi referral trong 30 ngày sau click</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center hover:shadow-lg transition-shadow">
                        <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Wallet size={28} className="text-green-600" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Rút tiền dễ dàng</h3>
                        <p className="text-sm text-slate-500">Tối thiểu 500.000₫, thanh toán hàng tháng</p>
                    </div>
                </div>
            </div>

            {/* How it works */}
            <div className="bg-white py-16 border-y border-slate-100">
                <div className="max-w-5xl mx-auto px-4">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 text-center mb-10">
                        Cách thức hoạt động
                    </h2>
                    <div className="grid sm:grid-cols-4 gap-6">
                        {[
                            { step: 1, icon: Sparkles, title: 'Đăng ký', desc: 'Tạo tài khoản affiliate miễn phí' },
                            { step: 2, icon: Link2, title: 'Nhận link', desc: 'Lấy link giới thiệu độc quyền của bạn' },
                            { step: 3, icon: Share2, title: 'Chia sẻ', desc: 'Chia sẻ link với bạn bè, cộng đồng' },
                            { step: 4, icon: Wallet, title: 'Nhận tiền', desc: 'Nhận 20% hoa hồng mỗi đơn hàng' },
                        ].map(item => (
                            <div key={item.step} className="text-center relative">
                                <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                                    <item.icon size={28} className="text-violet-600" />
                                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        {item.step}
                                    </span>
                                </div>
                                <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                                <p className="text-sm text-slate-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="max-w-5xl mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
                    Sẵn sàng kiếm tiền?
                </h2>
                <p className="text-slate-500 mb-8 max-w-xl mx-auto">
                    Đến trang giới thiệu chương trình để đăng ký và bắt đầu ngay hôm nay!
                </p>
                <Link
                    href="/affiliate"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-violet-500/30 transition-all hover:-translate-y-1"
                >
                    <Gift size={22} />
                    Tham gia Affiliate
                    <ArrowRight size={20} />
                </Link>
            </div>
        </div>
    );
}
