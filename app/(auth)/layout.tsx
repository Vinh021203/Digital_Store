'use client';

import React from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
            {/* Simple header with logo */}
            <header className="absolute top-0 left-0 right-0 py-6 px-4 z-10">
                <div className="max-w-7xl mx-auto">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200 group-hover:shadow-orange-300 transition-all">
                            <Package size={20} />
                        </div>
                        <span className="font-black text-xl text-slate-900 group-hover:text-orange-600 transition-colors">DigitalMart</span>
                    </Link>
                </div>
            </header>

            {/* Auth content */}
            {children}
        </div>
    );
}
