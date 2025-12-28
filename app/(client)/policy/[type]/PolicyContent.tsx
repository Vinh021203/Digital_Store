'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Home, ChevronRight, FileText, Shield, Scale, RefreshCcw, Key,
    Sparkles, Star, CheckCircle, ArrowRight, BookOpen, Clock,
    AlertCircle, Lock, Eye, Users, CreditCard, Download
} from 'lucide-react';

const POLICY_CONTENT: Record<string, {
    title: string;
    icon: any;
    description: string;
    badge: string;
    badgeColor: string;
    heroImage: string;
    sections: { title: string; icon: any; content: string }[];
}> = {
    privacy: {
        title: 'Chính sách Bảo mật',
        icon: Shield,
        description: 'Cam kết bảo vệ thông tin cá nhân và quyền riêng tư của bạn',
        badge: 'BẢO MẬT',
        badgeColor: 'emerald',
        heroImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1920&q=80',
        sections: [
            {
                title: 'Thu thập thông tin',
                icon: Users,
                content: 'Chúng tôi thu thập thông tin khi bạn đăng ký tài khoản, mua sản phẩm, hoặc liên hệ với chúng tôi. Thông tin bao gồm: họ tên, email, số điện thoại. Chúng tôi chỉ thu thập những thông tin cần thiết để cung cấp dịch vụ tốt nhất cho bạn.'
            },
            {
                title: 'Sử dụng thông tin',
                icon: Eye,
                content: 'Thông tin của bạn được sử dụng để xử lý đơn hàng, gửi thông báo quan trọng, hỗ trợ khách hàng và cải thiện trải nghiệm dịch vụ. Chúng tôi cam kết không sử dụng thông tin vào mục đích ngoài phạm vi đã thông báo.'
            },
            {
                title: 'Bảo vệ thông tin',
                icon: Lock,
                content: 'Chúng tôi áp dụng các biện pháp bảo mật tiên tiến bao gồm mã hóa SSL 256-bit, firewall và các giao thức bảo mật khác để bảo vệ thông tin cá nhân của bạn khỏi truy cập, sử dụng hoặc tiết lộ trái phép.'
            },
            {
                title: 'Chia sẻ thông tin',
                icon: Users,
                content: 'Chúng tôi không bán, trao đổi hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba, trừ khi được pháp luật yêu cầu hoặc cần thiết để cung cấp dịch vụ bạn đã yêu cầu (ví dụ: đối tác thanh toán).'
            }
        ]
    },
    terms: {
        title: 'Điều khoản Sử dụng',
        icon: Scale,
        description: 'Quy định và điều kiện sử dụng dịch vụ của DigitalMart',
        badge: 'ĐIỀU KHOẢN',
        badgeColor: 'blue',
        heroImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&q=80',
        sections: [
            {
                title: 'Điều khoản chung',
                icon: FileText,
                content: 'Bằng việc truy cập và sử dụng DigitalMart, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu trong tài liệu này. Nếu bạn không đồng ý với bất kỳ phần nào, vui lòng không sử dụng dịch vụ của chúng tôi.'
            },
            {
                title: 'Tài khoản người dùng',
                icon: Users,
                content: 'Bạn có trách nhiệm bảo mật thông tin đăng nhập và chịu trách nhiệm cho mọi hoạt động trên tài khoản của mình. Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép hoặc vi phạm bảo mật.'
            },
            {
                title: 'Sử dụng sản phẩm',
                icon: Download,
                content: 'Sản phẩm mua tại DigitalMart chỉ được sử dụng theo license đã chọn. Nghiêm cấm phân phối lại, chia sẻ hoặc bán lại sản phẩm dưới mọi hình thức. Vi phạm sẽ bị chấm dứt tài khoản và xử lý theo pháp luật.'
            },
            {
                title: 'Quyền sở hữu trí tuệ',
                icon: Shield,
                content: 'Tất cả nội dung trên DigitalMart bao gồm nhưng không giới hạn: logo, thiết kế, văn bản, hình ảnh và mã nguồn đều được bảo vệ bởi luật bản quyền và các quyền sở hữu trí tuệ hiện hành.'
            }
        ]
    },
    refund: {
        title: 'Chính sách Hoàn tiền',
        icon: RefreshCcw,
        description: 'Quy định về hoàn tiền và đổi trả sản phẩm số',
        badge: 'HOÀN TIỀN',
        badgeColor: 'amber',
        heroImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1920&q=80',
        sections: [
            {
                title: 'Điều kiện hoàn tiền',
                icon: CheckCircle,
                content: 'Bạn có thể yêu cầu hoàn tiền trong vòng 7 ngày kể từ ngày mua nếu sản phẩm không đúng mô tả, không hoạt động như quảng cáo, hoặc có lỗi kỹ thuật nghiêm trọng không thể khắc phục.'
            },
            {
                title: 'Quy trình yêu cầu',
                icon: FileText,
                content: 'Gửi yêu cầu hoàn tiền đến email veutong961@gmail.com với thông tin: mã đơn hàng, email đăng ký, lý do hoàn tiền chi tiết, và bằng chứng (screenshot/video nếu có). Chúng tôi sẽ xem xét trong 24-48 giờ.'
            },
            {
                title: 'Thời gian xử lý',
                icon: Clock,
                content: 'Yêu cầu hợp lệ sẽ được xử lý trong 3-5 ngày làm việc. Tiền sẽ được hoàn về phương thức thanh toán gốc trong 7-14 ngày tùy thuộc vào ngân hàng hoặc cổng thanh toán.'
            },
            {
                title: 'Trường hợp không hoàn tiền',
                icon: AlertCircle,
                content: 'Chúng tôi không hoàn tiền trong các trường hợp: bạn đã tải và sử dụng sản phẩm; yêu cầu sau 7 ngày kể từ ngày mua; vi phạm điều khoản sử dụng; thay đổi ý kiến đơn giản mà không có lý do hợp lệ.'
            }
        ]
    },
    license: {
        title: 'Điều khoản License',
        icon: Key,
        description: 'Chi tiết về các loại license và quyền sử dụng sản phẩm',
        badge: 'LICENSE',
        badgeColor: 'purple',
        heroImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80',
        sections: [
            {
                title: 'License Regular',
                icon: Key,
                content: 'Cho phép sử dụng cho 1 dự án thương mại hoặc cá nhân. License này phù hợp cho freelancer, dự án đơn lẻ, hoặc website cá nhân. Không được phân phối lại hoặc chuyển nhượng cho người khác.'
            },
            {
                title: 'License Extended',
                icon: Star,
                content: 'Cho phép sử dụng không giới hạn số dự án. Có thể tích hợp vào sản phẩm thương mại mà bạn bán cho khách hàng. Lý tưởng cho agency, studio hoặc doanh nghiệp có nhiều dự án.'
            },
            {
                title: 'Những gì được phép',
                icon: CheckCircle,
                content: 'Sử dụng cho dự án cá nhân hoặc thương mại • Chỉnh sửa và tùy biến sản phẩm theo nhu cầu • Sử dụng trong portfolio và showcase • Tạo sản phẩm phái sinh (với Extended License)'
            },
            {
                title: 'Những gì không được phép',
                icon: AlertCircle,
                content: 'Bán lại hoặc phân phối sản phẩm gốc • Chia sẻ file hoặc license key với người khác • Sử dụng trong nhiều dự án với Regular License • Xóa bỏ thông tin bản quyền hoặc watermark'
            }
        ]
    }
};

interface PolicyContentProps {
    type: string;
}

export default function PolicyContent({ type }: PolicyContentProps) {
    const policy = POLICY_CONTENT[type];

    if (!policy) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
                <div className="relative z-10 text-center px-4">
                    <div className="w-24 h-24 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-700">
                        <FileText size={48} className="text-slate-600" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-3">Không tìm thấy trang</h2>
                    <p className="text-slate-400 mb-8 text-lg">Trang chính sách này không tồn tại.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-blue-500/25 transition-all"
                    >
                        <Home size={20} /> Về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    const Icon = policy.icon;
    const badgeColors: Record<string, string> = {
        emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
        blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
        amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
        purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
    };
    const iconColors: Record<string, string> = {
        emerald: 'from-emerald-500 to-green-600',
        blue: 'from-blue-500 to-indigo-600',
        amber: 'from-amber-500 to-orange-600',
        purple: 'from-purple-500 to-pink-600',
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section with Background */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src={policy.heroImage}
                        alt={policy.title}
                        fill
                        className="object-cover opacity-20"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/80" />
                </div>

                {/* Decorative Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl" />
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
                                <span className="text-white font-semibold">{policy.title}</span>
                            </div>

                            {/* Badge */}
                            <div className={`inline-flex items-center gap-2 ${badgeColors[policy.badgeColor]} border px-4 py-2 rounded-full text-sm font-bold mb-6 backdrop-blur-sm`}>
                                <Icon size={16} />
                                {policy.badge}
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                                {policy.title}
                            </h1>

                            <p className="text-slate-400 text-lg sm:text-xl max-w-md mx-auto lg:mx-0 mb-8">
                                {policy.description}
                            </p>

                            {/* Meta Info */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <Clock size={18} className="text-slate-400" />
                                    <span>Cập nhật: <strong className="text-white">{new Date().toLocaleDateString('vi-VN')}</strong></span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <BookOpen size={18} className="text-slate-400" />
                                    <span><strong className="text-white">{policy.sections.length}</strong> mục</span>
                                </div>
                            </div>
                        </div>

                        {/* Right - Icon Display */}
                        <div className="hidden lg:flex justify-center">
                            <div className="relative">
                                <div className={`absolute -inset-8 bg-gradient-to-r ${iconColors[policy.badgeColor]} rounded-full blur-3xl opacity-30`} />
                                <div className={`relative w-48 h-48 bg-gradient-to-br ${iconColors[policy.badgeColor]} rounded-3xl flex items-center justify-center shadow-2xl transform rotate-6 hover:rotate-0 transition-transform`}>
                                    <Icon size={80} className="text-white" />
                                </div>

                                {/* Floating Elements */}
                                <Sparkles size={28} className="absolute -top-4 -right-4 text-amber-400 animate-pulse" />
                                <Star size={20} className="absolute bottom-4 -left-6 text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                                <CheckCircle size={24} className="absolute top-8 -left-8 text-emerald-400 animate-pulse" style={{ animationDelay: '1s' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar - Quick Links */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-5 lg:sticky lg:top-24">
                            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                                <BookOpen size={18} className="text-blue-600" />
                                Chính sách
                            </h3>
                            <div className="space-y-2">
                                {Object.entries(POLICY_CONTENT).map(([key, p]) => {
                                    const PIcon = p.icon;
                                    const isActive = type === key;
                                    return (
                                        <Link
                                            key={key}
                                            href={`/policy/${key}`}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${isActive
                                                ? `bg-gradient-to-r ${iconColors[p.badgeColor]} text-white shadow-lg`
                                                : 'hover:bg-slate-50 text-slate-600'
                                                }`}
                                        >
                                            <PIcon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                                            <span className="font-semibold text-sm">{p.title}</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Contact CTA */}
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <p className="text-sm text-slate-500 mb-3">Có câu hỏi?</p>
                                <Link
                                    href="/contact"
                                    className="flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all text-sm"
                                >
                                    Liên hệ hỗ trợ <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Content Sections */}
                    <div className="lg:col-span-3 space-y-6">
                        {policy.sections.map((section, idx) => {
                            const SectionIcon = section.icon;
                            return (
                                <div
                                    key={idx}
                                    className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                                >
                                    <div className="p-6 sm:p-8">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 bg-gradient-to-br ${iconColors[policy.badgeColor]} rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                                                <SectionIcon size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                                                    {idx + 1}. {section.title}
                                                </h2>
                                                <p className="text-slate-600 leading-relaxed text-base sm:text-lg">
                                                    {section.content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Bottom Note */}
                        <div className="bg-slate-100 rounded-2xl p-6 sm:p-8 border border-slate-200">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <AlertCircle size={24} className="text-slate-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">Lưu ý quan trọng</h3>
                                    <p className="text-slate-600">
                                        Các điều khoản này có thể được cập nhật định kỳ. Chúng tôi khuyến khích bạn
                                        kiểm tra lại trang này thường xuyên để nắm bắt các thay đổi mới nhất.
                                        Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn
                                        chấp nhận các điều khoản mới.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
