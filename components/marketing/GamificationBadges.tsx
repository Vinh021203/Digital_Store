'use client';

import React from 'react';
import {
    Award, Star, Crown, Heart, Target,
    Trophy, Sparkles, Rocket, BookOpen
} from 'lucide-react';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: any;
    color: string;
    bgColor: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    earned?: boolean;
    progress?: number; // 0-100
    requirement?: string;
}

const BADGES: Badge[] = [
    // Buyer badges
    { id: 'first-purchase', name: 'Người Mua Đầu', description: 'Mua sản phẩm đầu tiên', icon: ShoppingBag, color: 'text-green-600', bgColor: 'bg-green-100', rarity: 'common' },
    { id: 'collector', name: 'Nhà Sưu Tập', description: 'Mua 10+ sản phẩm', icon: Star, color: 'text-amber-600', bgColor: 'bg-amber-100', rarity: 'rare' },
    { id: 'big-spender', name: 'Đại Gia', description: 'Chi tiêu trên 5 triệu', icon: Crown, color: 'text-purple-600', bgColor: 'bg-purple-100', rarity: 'epic' },
    { id: 'loyal', name: 'Khách Hàng Trung Thành', description: 'Thành viên trên 1 năm', icon: Heart, color: 'text-rose-600', bgColor: 'bg-rose-100', rarity: 'rare' },

    // Community badges
    { id: 'helpful', name: 'Người Giúp Đỡ', description: '50+ câu trả lời hữu ích', icon: Award, color: 'text-blue-600', bgColor: 'bg-blue-100', rarity: 'rare' },
    { id: 'top-contributor', name: 'Top Contributor', description: 'Top 10 thành viên tích cực', icon: Trophy, color: 'text-amber-600', bgColor: 'bg-amber-100', rarity: 'legendary' },
    { id: 'reviewer', name: 'Nhà Phê Bình', description: 'Viết 20+ đánh giá', icon: BookOpen, color: 'text-indigo-600', bgColor: 'bg-indigo-100', rarity: 'rare' },

    { id: 'top-rated', name: 'Đánh Giá Cao', description: '4.8+ sao trung bình', icon: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-100', rarity: 'legendary' },

    // Special badges
    { id: 'early-adopter', name: 'Early Adopter', description: 'Gia nhập từ 2024', icon: Rocket, color: 'text-violet-600', bgColor: 'bg-violet-100', rarity: 'epic' },
    { id: 'bug-hunter', name: 'Bug Hunter', description: 'Phát hiện lỗi quan trọng', icon: Target, color: 'text-red-600', bgColor: 'bg-red-100', rarity: 'legendary' },
];

// Import statement workaround
function ShoppingBag(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
    );
}

interface GamificationBadgesProps {
    badges?: Badge[];
    variant?: 'grid' | 'inline' | 'showcase';
    showLocked?: boolean;
    maxDisplay?: number;
}

export default function GamificationBadges({
    badges = BADGES.slice(0, 6),
    variant = 'grid',
    showLocked = true,
    maxDisplay = 12,
}: GamificationBadgesProps) {
    const displayBadges = badges.slice(0, maxDisplay);

    const getRarityStyles = (rarity: string) => {
        switch (rarity) {
            case 'legendary':
                return 'ring-2 ring-amber-400 shadow-lg shadow-amber-200';
            case 'epic':
                return 'ring-2 ring-purple-400 shadow-lg shadow-purple-200';
            case 'rare':
                return 'ring-2 ring-blue-400 shadow-md shadow-blue-100';
            default:
                return 'ring-1 ring-slate-200';
        }
    };

    const getRarityLabel = (rarity: string) => {
        switch (rarity) {
            case 'legendary': return { text: 'HUYỀN THOẠI', color: 'text-amber-600 bg-amber-100' };
            case 'epic': return { text: 'SỬ THI', color: 'text-purple-600 bg-purple-100' };
            case 'rare': return { text: 'HIẾM', color: 'text-blue-600 bg-blue-100' };
            default: return { text: 'PHỔ THÔNG', color: 'text-slate-600 bg-slate-100' };
        }
    };

    // Inline variant - Small icons in a row
    if (variant === 'inline') {
        return (
            <div className="flex items-center gap-1 flex-wrap">
                {displayBadges.filter(b => b.earned !== false).map((badge) => (
                    <div
                        key={badge.id}
                        className={`w-7 h-7 rounded-lg ${badge.bgColor} flex items-center justify-center ${getRarityStyles(badge.rarity)}`}
                        title={`${badge.name}: ${badge.description}`}
                    >
                        <badge.icon size={14} className={badge.color} />
                    </div>
                ))}
                {displayBadges.filter(b => b.earned !== false).length > maxDisplay && (
                    <span className="text-xs text-slate-500 ml-1">+{displayBadges.length - maxDisplay}</span>
                )}
            </div>
        );
    }

    // Showcase variant - Featured badge display
    if (variant === 'showcase') {
        const featuredBadge = displayBadges.find(b => b.rarity === 'legendary' || b.rarity === 'epic') || displayBadges[0];
        return (
            <div className={`relative p-6 rounded-2xl ${featuredBadge.bgColor} ${getRarityStyles(featuredBadge.rarity)}`}>
                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-white/80 flex items-center justify-center`}>
                        <featuredBadge.icon size={32} className={featuredBadge.color} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-slate-900">{featuredBadge.name}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getRarityLabel(featuredBadge.rarity).color}`}>
                                {getRarityLabel(featuredBadge.rarity).text}
                            </span>
                        </div>
                        <p className="text-sm text-slate-600">{featuredBadge.description}</p>
                    </div>
                </div>
                {featuredBadge.rarity === 'legendary' && (
                    <Sparkles className="absolute top-2 right-2 text-amber-400 animate-pulse" size={20} />
                )}
            </div>
        );
    }

    // Grid variant - Full badge collection
    return (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayBadges.map((badge) => {
                const isLocked = badge.earned === false;
                return (
                    <div
                        key={badge.id}
                        className={`group relative p-4 rounded-2xl text-center transition-all hover:scale-105 hover:shadow-lg ${isLocked ? 'bg-slate-100 opacity-50' : `${badge.bgColor} ${getRarityStyles(badge.rarity)}`
                            }`}
                    >
                        {/* Rarity indicator */}
                        {!isLocked && (badge.rarity === 'legendary' || badge.rarity === 'epic') && (
                            <div className="absolute -top-1 -right-1">
                                {badge.rarity === 'legendary' ? (
                                    <Crown size={16} className="text-amber-500" />
                                ) : (
                                    <Sparkles size={14} className="text-purple-500" />
                                )}
                            </div>
                        )}

                        {/* Badge Icon */}
                        <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center ${isLocked ? 'bg-slate-200' : 'bg-white/80'
                            }`}>
                            <badge.icon size={24} className={isLocked ? 'text-slate-400' : badge.color} />
                        </div>

                        {/* Badge Info */}
                        <h4 className={`font-bold text-xs mb-1 ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>
                            {badge.name}
                        </h4>

                        {/* Progress (if applicable) */}
                        {badge.progress !== undefined && badge.progress < 100 && (
                            <div className="mt-2">
                                <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                                        style={{ width: `${badge.progress}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-slate-500 mt-1">{badge.progress}%</span>
                            </div>
                        )}

                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {badge.description}
                            {badge.requirement && <span className="block text-slate-400 mt-1">{badge.requirement}</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export { BADGES };
export type { Badge };
