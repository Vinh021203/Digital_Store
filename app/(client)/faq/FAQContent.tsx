'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Home, ChevronRight, Search, ChevronDown, HelpCircle, MessageCircle,
    Star, Zap, ShieldCheck, Clock, Mail, Phone, Sparkles, BookOpen,
    CreditCard, Package, Key, Headphones, Plus, Minus, ArrowRight
} from 'lucide-react';

const FAQ_CATEGORIES = [
    { id: 'all', name: 'Tất cả', icon: Sparkles, count: 12 },
    { id: 'product', name: 'Sản phẩm', icon: Package, count: 4 },
    { id: 'payment', name: 'Thanh toán', icon: CreditCard, count: 3 },
    { id: 'license', name: 'License', icon: Key, count: 3 },
    { id: 'support', name: 'Hỗ trợ', icon: Headphones, count: 2 },
];

const FAQ_DATA = [
    {
        category: 'product',
        question: 'Sản phẩm có được cập nhật miễn phí không?',
        answer: 'Có, khi bạn mua sản phẩm, bạn sẽ nhận được tất cả các bản cập nhật miễn phí trong tương lai. Chúng tôi cam kết cải tiến liên tục để đảm bảo sản phẩm luôn tương thích với các phiên bản mới nhất.',
        featured: true
    },
    {
        category: 'product',
        question: 'Tôi có thể xem demo trước khi mua không?',
        answer: 'Có, hầu hết sản phẩm đều có link demo để bạn xem trước. Bạn có thể trải nghiệm đầy đủ tính năng trước khi quyết định mua.',
        featured: false
    },
    {
        category: 'product',
        question: 'Sản phẩm có tài liệu hướng dẫn không?',
        answer: 'Tất cả sản phẩm đều đi kèm tài liệu hướng dẫn chi tiết, bao gồm hướng dẫn cài đặt, tùy chỉnh và FAQ riêng cho từng sản phẩm.',
        featured: false
    },
    {
        category: 'product',
        question: 'Tôi có thể sử dụng cho nhiều dự án không?',
        answer: 'Điều này phụ thuộc vào loại license bạn mua. Regular License cho phép sử dụng trong 1 dự án, Extended License cho phép sử dụng không giới hạn.',
        featured: false
    },
    {
        category: 'payment',
        question: 'Có những phương thức thanh toán nào?',
        answer: 'Chúng tôi hỗ trợ đa dạng phương thức thanh toán: Chuyển khoản ngân hàng (VietQR), Ví MoMo, VNPay, và thẻ quốc tế Visa/Mastercard. Tất cả đều được xử lý qua các cổng thanh toán uy tín.',
        featured: true
    },
    {
        category: 'payment',
        question: 'Thanh toán có an toàn không?',
        answer: 'Hoàn toàn an toàn. Chúng tôi sử dụng mã hóa SSL 256-bit và các cổng thanh toán đạt chuẩn PCI DSS. Thông tin thanh toán của bạn không bao giờ được lưu trữ trên hệ thống.',
        featured: false
    },
    {
        category: 'payment',
        question: 'Tôi có thể hoàn tiền không?',
        answer: 'Có, chúng tôi có chính sách hoàn tiền trong vòng 7 ngày nếu sản phẩm không đúng như mô tả hoặc có lỗi kỹ thuật không thể khắc phục.',
        featured: false
    },
    {
        category: 'license',
        question: 'License Regular và Extended khác gì nhau?',
        answer: 'License Regular cho phép sử dụng trong 1 dự án cá nhân hoặc thương mại. License Extended cho phép sử dụng không giới hạn số dự án và có thể tích hợp vào sản phẩm bán lại.',
        featured: true
    },
    {
        category: 'license',
        question: 'License có thời hạn sử dụng không?',
        answer: 'Không, license của chúng tôi là vĩnh viễn. Một khi đã mua, bạn có quyền sử dụng mãi mãi mà không phải trả thêm phí.',
        featured: false
    },
    {
        category: 'license',
        question: 'Tôi có thể chuyển nhượng license không?',
        answer: 'License không thể chuyển nhượng cho bên thứ ba. Mỗi license chỉ dành cho một chủ sở hữu duy nhất.',
        featured: false
    },
    {
        category: 'support',
        question: 'Làm sao để liên hệ hỗ trợ?',
        answer: 'Bạn có thể liên hệ qua nhiều kênh: Email support@digitalmart.vn, Hotline 0971 386 588, hoặc chat trực tiếp trên website. Đội ngũ hỗ trợ sẵn sàng 24/7.',
        featured: true
    },
    {
        category: 'support',
        question: 'Thời gian phản hồi hỗ trợ là bao lâu?',
        answer: 'Chúng tôi cam kết phản hồi trong vòng 2-4 giờ làm việc cho mọi yêu cầu. Với các vấn đề khẩn cấp, bạn có thể gọi hotline để được hỗ trợ ngay.',
        featured: false
    },
];

export default function FAQContent() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [openItems, setOpenItems] = useState<number[]>([0]);

    const filteredFaqs = useMemo(() => {
        return FAQ_DATA.filter(faq => {
            const matchSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
            const matchCategory = activeCategory === 'all' || faq.category === activeCategory;
            return matchSearch && matchCategory;
        });
    }, [searchTerm, activeCategory]);

    const toggleItem = (idx: number) => {
        setOpenItems(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
    };

    const getCategoryInfo = (catId: string) => {
        return FAQ_CATEGORIES.find(c => c.id === catId) || FAQ_CATEGORIES[0];
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&q=80"
                        alt="FAQ Background"
                        fill
                        className="object-cover opacity-20"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/80" />
                </div>

                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 sm:py-20 lg:py-24">
                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 text-sm text-slate-400 mb-6">
                                <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
                                    <Home size={14} /> Trang chủ
                                </Link>
                                <ChevronRight size={14} />
                                <span className="text-white font-semibold">FAQ</span>
                            </div>

                            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-full text-sm font-bold mb-6 backdrop-blur-sm">
                                <HelpCircle size={16} />
                                TRUNG TÂM HỖ TRỢ
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                                Câu Hỏi <br className="hidden sm:block" />
                                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Thường Gặp</span>
                            </h1>

                            <p className="text-slate-400 text-lg sm:text-xl max-w-md mx-auto lg:mx-0 mb-8">
                                Tìm câu trả lời nhanh chóng cho các thắc mắc của bạn về sản phẩm, thanh toán và hỗ trợ.
                            </p>

                            <div className="relative max-w-lg mx-auto lg:mx-0">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm câu hỏi..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-14 pr-5 py-4 sm:py-5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all"
                                />
                            </div>

                            <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-8 text-sm">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <BookOpen size={18} className="text-blue-400" />
                                    <span><strong className="text-white">{FAQ_DATA.length}</strong> câu hỏi</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <Clock size={18} className="text-emerald-400" />
                                    <span>Cập nhật <strong className="text-white">hàng tuần</strong></span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:block">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
                                <div className="relative space-y-4">
                                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <Package size={28} className="text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg">Sản phẩm chất lượng</h4>
                                            <p className="text-slate-400 text-sm">Được kiểm duyệt kỹ lưỡng</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 flex items-center gap-4 translate-x-8">
                                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <ShieldCheck size={28} className="text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg">Thanh toán an toàn</h4>
                                            <p className="text-slate-400 text-sm">Mã hóa SSL 256-bit</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <Headphones size={28} className="text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg">Hỗ trợ 24/7</h4>
                                            <p className="text-slate-400 text-sm">Phản hồi trong 2-4 giờ</p>
                                        </div>
                                    </div>
                                </div>
                                <Sparkles size={24} className="absolute -top-4 right-8 text-amber-400 animate-pulse" />
                                <Star size={18} className="absolute bottom-4 -left-4 text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-5 lg:sticky lg:top-24">
                            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                                <Zap size={18} className="text-blue-600" />
                                Danh mục
                            </h3>
                            <div className="space-y-2">
                                {FAQ_CATEGORIES.map(cat => {
                                    const CatIcon = cat.icon;
                                    const isActive = activeCategory === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${isActive
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                                                : 'hover:bg-slate-50 text-slate-600'
                                                }`}
                                        >
                                            <CatIcon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                                            <span className="font-semibold flex-1">{cat.name}</span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {cat.id === 'all' ? FAQ_DATA.length : FAQ_DATA.filter(f => f.category === cat.id).length}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* FAQ List */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-slate-600">
                                Hiển thị <strong className="text-slate-900">{filteredFaqs.length}</strong> câu hỏi
                                {searchTerm && <span> cho "<strong className="text-blue-600">{searchTerm}</strong>"</span>}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {filteredFaqs.map((faq, idx) => {
                                const isOpen = openItems.includes(idx);
                                const catInfo = getCategoryInfo(faq.category);
                                const CatIcon = catInfo.icon;

                                return (
                                    <div
                                        key={idx}
                                        className={`bg-white rounded-2xl border overflow-hidden transition-all ${isOpen ? 'border-blue-200 shadow-xl shadow-blue-500/10' : 'border-slate-100 shadow-sm hover:shadow-md'
                                            } ${faq.featured ? 'ring-2 ring-blue-500/20' : ''}`}
                                    >
                                        <button
                                            onClick={() => toggleItem(idx)}
                                            className="w-full flex items-start gap-4 p-5 sm:p-6 text-left hover:bg-slate-50/50 transition-colors"
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${faq.category === 'product' ? 'bg-blue-100 text-blue-600' :
                                                faq.category === 'payment' ? 'bg-emerald-100 text-emerald-600' :
                                                    faq.category === 'license' ? 'bg-purple-100 text-purple-600' :
                                                        'bg-amber-100 text-amber-600'
                                                }`}>
                                                <CatIcon size={20} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                        {catInfo.name}
                                                    </span>
                                                    {faq.featured && (
                                                        <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <Star size={10} fill="currentColor" /> Phổ biến
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-bold text-slate-900 text-lg leading-snug">
                                                    {faq.question}
                                                </h4>
                                            </div>

                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isOpen ? 'bg-blue-500 text-white rotate-0' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                                            </div>
                                        </button>

                                        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                                            <div className="px-5 sm:px-6 pb-5 sm:pb-6 pl-20">
                                                <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filteredFaqs.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search size={32} className="text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy kết quả</h3>
                                <p className="text-slate-500 mb-6">Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác</p>
                                <button
                                    onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
                                    className="text-blue-600 font-semibold hover:underline"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="mt-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl" />
                    <div className="relative z-10 grid md:grid-cols-2 gap-8 p-8 sm:p-12 items-center">
                        <div className="text-white">
                            <MessageCircle size={40} className="mb-4 opacity-80" />
                            <h3 className="text-2xl sm:text-3xl font-black mb-3">Không tìm thấy câu trả lời?</h3>
                            <p className="text-blue-100 text-lg mb-2">Đội ngũ hỗ trợ sẵn sàng giúp đỡ bạn 24/7</p>
                            <div className="flex flex-wrap gap-4 mt-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <Mail size={16} />
                                    <span>support@digitalmart.vn</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={16} />
                                    <span>0971 386 588</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/contact"
                                className="flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                            >
                                Liên hệ ngay
                                <ArrowRight size={18} />
                            </Link>
                            <Link
                                href="/community"
                                className="flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all backdrop-blur-sm"
                            >
                                Tham gia cộng đồng
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
