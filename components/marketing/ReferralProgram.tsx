'use client';

import React, { useState } from 'react';
import {
    Gift, Copy, Check, Share2, Users, DollarSign, TrendingUp,
    Facebook, Twitter, Mail, MessageCircle, QrCode, ArrowRight
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface ReferralStats {
    totalReferrals: number;
    pendingRewards: number;
    totalEarned: number;
    conversionRate: number;
}

interface ReferralProgramProps {
    referralCode?: string;
    reward?: number;
    stats?: ReferralStats;
    variant?: 'full' | 'compact' | 'widget';
}

export default function ReferralProgram({
    referralCode = 'FRIEND2024',
    reward = 100000,
    stats = { totalReferrals: 12, pendingRewards: 200000, totalEarned: 500000, conversionRate: 35 },
    variant = 'full',
}: ReferralProgramProps) {
    const { addToast } = useToast();
    const [copied, setCopied] = useState(false);
    const referralLink = `https://webgiare.id.vn/ref/${referralCode}`;

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        addToast(`Đã sao chép ${label}!`, 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = (platform: string) => {
        const message = `🎁 Nhận voucher ${(reward / 1000).toFixed(0)}K khi mua hàng trên Shop Web rẻ! Dùng mã: ${referralCode} hoặc link: ${referralLink}`;
        let shareUrl = '';

        switch (platform) {
            case 'facebook':
                shareUrl = `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(message)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
                break;
            case 'messenger':
                shareUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(referralLink)}&app_id=123456789`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=Tặng bạn voucher ${(reward / 1000).toFixed(0)}K từ Shop Web rẻ&body=${encodeURIComponent(message)}`;
                break;
        }
        if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    // Widget variant - Compact for sidebar
    if (variant === 'widget') {
        return (
            <div className="bg-gradient-to-br from-purple-600 via-violet-600 to-orange-500 text-white rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
                <Gift className="mb-3" size={28} />
                <h3 className="font-black text-lg mb-1">Giới thiệu bạn bè</h3>
                <p className="text-purple-100 text-sm mb-4">Nhận {(reward / 1000).toFixed(0)}K cho mỗi đơn hàng thành công</p>
                <button
                    onClick={() => handleCopy(referralCode, 'mã giới thiệu')}
                    className="w-full bg-white text-purple-600 font-bold py-2.5 rounded-xl hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {referralCode}
                </button>
            </div>
        );
    }

    // Compact variant - Inline card
    if (variant === 'compact') {
        return (
            <div className="bg-gradient-to-r from-purple-50 to-orange-50 border border-purple-200 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-orange-500 rounded-2xl flex items-center justify-center text-white">
                    <Gift size={28} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="font-bold text-slate-900">Giới thiệu bạn bè, nhận {(reward / 1000).toFixed(0)}K</h3>
                    <p className="text-sm text-slate-600">Mã của bạn: <span className="font-bold text-purple-600">{referralCode}</span></p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleCopy(referralLink, 'link giới thiệu')}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        Copy Link
                    </button>
                    <button
                        onClick={() => handleShare('facebook')}
                        className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        <Share2 size={16} />
                    </button>
                </div>
            </div>
        );
    }

    // Full variant - Complete referral page section
    return (
        <div className="space-y-6">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-orange-500 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-300/20 rounded-full -ml-16 -mb-16" />

                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white/20 rounded-2xl">
                            <Gift size={32} />
                        </div>
                        <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">
                            💰 Kiếm thêm thu nhập
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black mb-4">
                        Giới thiệu bạn bè, nhận <span className="text-yellow-300">{(reward / 1000).toFixed(0)}K</span> mỗi đơn
                    </h2>
                    <p className="text-lg text-purple-100 mb-6">
                        Chia sẻ mã giới thiệu của bạn. Khi bạn bè mua hàng, cả hai đều nhận voucher!
                    </p>

                    {/* Referral Code Box */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6">
                        <p className="text-sm text-purple-100 mb-2">Mã giới thiệu của bạn:</p>
                        <div className="flex gap-3">
                            <div className="flex-1 bg-white rounded-xl px-4 py-3 text-purple-600 font-black text-xl tracking-wider text-center">
                                {referralCode}
                            </div>
                            <button
                                onClick={() => handleCopy(referralCode, 'mã giới thiệu')}
                                className="px-4 bg-white text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-colors flex items-center gap-2"
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Share Buttons */}
                    <div className="flex flex-wrap gap-3">
                        {[
                            { icon: Facebook, label: 'Facebook', platform: 'facebook', color: 'bg-blue-600 hover:bg-blue-700' },
                            { icon: MessageCircle, label: 'Messenger', platform: 'messenger', color: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' },
                            { icon: Twitter, label: 'Twitter', platform: 'twitter', color: 'bg-sky-500 hover:bg-sky-600' },
                            { icon: Mail, label: 'Email', platform: 'email', color: 'bg-slate-600 hover:bg-slate-700' },
                        ].map(social => (
                            <button
                                key={social.platform}
                                onClick={() => handleShare(social.platform)}
                                className={`flex items-center gap-2 px-4 py-2.5 ${social.color} text-white rounded-xl font-bold text-sm transition-colors`}
                            >
                                <social.icon size={16} />
                                {social.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: Users, label: 'Lượt giới thiệu', value: stats.totalReferrals, color: 'text-blue-600 bg-blue-100' },
                    { icon: DollarSign, label: 'Đang chờ', value: `${(stats.pendingRewards / 1000).toFixed(0)}K`, color: 'text-amber-600 bg-amber-100' },
                    { icon: Gift, label: 'Đã nhận', value: `${(stats.totalEarned / 1000).toFixed(0)}K`, color: 'text-green-600 bg-green-100' },
                    { icon: TrendingUp, label: 'Tỉ lệ chuyển đổi', value: `${stats.conversionRate}%`, color: 'text-purple-600 bg-purple-100' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-100">
                        <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                            <stat.icon size={20} />
                        </div>
                        <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        <p className="text-sm text-slate-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* How it works */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8">
                <h3 className="font-bold text-xl text-slate-900 mb-6">Cách thức hoạt động</h3>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { step: 1, title: 'Chia sẻ mã', desc: 'Gửi mã giới thiệu hoặc link cho bạn bè' },
                        { step: 2, title: 'Bạn bè mua hàng', desc: 'Họ dùng mã để được giảm giá khi mua' },
                        { step: 3, title: 'Nhận thưởng', desc: `Bạn nhận ${(reward / 1000).toFixed(0)}K khi đơn hoàn tất` },
                    ].map(item => (
                        <div key={item.step} className="flex gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-orange-500 text-white rounded-xl flex items-center justify-center font-black flex-shrink-0">
                                {item.step}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                                <p className="text-sm text-slate-600">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
