'use client';

import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Flame, TrendingUp, Users, ShoppingCart } from 'lucide-react';

interface StockCounterProps {
    totalStock: number;
    soldCount?: number;
    variant?: 'default' | 'compact' | 'urgent';
    showProgress?: boolean;
    showViewers?: boolean;
}

export default function StockCounter({
    totalStock,
    soldCount = 0,
    variant = 'default',
    showProgress = true,
    showViewers = true,
}: StockCounterProps) {
    const [viewers, setViewers] = useState(0);
    const remaining = Math.max(0, totalStock - soldCount);
    const soldPercent = totalStock > 0 ? (soldCount / totalStock) * 100 : 0;
    const isLowStock = remaining <= 5;
    const isAlmostOut = remaining <= 2;

    // Simulate random viewers
    useEffect(() => {
        setViewers(Math.floor(Math.random() * 15) + 3);
        const interval = setInterval(() => {
            setViewers(prev => {
                const change = Math.random() > 0.5 ? 1 : -1;
                return Math.max(3, Math.min(20, prev + change));
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Compact variant
    if (variant === 'compact') {
        return (
            <div className={`flex items-center gap-2 text-sm ${isLowStock ? 'text-red-600' : 'text-slate-600'}`}>
                <Package size={14} />
                <span className="font-medium">
                    {isAlmostOut ? (
                        <span className="animate-pulse">Chỉ còn {remaining}!</span>
                    ) : (
                        `Còn ${remaining} mẫu demo`
                    )}
                </span>
            </div>
        );
    }

    // Urgent variant (full warning)
    if (variant === 'urgent' && isLowStock) {
        return (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4 animate-pulse-subtle">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="text-white" size={24} />
                    </div>
                    <div>
                        <p className="font-black text-red-700 text-lg">
                            {isAlmostOut ? '🔥 SẮP HẾT HÀNG!' : '⚠️ SẮP HẾT HÀNG'}
                        </p>
                        <p className="text-sm text-red-600">
                            Chỉ còn <span className="font-black text-xl">{remaining}</span> mẫu demo - Đặt ngay!
                        </p>
                    </div>
                </div>
                {showViewers && viewers > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                        <Users size={14} className="animate-pulse" />
                        <span>{viewers} người đang xem mẫu demo này</span>
                    </div>
                )}
            </div>
        );
    }

    // Default variant
    return (
        <div className="space-y-3">
            {/* Stock Info */}
            <div className={`flex items-center justify-between ${isLowStock ? 'text-red-600' : 'text-slate-700'}`}>
                <div className="flex items-center gap-2">
                    {isLowStock ? (
                        <Flame className="animate-bounce" size={18} />
                    ) : (
                        <Package size={18} />
                    )}
                    <span className="font-bold">
                        {isAlmostOut ? (
                            <span className="animate-pulse">Chỉ còn {remaining} mẫu demo!</span>
                        ) : isLowStock ? (
                            `Còn ${remaining} mẫu demo - Nhanh tay!`
                        ) : (
                            `Còn ${remaining} mẫu demo`
                        )}
                    </span>
                </div>
                <span className="text-sm text-slate-500">{soldCount} lượt quan tâm</span>
            </div>

            {/* Progress Bar */}
            {showProgress && (
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${isLowStock
                                ? 'bg-gradient-to-r from-red-500 to-orange-500'
                                : 'bg-gradient-to-r from-orange-500 to-amber-500'
                            }`}
                        style={{ width: `${soldPercent}%` }}
                    />
                    {soldPercent > 50 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <TrendingUp size={10} className="text-white" />
                        </div>
                    )}
                </div>
            )}

            {/* Live Viewers */}
            {showViewers && viewers > 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <Users size={14} />
                    </div>
                    <span>{viewers} người đang xem</span>
                </div>
            )}

            {/* Recent Purchase */}
            {soldCount > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ShoppingCart size={12} />
                    <span>Có người vừa xem demo {Math.floor(Math.random() * 30) + 1} phút trước</span>
                </div>
            )}

            <style jsx>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
