'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowRight,
    BarChart3,
    Check,
    CheckCircle2,
    ChevronRight,
    ClipboardCheck,
    Copy,
    FileText,
    Globe2,
    Handshake,
    Home,
    Layers3,
    Link2,
    Loader2,
    Megaphone,
    MessageCircle,
    MousePointerClick,
    PenTool,
    Send,
    ShieldCheck,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useToast } from '@/context/ToastContext';

function AffiliatePageContent() {
    const router = useRouter();
    const { user, profile, registerAffiliate } = useSupabaseAuth();
    const { addToast } = useToast();
    const [copied, setCopied] = useState(false);
    const [registering, setRegistering] = useState(false);

    const partnerCode = profile?.affiliate_code || 'PARTNER';
    const partnerLink = typeof window !== 'undefined'
        ? `${window.location.origin}?ref=${partnerCode}`
        : `https://webgiare.id.vn?ref=${partnerCode}`;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(partnerLink);
        setCopied(true);
        addToast('Đã sao chép link giới thiệu', 'success');
        window.setTimeout(() => setCopied(false), 1800);
    };

    const handleJoin = async () => {
        if (!user) {
            router.push('/login?redirect=/affiliate');
            return;
        }

        if (profile?.is_affiliate) {
            router.push('/affiliate/dashboard');
            return;
        }

        setRegistering(true);
        try {
            const { error } = await registerAffiliate();
            if (error) throw error;
            addToast('Đã kích hoạt hồ sơ đối tác giới thiệu', 'success');
            router.push('/affiliate/dashboard');
        } catch (error: any) {
            addToast(error?.message || 'Không thể kích hoạt đối tác lúc này', 'error');
        } finally {
            setRegistering(false);
        }
    };

    const metrics = [
        { label: 'Ghi nhận nguồn', value: '30 ngày', icon: MousePointerClick },
        { label: 'Hình thức', value: 'Lead tư vấn', icon: MessageCircle },
        { label: 'Đối soát', value: 'Thủ công', icon: ClipboardCheck },
        { label: 'Phù hợp', value: 'Creator/Agency', icon: Users },
    ];

    const steps = [
        {
            icon: Handshake,
            title: 'Đăng ký đối tác',
            desc: 'Kích hoạt hồ sơ đối tác và nhận mã giới thiệu riêng để chia sẻ.',
        },
        {
            icon: Link2,
            title: 'Chia sẻ link demo',
            desc: 'Gửi link website, mẫu demo hoặc bài viết cho người đang cần làm web.',
        },
        {
            icon: Send,
            title: 'Khách gửi yêu cầu',
            desc: 'Khi khách để lại form tư vấn, nguồn giới thiệu sẽ được ghi nhận.',
        },
        {
            icon: CheckCircle2,
            title: 'Đối soát quyền lợi',
            desc: 'Sau khi nhu cầu được xác nhận, quyền lợi đối tác được xử lý thủ công.',
        },
    ];

    const partnerTypes = [
        'Freelancer thiết kế, marketing, content',
        'Agency nhỏ cần thêm mẫu demo để tư vấn khách',
        'Creator/blogger chia sẻ kiến thức làm website',
        'Bạn bè giới thiệu khách cần landing page, portfolio hoặc dashboard',
    ];

    const benefits = [
        {
            icon: Layers3,
            title: 'Kho demo dễ tư vấn',
            desc: 'Dùng các mẫu portfolio, landing page, dashboard và template để khách hình dung nhanh phương án triển khai.',
        },
        {
            icon: Globe2,
            title: 'Gắn mã theo mọi link',
            desc: 'Chia sẻ trang chủ, trang mẫu demo, blog hoặc form liên hệ, hệ thống vẫn có thể ghi nhận nguồn ref.',
        },
        {
            icon: TrendingUp,
            title: 'Theo dõi lead rõ ràng',
            desc: 'Dashboard hiển thị lượt giới thiệu, trạng thái xác nhận và quyền lợi đang chờ đối soát.',
        },
        {
            icon: ShieldCheck,
            title: 'Phù hợp catalogue',
            desc: 'Không checkout, không giỏ hàng công khai. Mọi nhu cầu được xử lý qua tư vấn để giữ site đúng định hướng demo.',
        },
    ];

    const toolkits = [
        { icon: Link2, title: 'Link giới thiệu', desc: 'Tự động gắn mã ref vào trang demo hoặc bài viết.' },
        { icon: Megaphone, title: 'Mẫu demo nổi bật', desc: 'Chọn nhanh giao diện dễ tư vấn cho từng nhóm khách.' },
        { icon: PenTool, title: 'Nội dung gợi ý', desc: 'Dùng blog/case study để tăng độ tin cậy trước khi khách gửi form.' },
    ];

    const faqs = [
        {
            q: 'Chương trình này có phải bán hàng trực tiếp không?',
            a: 'Không. Site đang ở chế độ portfolio/catalogue, đối tác chỉ giới thiệu khách có nhu cầu tư vấn triển khai website hoặc landing page.',
        },
        {
            q: 'Link giới thiệu dùng ở đâu?',
            a: 'Bạn có thể chia sẻ trang chủ, trang mẫu demo, bài blog hoặc form liên hệ kèm mã ref. Khi khách gửi yêu cầu, hệ thống sẽ ghi nhận nguồn.',
        },
        {
            q: 'Quyền lợi đối tác được tính như thế nào?',
            a: 'Quyền lợi được đối soát thủ công theo chất lượng lead và dự án đã xác nhận, tránh tự động hóa kiểu checkout/bán hàng.',
        },
    ];

    return (
        <main className="min-h-screen bg-[#f6f8fb] font-sans text-slate-900">
            <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-orange-600">
                        <Home size={17} />
                        Trang chủ
                    </Link>
                    <div className="hidden items-center gap-2 text-sm font-bold text-slate-400 sm:flex">
                        <span>Portfolio</span>
                        <ChevronRight size={14} />
                        <span className="text-slate-900">Đối tác giới thiệu</span>
                    </div>
                    <button
                        onClick={handleJoin}
                        disabled={registering}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-orange-600 disabled:opacity-60"
                    >
                        {registering ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
                        Dashboard
                    </button>
                </div>
            </nav>

            <section className="relative overflow-hidden bg-slate-950 text-white">
                <div className="absolute inset-0">
                    <Image
                        src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1800&q=80"
                        alt="Đối tác trao đổi dự án website"
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover opacity-[0.24]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/88 to-slate-950" />
                </div>

                <div className="absolute left-10 top-20 h-24 w-24 rounded-full border border-orange-400/20" />
                <div className="absolute right-[18%] top-28 h-3 w-3 rounded-full bg-orange-400 shadow-[0_0_30px_rgba(249,115,22,0.8)]" />
                <div className="absolute bottom-10 right-8 h-44 w-44 rounded-full bg-orange-500/10 blur-3xl" />

                <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:px-8 lg:py-20">
                    <div className="max-w-3xl">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-orange-300 backdrop-blur">
                            <Sparkles size={14} />
                            Kênh đối tác giới thiệu
                        </span>
                        <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                            Biến mạng lưới của bạn thành nguồn lead tư vấn website chất lượng
                        </h1>
                        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                            Chia sẻ thư viện portfolio/demo của Web Giá Rẻ tới khách có nhu cầu. Khi khách gửi yêu cầu tư vấn, nguồn giới thiệu của bạn được ghi nhận để đối soát quyền lợi.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <button
                                onClick={handleJoin}
                                disabled={registering}
                                className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-7 py-4 text-base font-black text-white shadow-lg shadow-orange-600/25 transition hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-orange-600/35 disabled:opacity-60"
                            >
                                {registering ? <Loader2 size={20} className="animate-spin" /> : <Handshake size={20} />}
                                {profile?.is_affiliate ? 'Vào dashboard đối tác' : 'Đăng ký đối tác'}
                                <ArrowRight size={18} />
                            </button>
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-7 py-4 text-base font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
                            >
                                Xem thư viện demo
                            </Link>
                        </div>

                        <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
                            {[
                                ['Không giỏ hàng', 'Catalogue mode'],
                                ['Tư vấn thật', 'Lead form'],
                                ['Đối soát rõ', 'Manual review'],
                            ].map(([title, desc]) => (
                                <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                                    <p className="text-sm font-black text-white">{title}</p>
                                    <p className="mt-1 text-xs font-bold text-slate-400">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <aside className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur">
                        <div className="rounded-2xl bg-white p-4 text-slate-950 shadow-xl">
                            <p className="text-xs font-black uppercase tracking-widest text-orange-500">Link giới thiệu</p>
                            <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                                <Link2 size={18} className="shrink-0 text-orange-500" />
                                <input
                                    value={partnerLink}
                                    readOnly
                                    className="min-w-0 flex-1 bg-transparent font-mono text-xs font-bold text-slate-700 outline-none"
                                />
                            </div>
                            <button
                                onClick={handleCopy}
                                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-orange-600"
                            >
                                {copied ? <Check size={17} /> : <Copy size={17} />}
                                {copied ? 'Đã sao chép' : 'Sao chép link'}
                            </button>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            {metrics.map(metric => (
                                <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:-translate-y-0.5 hover:bg-white/15">
                                    <metric.icon size={18} className="text-orange-300" />
                                    <p className="mt-2 text-lg font-black text-white">{metric.value}</p>
                                    <p className="text-xs font-bold text-slate-300">{metric.label}</p>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {benefits.map(item => (
                        <article key={item.title} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white transition group-hover:bg-orange-600">
                                <item.icon size={22} />
                            </div>
                            <h3 className="mt-5 text-lg font-black text-slate-950">{item.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
                <div className="mb-8 max-w-2xl">
                    <p className="text-xs font-black uppercase tracking-widest text-orange-500">Quy trình</p>
                    <h2 className="mt-2 text-3xl font-black text-slate-950">Từ chia sẻ link đến ghi nhận lead tư vấn</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                        Mọi thứ được thiết kế phù hợp với mô hình catalogue/demo: không checkout, không giỏ hàng, tập trung vào nhu cầu tư vấn thật.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step, index) => (
                        <article key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10">
                            <div className="flex items-center justify-between">
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                                    <step.icon size={22} />
                                </span>
                                <span className="text-3xl font-black text-slate-100">{index + 1}</span>
                            </div>
                            <h3 className="mt-5 text-lg font-black text-slate-950">{step.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{step.desc}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="border-y border-slate-200 bg-white">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-16">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-orange-500">Ai phù hợp?</p>
                        <h2 className="mt-2 text-3xl font-black text-slate-950">Không cần bán hàng, chỉ cần giới thiệu đúng nhu cầu</h2>
                        <p className="mt-4 text-sm leading-7 text-slate-600">
                            Chương trình phù hợp với người có tệp khách cần website, landing page, dashboard, portfolio hoặc muốn tham khảo mẫu giao diện trước khi triển khai.
                        </p>
                        <Link
                            href="/contact"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-700"
                        >
                            Trao đổi hợp tác
                            <MessageCircle size={17} />
                        </Link>
                    </div>

                    <div className="grid gap-3">
                        {partnerTypes.map(item => (
                            <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-500" />
                                <p className="text-sm font-bold leading-6 text-slate-700">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
                    <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-950 p-7 text-white shadow-xl">
                        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />
                        <div className="relative">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-orange-300">
                                <Star size={13} />
                                Partner toolkit
                            </span>
                            <h2 className="mt-5 text-3xl font-black">Bộ công cụ hỗ trợ chia sẻ chuyên nghiệp</h2>
                            <p className="mt-3 text-sm leading-7 text-slate-300">
                                Dashboard cung cấp link nhanh, danh sách mẫu demo, lịch sử lead và trạng thái đối soát để bạn theo dõi trọn vòng giới thiệu.
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {toolkits.map(item => (
                            <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                                    <item.icon size={21} />
                                </div>
                                <h3 className="mt-4 text-base font-black text-slate-950">{item.title}</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8 lg:py-16">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
                    <ShieldCheck size={28} className="text-orange-500" />
                    <h2 className="mt-4 text-2xl font-black text-slate-950">Nguyên tắc rõ ràng</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                        Ghi nhận referral dùng cho tư vấn triển khai. Các quyền lợi được đối soát thủ công, minh bạch theo chất lượng lead và dự án đã xác nhận.
                    </p>
                </div>
                <div className="space-y-3 lg:col-span-2">
                    {faqs.map(item => (
                        <details key={item.q} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-black text-slate-950">
                                {item.q}
                                <ChevronRight size={18} className="transition group-open:rotate-90" />
                            </summary>
                            <p className="mt-3 text-sm leading-7 text-slate-600">{item.a}</p>
                        </details>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-2xl bg-slate-950 p-8 text-white shadow-xl sm:p-10">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-orange-300">Sẵn sàng bắt đầu?</p>
                            <h2 className="mt-2 text-3xl font-black">Kích hoạt hồ sơ đối tác và chia sẻ link demo ngay hôm nay</h2>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                                Bạn có thể bắt đầu bằng trang chủ, blog hoặc bất kỳ mẫu demo nào trong thư viện portfolio.
                            </p>
                        </div>
                        <button
                            onClick={handleJoin}
                            disabled={registering}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-4 text-sm font-black text-white transition hover:bg-orange-700 disabled:opacity-60"
                        >
                            {registering ? <Loader2 size={18} className="animate-spin" /> : <Target size={18} />}
                            {profile?.is_affiliate ? 'Mở dashboard' : 'Đăng ký đối tác'}
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default function AffiliatePage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-9 w-9 animate-spin text-orange-600" />
            </div>
        }>
            <AffiliatePageContent />
        </Suspense>
    );
}
