'use client';

import React from 'react';
import { Shield, Clock, RefreshCw, Headphones, Award, Lock, Zap } from 'lucide-react';

interface TrustBadgesProps {
    variant?: 'horizontal' | 'grid';
    className?: string;
}

const BADGES = [
    { icon: Shield, label: 'Bảo mật SSL', color: 'text-green-600 bg-green-100' },
    { icon: Clock, label: 'Hoàn tiền 7 ngày', color: 'text-blue-600 bg-blue-100' },
    { icon: RefreshCw, label: 'Cập nhật miễn phí', color: 'text-purple-600 bg-purple-100' },
    { icon: Headphones, label: '6 tháng hỗ trợ', color: 'text-orange-600 bg-orange-100' },
];

const EXTENDED_BADGES = [
    { icon: Shield, label: 'Bảo mật SSL', desc: 'Thông tin được bảo vệ', color: 'text-green-600 bg-green-100' },
    { icon: Clock, label: 'Tư vấn nhanh', desc: 'Phản hồi rõ ràng', color: 'text-blue-600 bg-blue-100' },
    { icon: RefreshCw, label: 'Cập nhật miễn phí', desc: 'Trọn đời', color: 'text-purple-600 bg-purple-100' },
    { icon: Headphones, label: '6 tháng hỗ trợ', desc: '24/7 Support', color: 'text-orange-600 bg-orange-100' },
    { icon: Zap, label: 'Xem demo trước', desc: 'Dễ đánh giá', color: 'text-amber-600 bg-amber-100' },
    { icon: Award, label: 'License rõ ràng', desc: 'Theo từng sản phẩm', color: 'text-rose-600 bg-rose-100' },
];

export default function TrustBadges({ variant = 'horizontal', className = '' }: TrustBadgesProps) {
    if (variant === 'grid') {
        return (
            <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
                {EXTENDED_BADGES.map((badge, idx) => (
                    <div
                        key={idx}
                        className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-3 hover:shadow-md transition-all"
                    >
                        <div className={`w-12 h-12 rounded-xl ${badge.color} flex items-center justify-center flex-shrink-0`}>
                            <badge.icon size={22} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm">{badge.label}</h4>
                            <p className="text-xs text-slate-500">{badge.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={`flex flex-wrap justify-center gap-4 ${className}`}>
            {BADGES.map((badge, idx) => (
                <div
                    key={idx}
                    className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm"
                >
                    <div className={`w-8 h-8 rounded-lg ${badge.color} flex items-center justify-center`}>
                        <badge.icon size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{badge.label}</span>
                </div>
            ))}
        </div>
    );
}

// Compact version for product cards or checkout
export function TrustBadgesCompact({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center gap-3 text-xs text-slate-500 ${className}`}>
            {[
                { icon: Lock, label: 'SSL' },
                { icon: Shield, label: 'Đảm bảo' },
                { icon: Clock, label: 'Hoàn tiền' },
            ].map((badge, idx) => (
                <div key={idx} className="flex items-center gap-1">
                    <badge.icon size={12} className="text-green-600" />
                    <span>{badge.label}</span>
                </div>
            ))}
        </div>
    );
}
