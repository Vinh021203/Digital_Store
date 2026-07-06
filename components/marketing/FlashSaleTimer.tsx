'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Clock, ArrowRight, Flame, Gift, Sparkles } from 'lucide-react';

interface FlashSaleTimerProps {
    endDate?: Date;
    discount?: number;
    variant?: 'banner' | 'compact' | 'card';
    productCount?: number;
}

export default function FlashSaleTimer({
    endDate = new Date(Date.now() + 24 * 60 * 60 * 1000), // Default: 24 hours from now
    discount = 50,
    variant = 'banner',
    productCount = 25
}: FlashSaleTimerProps) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = endDate.getTime() - Date.now();
            if (difference <= 0) {
                setIsVisible(false);
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }
            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, [endDate]);

    if (!isVisible) return null;

    const TimeBlock = ({ value, label }: { value: number; label: string }) => (
        <div className="text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 md:px-3 md:py-2 min-w-[40px] md:min-w-[50px]">
                <span className="text-xl md:text-2xl font-black">{String(value).padStart(2, '0')}</span>
            </div>
            <span className="text-[10px] md:text-xs mt-1 opacity-80">{label}</span>
        </div>
    );

    // Banner variant - Full width
    if (variant === 'banner') {
        return (
            <div className="relative bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 text-white overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[length:20px_20px] animate-slide" />
                </div>
                <div className="absolute -left-10 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
                <div className="absolute -right-10 bottom-0 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl animate-pulse" />

                <div className="relative max-w-7xl mx-auto px-4 py-3 md:py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Left: Title */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Flame className="w-8 h-8 md:w-10 md:h-10 animate-bounce" />
                                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-ping" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg md:text-xl flex items-center gap-2">
                                    ƯU ĐÃI TƯ VẤN
                                    <span className="bg-white text-red-600 px-2 py-0.5 rounded-lg text-sm">-{discount}%</span>
                                </h3>
                                <p className="text-xs md:text-sm text-orange-100">{productCount}+ mẫu giao diện đang được quan tâm</p>
                            </div>
                        </div>

                        {/* Center: Timer */}
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 opacity-80" />
                            <span className="text-sm font-bold opacity-80">Kết thúc sau:</span>
                            <div className="flex items-center gap-1">
                                {timeLeft.days > 0 && <TimeBlock value={timeLeft.days} label="Ngày" />}
                                <TimeBlock value={timeLeft.hours} label="Giờ" />
                                <span className="text-xl font-bold">:</span>
                                <TimeBlock value={timeLeft.minutes} label="Phút" />
                                <span className="text-xl font-bold">:</span>
                                <TimeBlock value={timeLeft.seconds} label="Giây" />
                            </div>
                        </div>

                        {/* Right: CTA */}
                        <Link
                            href="/products?sale=true"
                            className="hidden md:flex items-center gap-2 bg-white text-red-600 px-5 py-2.5 rounded-xl font-bold hover:bg-orange-50 transition-all hover:scale-105 shadow-lg group"
                        >
                            Xem mẫu
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                        </Link>
                    </div>
                </div>

                <style jsx>{`
          @keyframes slide {
            0% { background-position: 0 0; }
            100% { background-position: 40px 40px; }
          }
          .animate-slide {
            animation: slide 1s linear infinite;
          }
        `}</style>
            </div>
        );
    }

    // Compact variant - Inline
    if (variant === 'compact') {
        return (
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                <Zap className="w-4 h-4 animate-pulse" />
                <span>Ưu đãi tư vấn -{discount}%</span>
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs">
                    <span>{String(timeLeft.hours).padStart(2, '0')}</span>:
                    <span>{String(timeLeft.minutes).padStart(2, '0')}</span>:
                    <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                </div>
            </div>
        );
    }

    // Card variant - Sidebar/Widget
    return (
        <div className="bg-gradient-to-br from-red-600 via-orange-600 to-amber-500 text-white rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-yellow-300/20 rounded-full -ml-4 -mb-4" />

            <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                    <Flame className="animate-bounce" size={24} />
                    <span className="font-black text-lg">ƯU ĐÃI TƯ VẤN</span>
                </div>

                <div className="text-center mb-4">
                    <div className="text-5xl font-black mb-1">-{discount}%</div>
                    <p className="text-sm text-orange-100">Trên {productCount}+ mẫu giao diện</p>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                    <p className="text-xs text-center mb-2 opacity-80">Kết thúc sau</p>
                    <div className="flex justify-center gap-2">
                        {timeLeft.days > 0 && <TimeBlock value={timeLeft.days} label="D" />}
                        <TimeBlock value={timeLeft.hours} label="H" />
                        <span className="text-xl font-bold self-start mt-1">:</span>
                        <TimeBlock value={timeLeft.minutes} label="M" />
                        <span className="text-xl font-bold self-start mt-1">:</span>
                        <TimeBlock value={timeLeft.seconds} label="S" />
                    </div>
                </div>

                <Link
                    href="/products?sale=true"
                    className="block w-full text-center bg-white text-red-600 font-bold py-3 rounded-xl hover:bg-orange-50 transition-colors"
                >
                    Xem mẫu →
                </Link>
            </div>
        </div>
    );
}
