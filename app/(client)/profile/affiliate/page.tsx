'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    Handshake,
    Home,
    Link2,
    Loader2,
    MessageCircle,
    Share2,
} from 'lucide-react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';

export default function ProfileAffiliatePage() {
    const router = useRouter();
    const { user, profile, loading } = useSupabaseAuth();

    useEffect(() => {
        if (!loading && user && profile?.is_affiliate) {
            router.push('/affiliate/dashboard');
        }
    }, [loading, user, profile, router]);

    if (loading || profile?.is_affiliate) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-orange-600" />
                    <p className="font-bold text-slate-500">{profile?.is_affiliate ? 'Đang chuyển đến dashboard...' : 'Đang tải...'}</p>
                </div>
            </div>
        );
    }

    const steps = [
        { icon: Handshake, title: 'Đăng ký đối tác', desc: 'Kích hoạt hồ sơ giới thiệu và nhận mã ref riêng.' },
        { icon: Link2, title: 'Chia sẻ link', desc: 'Gửi link trang chủ, blog hoặc mẫu demo cho người có nhu cầu.' },
        { icon: MessageCircle, title: 'Khách gửi tư vấn', desc: 'Lead tư vấn được ghi nhận theo nguồn giới thiệu.' },
        { icon: CheckCircle2, title: 'Đối soát thủ công', desc: 'Quyền lợi xử lý theo dự án đã xác nhận.' },
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-orange-600">
                        <Home size={18} />
                        Trang chủ
                    </Link>
                    <div className="hidden items-center gap-2 text-sm font-bold text-slate-400 sm:flex">
                        <Link href="/profile" className="hover:text-orange-600">Hồ sơ</Link>
                        <ChevronRight size={14} />
                        <span className="text-slate-900">Đối tác</span>
                    </div>
                </div>
            </nav>

            <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
                <div className="overflow-hidden rounded-2xl bg-slate-950 p-8 text-white shadow-xl sm:p-10">
                    <div className="max-w-2xl">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-orange-300">
                            <Share2 size={14} />
                            Kênh đối tác giới thiệu
                        </span>
                        <h1 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">
                            Giới thiệu khách cần website, landing page hoặc mẫu demo triển khai
                        </h1>
                        <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                            Chương trình phù hợp với mô hình portfolio/catalogue: không checkout, không giỏ hàng, chỉ ghi nhận khách để lại nhu cầu tư vấn thật.
                        </p>
                        <Link
                            href="/affiliate"
                            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-700"
                        >
                            Xem chương trình đối tác
                            <ArrowRight size={17} />
                        </Link>
                    </div>
                </div>

                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map(step => (
                        <article key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                                <step.icon size={22} />
                            </span>
                            <h2 className="mt-4 text-base font-black text-slate-950">{step.title}</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{step.desc}</p>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}
