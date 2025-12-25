'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Home, ChevronRight, Mail, Phone, MapPin, Send, MessageCircle, Clock,
    Loader2, Sparkles, Star, Headphones, Zap, ArrowRight, CheckCircle,
    Facebook, Instagram, Youtube, Globe, Shield, Heart
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const CONTACT_INFO = [
    { icon: Mail, label: 'Email hỗ trợ', value: 'support@digitalmart.vn', href: 'mailto:support@digitalmart.vn', color: 'blue' },
    { icon: Phone, label: 'Hotline', value: '0971 386 588', href: 'tel:0971386588', color: 'emerald' },
    { icon: MapPin, label: 'Địa chỉ', value: 'Hạ Long, Quảng Ninh', href: '#', color: 'rose' },
    { icon: Clock, label: 'Giờ làm việc', value: '8:00 - 22:00 hàng ngày', href: '#', color: 'amber' },
];

const SOCIAL_LINKS = [
    { icon: Facebook, href: '#', label: 'Facebook', color: 'bg-blue-600' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'bg-gradient-to-br from-purple-600 to-pink-500' },
    { icon: Youtube, href: '#', label: 'Youtube', color: 'bg-red-600' },
    { icon: Globe, href: '#', label: 'Website', color: 'bg-slate-700' },
];

const SUPPORT_FEATURES = [
    { icon: Zap, title: 'Phản hồi nhanh', desc: 'Trong vòng 2-4 giờ làm việc' },
    { icon: Shield, title: 'Hỗ trợ chuyên nghiệp', desc: 'Đội ngũ kỹ thuật giàu kinh nghiệm' },
    { icon: Heart, title: 'Tận tâm 24/7', desc: 'Luôn sẵn sàng giúp đỡ bạn' },
];

export default function ContactPage() {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(r => setTimeout(r, 1500));
        addToast('Đã gửi tin nhắn thành công! Chúng tôi sẽ phản hồi sớm.', 'success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section with Background */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80"
                        alt="Contact Background"
                        fill
                        className="object-cover opacity-20"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/80" />
                </div>

                {/* Decorative Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 sm:py-20 lg:py-24">
                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                        {/* Left Content */}
                        <div className="text-center lg:text-left">
                            {/* Breadcrumb */}
                            <div className="inline-flex items-center gap-2 text-sm text-slate-400 mb-6">
                                <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
                                    <Home size={14} /> Trang chủ
                                </Link>
                                <ChevronRight size={14} />
                                <span className="text-white font-semibold">Liên hệ</span>
                            </div>

                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-bold mb-6 backdrop-blur-sm">
                                <Headphones size={16} />
                                HỖ TRỢ 24/7
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                                Liên Hệ <br className="hidden sm:block" />
                                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Với Chúng Tôi</span>
                            </h1>

                            <p className="text-slate-400 text-lg sm:text-xl max-w-md mx-auto lg:mx-0 mb-8">
                                Đội ngũ hỗ trợ luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn.
                            </p>

                            {/* Quick Contact */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
                                <a
                                    href="mailto:support@digitalmart.vn"
                                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-5 py-3 rounded-xl hover:bg-white/20 transition-all"
                                >
                                    <Mail size={18} className="text-emerald-400" />
                                    <span className="font-semibold">support@digitalmart.vn</span>
                                </a>
                                <a
                                    href="tel:0971386588"
                                    className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-5 py-3 rounded-xl hover:bg-emerald-500/30 transition-all"
                                >
                                    <Phone size={18} />
                                    <span className="font-bold">0971 386 588</span>
                                </a>
                            </div>

                            {/* Support Features */}
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                {SUPPORT_FEATURES.map((feat, idx) => (
                                    <div key={idx} className="text-center lg:text-left">
                                        <feat.icon size={20} className="text-emerald-400 mx-auto lg:mx-0 mb-2" />
                                        <p className="font-bold text-white text-xs sm:text-sm">{feat.title}</p>
                                        <p className="text-slate-500 hidden sm:block text-xs">{feat.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right - Feature Cards */}
                        <div className="hidden lg:block">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-2xl" />

                                <div className="relative space-y-4">
                                    {CONTACT_INFO.map((info, idx) => (
                                        <a
                                            key={idx}
                                            href={info.href}
                                            className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 flex items-center gap-4 transform hover:translate-x-2 transition-all ${idx === 1 ? 'translate-x-8' : ''
                                                }`}
                                        >
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${info.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                                                    info.color === 'emerald' ? 'bg-gradient-to-br from-emerald-500 to-green-500' :
                                                        info.color === 'rose' ? 'bg-gradient-to-br from-rose-500 to-pink-500' :
                                                            'bg-gradient-to-br from-amber-500 to-orange-500'
                                                }`}>
                                                <info.icon size={28} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-sm">{info.label}</p>
                                                <p className="text-white font-bold text-lg">{info.value}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>

                                {/* Floating Elements */}
                                <Sparkles size={24} className="absolute -top-4 right-8 text-amber-400 animate-pulse" />
                                <Star size={18} className="absolute bottom-4 -left-4 text-emerald-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
                <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Contact Form - 3 columns */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                            <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                        <MessageCircle size={20} />
                                    </div>
                                    Gửi tin nhắn
                                </h2>
                                <p className="text-slate-500 mt-2">Điền thông tin bên dưới, chúng tôi sẽ phản hồi trong vòng 2-4 giờ</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 block mb-2">
                                            Họ tên <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Nguyễn Văn A"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 block mb-2">
                                            Email <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="email@example.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 block mb-2">
                                        Tiêu đề <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="VD: Hỏi về sản phẩm XYZ"
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 block mb-2">
                                        Nội dung <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        rows={5}
                                        required
                                        placeholder="Mô tả chi tiết vấn đề hoặc câu hỏi của bạn..."
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                                            Gửi tin nhắn
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar - 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact Info Cards - Mobile visible */}
                        <div className="lg:hidden space-y-3">
                            {CONTACT_INFO.map((info, idx) => (
                                <a
                                    key={idx}
                                    href={info.href}
                                    className="flex items-center gap-4 bg-white rounded-xl border border-slate-100 p-4 hover:border-emerald-200 hover:shadow-md transition-all"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${info.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                            info.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                                                info.color === 'rose' ? 'bg-rose-100 text-rose-600' :
                                                    'bg-amber-100 text-amber-600'
                                        }`}>
                                        <info.icon size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">{info.label}</p>
                                        <p className="font-bold text-slate-900">{info.value}</p>
                                    </div>
                                </a>
                            ))}
                        </div>

                        {/* FAQ CTA */}
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-xl font-black mb-2">Câu hỏi thường gặp</h3>
                            <p className="text-blue-100 text-sm mb-4">Tìm câu trả lời nhanh cho các thắc mắc phổ biến</p>
                            <Link
                                href="/faq"
                                className="inline-flex items-center gap-2 bg-white text-blue-600 px-5 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all"
                            >
                                Xem FAQ <ArrowRight size={18} />
                            </Link>
                        </div>

                        {/* Social Links */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Globe size={18} className="text-slate-400" />
                                Kết nối với chúng tôi
                            </h3>
                            <div className="flex gap-3">
                                {SOCIAL_LINKS.map((social, idx) => (
                                    <a
                                        key={idx}
                                        href={social.href}
                                        className={`w-12 h-12 ${social.color} rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg`}
                                        title={social.label}
                                    >
                                        <social.icon size={22} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Response Time */}
                        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <CheckCircle size={24} className="text-emerald-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Cam kết phản hồi</h4>
                                    <p className="text-sm text-slate-600">Mọi yêu cầu sẽ được phản hồi trong vòng <strong className="text-emerald-600">2-4 giờ</strong> làm việc.</p>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden">
                            <div className="p-4 border-b border-slate-100">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <MapPin size={18} className="text-rose-500" />
                                    Vị trí của chúng tôi
                                </h3>
                            </div>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.3439367867064!2d107.0853896!3d20.9591988!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314a5796518cee87%3A0x55c7a1d7d39c101e!2sVincom%20Plaza%20H%E1%BA%A1%20Long!5e0!3m2!1svi!2s!4v1703235000000"
                                width="100%"
                                height="200"
                                style={{ border: 0 }}
                                loading="lazy"
                                className="grayscale hover:grayscale-0 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
