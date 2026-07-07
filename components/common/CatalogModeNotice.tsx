'use client';

import Link from 'next/link';
import { ArrowRight, Eye, MessageSquareText, Phone, ShieldCheck } from 'lucide-react';

interface CatalogModeNoticeProps {
    title?: string;
    description?: string;
}

export default function CatalogModeNotice({
    title = 'Website đang hoạt động ở chế độ portfolio/demo',
    description = 'Web Giá Rẻ - Portfolio hiện ưu tiên tham khảo mẫu và tư vấn. Bạn có thể xem demo, lưu mẫu quan tâm và gửi nhu cầu để được phản hồi phù hợp.',
}: CatalogModeNoticeProps) {
    return (
        <main className="min-h-screen bg-[#fffaf5] px-4 py-12 text-slate-950">
            <section className="mx-auto grid min-h-[70vh] max-w-5xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[30px] border border-orange-100 bg-white p-7 shadow-2xl shadow-orange-100/60 sm:p-10">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-orange-700">
                        <MessageSquareText size={15} />
                        Portfolio / Demo
                    </div>
                    <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                        {title}
                    </h1>
                    <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-600">
                        {description}
                    </p>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-4 text-sm font-black text-white shadow-xl shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-700"
                        >
                            Nhận tư vấn
                            <ArrowRight size={18} />
                        </Link>
                        <Link
                            href="/products"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-700 transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                        >
                            <Eye size={18} />
                            Xem mẫu demo
                        </Link>
                    </div>
                </div>

                <div className="rounded-[30px] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-200/70 sm:p-8">
                    <h2 className="text-xl font-black">Bạn vẫn có thể làm gì?</h2>
                    <div className="mt-6 space-y-3">
                        {[
                            'Xem demo và ảnh preview mẫu giao diện.',
                            'Gửi nhu cầu để nhận tư vấn công nghệ, chi phí và thời gian.',
                            'Đặt lịch trao đổi trước khi chọn hướng triển khai phù hợp.',
                        ].map((item) => (
                            <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                                <ShieldCheck className="mt-0.5 shrink-0 text-emerald-300" size={18} />
                                <p className="text-sm font-semibold leading-6 text-slate-200">{item}</p>
                            </div>
                        ))}
                    </div>

                    <a
                        href="tel:0971386588"
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-black text-slate-950 transition hover:bg-orange-50"
                    >
                        <Phone size={18} />
                        0971 386 588
                    </a>
                </div>
            </section>
        </main>
    );
}
