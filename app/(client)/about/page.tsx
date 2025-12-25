'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    Award, Users, Target, Heart, Linkedin, Twitter, Facebook, Github,
    Home, ChevronRight, Star, Package, Download, Shield, TrendingUp,
    Sparkles, Mail, Phone, MapPin, ArrowRight
} from 'lucide-react';

// ============================================
// DATA
// ============================================
const STATS = [
    { value: '50K+', label: 'Học viên', icon: Users },
    { value: '10K+', label: 'Sản phẩm', icon: Package },
    { value: '99%', label: 'Hài lòng', icon: Star },
    { value: '24/7', label: 'Hỗ trợ', icon: Shield },
];

const VALUES = [
    { icon: Target, title: 'Sứ mệnh', description: 'Mang đến sản phẩm số chất lượng cao, giá cả hợp lý cho mọi người' },
    { icon: Heart, title: 'Tầm nhìn', description: 'Trở thành nền tảng MarketPlace số 1 Việt Nam' },
    { icon: Award, title: 'Giá trị cốt lõi', description: 'Chất lượng - Uy tín - Hỗ trợ' },
];

const TEAM = [
    { name: 'Vinh Lương', role: 'Founder & CEO', image: '/team/ceo.jpg' },
    { name: 'Nguyễn Văn A', role: 'CTO', image: '/team/cto.jpg' },
    { name: 'Trần Thị B', role: 'Design Lead', image: '/team/design.jpg' },
];

const TIMELINE = [
    { year: '2023', title: 'Thành lập', description: 'DigitalMart ra đời với sứ mệnh mang đến sản phẩm số chất lượng' },
    { year: '2024', title: 'Mở rộng', description: '10.000 sản phẩm, 50.000 khách hàng tin dùng' },
    { year: '2025', title: 'Tương lai', description: 'Hướng tới trở thành MarketPlace số 1 Đông Nam Á' },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white">
            {/* Hero */}
            <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200')] opacity-10 bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-purple-600/20" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                        <Link href="/" className="hover:text-white flex items-center gap-1">
                            <Home size={14} /> Trang chủ
                        </Link>
                        <ChevronRight size={14} />
                        <span className="text-white">Về chúng tôi</span>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
                            <Sparkles size={16} className="text-orange-400" />
                            <span className="text-sm font-bold text-orange-300">Digital Products Marketplace #1 VN</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                            Xây Dựng Tương Lai
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400"> Cùng Bạn</span>
                        </h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                            DigitalMart - Nền tảng marketplace digital products uy tín hàng đầu Việt Nam với 50,000+ học viên tin dùng
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 -mt-20 relative z-10">
                    {STATS.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-2xl shadow-xl p-6 text-center"
                        >
                            <stat.icon size={32} className="mx-auto text-orange-500 mb-3" />
                            <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                            <p className="text-sm text-slate-500">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Values */}
                <section className="mb-16">
                    <h2 className="text-3xl font-black text-slate-900 text-center mb-12">Giá Trị Của Chúng Tôi</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {VALUES.map((value, idx) => (
                            <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-shadow">
                                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                                    <value.icon size={28} className="text-orange-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{value.title}</h3>
                                <p className="text-slate-600">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Timeline */}
                <section className="mb-16">
                    <h2 className="text-3xl font-black text-slate-900 text-center mb-12">Hành Trình Phát Triển</h2>
                    <div className="relative">
                        <div className="absolute left-1/2 -translate-x-px h-full w-0.5 bg-orange-200" />
                        <div className="space-y-12">
                            {TIMELINE.map((item, idx) => (
                                <div key={idx} className={`flex items-center gap-8 ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <div className={`flex-1 ${idx % 2 === 0 ? 'text-right' : 'text-left'}`}>
                                        <span className="text-4xl font-black text-orange-500">{item.year}</span>
                                        <h3 className="text-xl font-bold text-slate-900 mt-2">{item.title}</h3>
                                        <p className="text-slate-600">{item.description}</p>
                                    </div>
                                    <div className="w-4 h-4 bg-orange-500 rounded-full border-4 border-white shadow-lg z-10" />
                                    <div className="flex-1" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 md:p-12 text-center text-white">
                    <h3 className="text-3xl font-black mb-4">Liên Hệ Với Chúng Tôi</h3>
                    <p className="text-orange-100 mb-6 max-w-xl mx-auto">
                        Có câu hỏi? Đừng ngần ngại liên hệ. Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/contact" className="bg-white text-orange-600 px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors flex items-center gap-2">
                            <Mail size={18} /> Liên hệ ngay
                        </Link>
                        <a href="tel:0971386588" className="bg-white/20 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/30 transition-colors flex items-center gap-2">
                            <Phone size={18} /> 0971 386 588
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
}
