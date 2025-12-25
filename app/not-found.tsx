'use client';

import Link from 'next/link';
import { Home, Search, ShoppingBag, ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4 overflow-hidden relative">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500" />
            </div>

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="max-w-2xl w-full text-center relative z-10">
                {/* 404 Number with glow effect */}
                <div className="relative mb-8">
                    <h1 className="text-[12rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5 leading-none select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 animate-pulse">
                            404
                        </div>
                    </div>
                </div>

                {/* Floating astronaut/icon */}
                <div className="relative mb-8">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/30 animate-bounce">
                        <Sparkles size={48} className="text-white" />
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Oops! Trang không tồn tại
                </h2>
                <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto">
                    Có vẻ như bạn đã lạc đường. Trang bạn tìm kiếm đã bị xóa hoặc chưa từng tồn tại.
                </p>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <Link
                        href="/"
                        className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105"
                    >
                        <Home size={20} />
                        Về trang chủ
                    </Link>
                    <Link
                        href="/products"
                        className="group inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/20 transition-all hover:scale-105"
                    >
                        <ShoppingBag size={20} />
                        Khám phá sản phẩm
                    </Link>
                </div>

                {/* Quick links */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                    <Link href="/products" className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
                        <Search size={14} />
                        Tìm kiếm
                    </Link>
                    <span className="text-slate-600">•</span>
                    <Link href="/blog" className="text-slate-400 hover:text-white transition-colors">
                        Blog
                    </Link>
                    <span className="text-slate-600">•</span>
                    <Link href="/contact" className="text-slate-400 hover:text-white transition-colors">
                        Liên hệ
                    </Link>
                    <span className="text-slate-600">•</span>
                    <button
                        onClick={() => typeof window !== 'undefined' && window.history.back()}
                        className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Quay lại
                    </button>
                </div>

                {/* Fun message */}
                <p className="mt-16 text-slate-500 text-xs">
                    Mã lỗi: 404 | Sản phẩm số • Templates • Courses
                </p>
            </div>
        </div>
    );
}
