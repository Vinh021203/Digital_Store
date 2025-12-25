'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw, MessageCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Log error to console (or send to error tracking service)
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/50 to-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="max-w-lg w-full text-center relative z-10">
                {/* Error Icon with glow effect */}
                <div className="relative mb-8">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/30">
                        <AlertTriangle size={48} className="text-white" />
                    </div>
                </div>

                {/* Message */}
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Đã xảy ra lỗi
                </h1>
                <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
                    Xin lỗi, đã có sự cố xảy ra. Hãy thử lại hoặc quay về trang chủ.
                </p>

                {/* Error message box */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8 text-left">
                    <p className="text-red-400 font-medium text-sm mb-2">Chi tiết lỗi:</p>
                    <p className="text-red-300 text-sm">
                        {error.message || 'Lỗi không xác định'}
                    </p>

                    {/* Error digest for support */}
                    {error.digest && (
                        <p className="text-red-400/60 text-xs mt-3">
                            Mã lỗi: {error.digest}
                        </p>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <button
                        onClick={() => reset()}
                        className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-red-600 hover:to-orange-600 transition-all shadow-xl shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105"
                    >
                        <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                        Thử lại
                    </button>
                    <Link
                        href="/"
                        className="group inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/20 transition-all hover:scale-105"
                    >
                        <Home size={20} />
                        Về trang chủ
                    </Link>
                </div>

                {/* Contact support */}
                <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <MessageCircle size={16} />
                    Liên hệ hỗ trợ kỹ thuật
                </Link>

                {/* Technical details (collapsible) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 pt-8 border-t border-white/10">
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors mx-auto"
                        >
                            <ChevronDown
                                size={14}
                                className={`transition-transform ${showDetails ? 'rotate-180' : ''}`}
                            />
                            Chi tiết kỹ thuật (Development mode)
                        </button>

                        {showDetails && (
                            <pre className="mt-4 p-4 bg-slate-900/50 backdrop-blur-sm text-slate-400 text-xs rounded-xl overflow-x-auto text-left max-h-48 border border-slate-700">
                                {error.stack}
                            </pre>
                        )}
                    </div>
                )}

                {/* Fun message */}
                <p className="mt-12 text-slate-600 text-xs">
                    Đừng lo, team kỹ thuật của chúng tôi đã được thông báo về sự cố này
                </p>
            </div>
        </div>
    );
}
