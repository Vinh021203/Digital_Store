'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowRight, BookOpen, CheckCircle2, ChevronRight, Clock3,
    ExternalLink, Facebook, Headphones, Home, Mail, MapPin,
    MessageCircle, Phone, Send, ShieldCheck, Sparkles, UserRound,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const reveal = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const contactMethods = [
    {
        icon: Mail,
        label: 'Email hỗ trợ',
        value: 'veutong961@gmail.com',
        detail: 'Phù hợp khi cần gửi mã đơn hoặc hình ảnh',
        href: 'mailto:veutong961@gmail.com',
    },
    {
        icon: Phone,
        label: 'Điện thoại',
        value: '0971 386 588',
        detail: 'Trao đổi nhanh trong giờ làm việc',
        href: 'tel:0971386588',
    },
    {
        icon: Facebook,
        label: 'Facebook',
        value: 'Lương Vinh',
        detail: 'Nhắn tin để được phản hồi trực tiếp',
        href: 'https://www.facebook.com/Ltvinh212',
    },
];

const supportSteps = [
    { icon: MessageCircle, title: 'Gửi yêu cầu', detail: 'Mô tả nhu cầu, sản phẩm hoặc vấn đề bạn gặp.' },
    { icon: UserRound, title: 'Mình trực tiếp kiểm tra', detail: 'Không qua tổng đài hoặc bộ phận trung gian.' },
    { icon: CheckCircle2, title: 'Phản hồi rõ ràng', detail: 'Đề xuất hướng xử lý phù hợp và dễ thực hiện.' },
];

export default function ContactContent() {
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const body = [
            `Họ tên: ${formData.name}`,
            `Email phản hồi: ${formData.email}`,
            '',
            formData.message,
        ].join('\n');

        const mailto = `mailto:veutong961@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(body)}`;
        addToast('Đang mở ứng dụng email với nội dung đã điền sẵn', 'success');
        window.location.href = mailto;
    };

    return (
        <main className="min-h-screen bg-[#f8fafc] text-slate-950">
            <section className="relative overflow-hidden border-b border-orange-100 bg-[#fffaf6]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(234,88,12,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(234,88,12,0.055)_1px,transparent_1px)] bg-[size:48px_48px]" />

                <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 sm:pb-16 lg:px-8">
                    <nav className="mb-8 flex items-center gap-2 text-sm font-semibold text-slate-500" aria-label="Breadcrumb">
                        <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-orange-600">
                            <Home size={15} /> Trang chủ
                        </Link>
                        <ChevronRight size={14} />
                        <span className="text-slate-900">Liên hệ</span>
                    </nav>

                    <div className="grid items-center gap-9 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
                        <motion.div initial="hidden" animate="visible" variants={stagger}>
                            <motion.div variants={reveal} className="mb-5 flex w-fit items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-950 text-orange-400">
                                    <Headphones size={21} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-extrabold">Hỗ trợ trực tiếp</p>
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                                    </div>
                                    <p className="mt-0.5 text-xs font-medium text-slate-500">Tiếp nhận bởi chính người xây dựng website</p>
                                </div>
                            </motion.div>

                            <motion.div variants={reveal} className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3.5 py-2 text-[10px] font-extrabold uppercase text-orange-700 shadow-sm sm:text-xs">
                                <Sparkles size={15} /> Trao đổi rõ ràng, hỗ trợ đúng vấn đề
                            </motion.div>

                            <motion.h1 variants={reveal} className="mt-5 max-w-3xl text-3xl font-black leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
                                Bạn cần tìm một giao diện <span className="text-orange-600">phù hợp hơn?</span>
                            </motion.h1>

                            <motion.p variants={reveal} className="mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base sm:leading-8">
                                Hãy gửi nhu cầu, công nghệ đang sử dụng hoặc mã đơn hàng. Mình sẽ trực tiếp kiểm tra và phản hồi trong phạm vi hỗ trợ của sản phẩm.
                            </motion.p>

                            <motion.div variants={reveal} className="mt-7 grid grid-cols-2 gap-3 sm:flex">
                                <a href="mailto:veutong961@gmail.com" className="inline-flex min-w-0 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3.5 text-xs font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700 sm:px-6 sm:text-sm">
                                    <Mail size={17} /> <span className="truncate">Gửi email</span>
                                </a>
                                <a href="tel:0971386588" className="inline-flex min-w-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-xs font-bold text-slate-700 transition hover:border-orange-200 hover:text-orange-700 sm:px-6 sm:text-sm">
                                    <Phone size={17} /> 0971 386 588
                                </a>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 24, scale: 0.98 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-white shadow-[0_26px_60px_rgba(15,23,42,0.18)]"
                        >
                            <div className="flex items-center gap-4 border-b border-white/10 p-5 sm:p-6">
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-slate-800">
                                    <Image src="/luongvinh.jpg" alt="Lương Thế Vinh" fill priority sizes="64px" className="object-cover object-[center_30%]" />
                                </div>
                                <div>
                                    <p className="text-lg font-extrabold">Lương Thế Vinh</p>
                                    <p className="mt-1 text-xs font-semibold text-orange-300 sm:text-sm">Người xây dựng Shop Web rẻ</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 border-b border-white/10">
                                <div className="border-r border-white/10 p-5">
                                    <Clock3 size={19} className="text-orange-400" />
                                    <p className="mt-3 text-xs font-bold text-white">Thời gian phản hồi</p>
                                    <p className="mt-1 text-xs leading-5 text-slate-400">Trong ngày làm việc</p>
                                </div>
                                <div className="p-5">
                                    <MapPin size={19} className="text-orange-400" />
                                    <p className="mt-3 text-xs font-bold text-white">Khu vực</p>
                                    <p className="mt-1 text-xs leading-5 text-slate-400">Hạ Long, Quảng Ninh</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-5 sm:p-6">
                                <ShieldCheck size={20} className="mt-0.5 shrink-0 text-emerald-400" />
                                <p className="text-xs font-medium leading-6 text-slate-300">
                                    Thông tin bạn gửi chỉ được sử dụng để trao đổi và hỗ trợ yêu cầu hiện tại.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto grid max-w-7xl md:grid-cols-3">
                    {contactMethods.map((method, index) => (
                        <a
                            key={method.label}
                            href={method.href}
                            target={method.label === 'Facebook' ? '_blank' : undefined}
                            rel={method.label === 'Facebook' ? 'noopener noreferrer' : undefined}
                            className={`group flex items-center gap-4 px-5 py-5 transition hover:bg-orange-50/60 sm:px-7 ${index < contactMethods.length - 1 ? 'border-b border-slate-100 md:border-b-0 md:border-r' : ''}`}
                        >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 transition group-hover:bg-orange-600 group-hover:text-white">
                                <method.icon size={20} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase text-slate-400">{method.label}</p>
                                <p className="mt-1 truncate text-sm font-extrabold text-slate-900">{method.value}</p>
                                <p className="mt-1 hidden text-xs text-slate-500 sm:block">{method.detail}</p>
                            </div>
                            <ExternalLink size={15} className="ml-auto shrink-0 text-slate-300 transition group-hover:text-orange-600" />
                        </a>
                    ))}
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl items-start gap-7 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1fr_360px] lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.12 }}
                    variants={stagger}
                    className="space-y-5"
                >
                <motion.article variants={reveal} className="self-start overflow-hidden rounded-lg border border-slate-300 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                    <header className="border-b border-slate-200 p-5 sm:p-7">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-600 text-white">
                                <MessageCircle size={21} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black sm:text-2xl">Gửi nội dung cần hỗ trợ</h2>
                                <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">Form sẽ mở ứng dụng email với nội dung đã điền sẵn.</p>
                            </div>
                        </div>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-5 bg-[#fffdfb] p-5 sm:p-7">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <label className="block">
                                <span className="mb-2 block text-sm font-bold text-slate-700">Họ và tên <span className="text-orange-600">*</span></span>
                                <input
                                    type="text"
                                    required
                                    autoComplete="name"
                                    placeholder="Nguyễn Văn A"
                                    value={formData.name}
                                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                                    className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm font-medium shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                                />
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-sm font-bold text-slate-700">Email phản hồi <span className="text-orange-600">*</span></span>
                                <input
                                    type="email"
                                    required
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                                    className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm font-medium shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                                />
                            </label>
                        </div>

                        <label className="block">
                            <span className="mb-2 block text-sm font-bold text-slate-700">Chủ đề <span className="text-orange-600">*</span></span>
                            <input
                                type="text"
                                required
                                placeholder="Ví dụ: Cần tư vấn giao diện bán hàng"
                                value={formData.subject}
                                onChange={(event) => setFormData({ ...formData, subject: event.target.value })}
                                className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm font-medium shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-sm font-bold text-slate-700">Nội dung <span className="text-orange-600">*</span></span>
                            <textarea
                                rows={4}
                                required
                                placeholder="Mô tả nhu cầu, công nghệ, ngân sách dự kiến hoặc mã đơn hàng..."
                                value={formData.message}
                                onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                                className="min-h-32 w-full resize-y rounded-md border border-slate-300 bg-white px-4 py-3.5 text-sm font-medium leading-6 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                            />
                        </label>

                        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                <ShieldCheck size={15} className="text-emerald-600" /> Không chia sẻ thông tin với bên thứ ba.
                            </p>
                            <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-orange-600 px-6 text-sm font-bold text-white shadow-lg shadow-orange-100 transition hover:bg-orange-700">
                                <Send size={17} /> Soạn email
                            </button>
                        </div>
                    </form>
                </motion.article>

                    <motion.div
                        variants={reveal}
                        whileHover={{ y: -3 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                        className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.07)]"
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                            <div>
                                <p className="text-xs font-bold uppercase text-orange-600">Khu vực hoạt động</p>
                                <h2 className="mt-1 font-black text-slate-950">Hạ Long, Quảng Ninh</h2>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.08, rotate: -6 }}
                                className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-50 text-orange-600"
                            >
                                <MapPin size={19} />
                            </motion.div>
                        </div>
                        <iframe
                            title="Bản đồ khu vực Hạ Long, Quảng Ninh"
                            src="https://www.google.com/maps?q=Ha%20Long%2C%20Quang%20Ninh%2C%20Vietnam&z=12&output=embed"
                            width="100%"
                            height="280"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="block border-0 grayscale-[15%] transition duration-500 hover:grayscale-0"
                        />
                    </motion.div>
                </motion.div>

                <motion.aside
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={stagger}
                    className="space-y-5"
                >
                    <motion.div variants={reveal} whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="rounded-lg bg-slate-950 p-5 text-white shadow-[0_16px_35px_rgba(15,23,42,0.14)] sm:p-6">
                        <p className="text-xs font-bold uppercase text-orange-300">Quy trình hỗ trợ</p>
                        <h2 className="mt-2 text-xl font-black">Ba bước để xử lý nhanh hơn</h2>
                        <div className="mt-6 space-y-5">
                            {supportSteps.map((step, index) => (
                                <div key={step.title} className="flex gap-3">
                                    <motion.div whileHover={{ scale: 1.08 }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-orange-400">
                                        <step.icon size={17} />
                                    </motion.div>
                                    <div>
                                        <p className="text-sm font-bold">{index + 1}. {step.title}</p>
                                        <p className="mt-1 text-xs font-medium leading-5 text-slate-400">{step.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div variants={reveal} whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <BookOpen size={21} className="text-orange-600" />
                        <h2 className="mt-4 text-lg font-black">Xem hướng dẫn trước</h2>
                        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                            Blog có các bài chia sẻ về lựa chọn giao diện, triển khai và tối ưu website.
                        </p>
                        <a href="https://blog.webgiare.id.vn/" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700">
                            Đọc blog chia sẻ <ArrowRight size={16} />
                        </a>
                    </motion.div>

                    <motion.div variants={reveal} whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="rounded-lg border border-orange-200 bg-orange-50 p-5 shadow-sm sm:p-6">
                        <Clock3 size={21} className="text-orange-600" />
                        <h2 className="mt-4 text-lg font-black">Để được phản hồi nhanh</h2>
                        <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                            Hãy gửi kèm tên sản phẩm, mã đơn và ảnh chụp lỗi nếu yêu cầu liên quan đến đơn hàng.
                        </p>
                    </motion.div>
                </motion.aside>
            </section>
        </main>
    );
}
