'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
            {/* Simple header with logo */}
            <header className="absolute top-0 left-0 right-0 py-5 px-4 z-10">
                <div className="max-w-7xl mx-auto">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="relative w-12 h-12 flex-shrink-0 drop-shadow-lg group-hover:scale-105 transition-transform">
                            <Image
                                src="/icon.png"
                                alt="DigitalMart Logo"
                                width={48}
                                height={48}
                                className="rounded-full object-cover"
                                priority
                            />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="font-black text-xl text-orange-600 group-hover:text-orange-700 transition-colors tracking-tight">
                                DigitalMart
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">
                                Digital Products
                            </span>
                        </div>
                    </Link>
                </div>
            </header>

            {/* Auth content */}
            {children}
        </div>
    );
}
