'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    AlertCircle, ArrowRight, BadgeCheck, Banknote, CalendarDays, Check,
    CheckCircle2, ChevronRight, Clock3, Copy, CreditCard, Download,
    FileArchive, Headphones, Home, KeyRound, Loader2, LockKeyhole,
    PackageCheck, ReceiptText, RefreshCw, Search, ShieldCheck,
    ShoppingBag, Sparkles, XCircle,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useSiteMode } from '@/hooks/useSiteSettings';

interface TrackingItem {
    name: string;
    image: string | null;
    price: number;
    licenseType: string;
}

interface OrderData {
    id: number;
    status: string;
    total: number;
    discount: number;
    created_at: string;
    updated_at: string;
    payment_method: string | null;
    payment_id: string | null;
    billing_email: string | null;
    items: TrackingItem[];
}

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
};

const trustItems = [
    { icon: ShieldCheck, title: 'Bảo mật dữ liệu', detail: 'Chỉ hiển thị đơn thuộc tài khoản', number: '01', tone: 'bg-orange-50 text-orange-600' },
    { icon: RefreshCw, title: 'Cập nhật tức thì', detail: 'Đồng bộ trạng thái xác nhận tư vấn', number: '02', tone: 'bg-blue-50 text-blue-600' },
    { icon: Download, title: 'Bàn giao trực tuyến', detail: 'Tải mẫu sau khi được cấp quyền', number: '03', tone: 'bg-emerald-50 text-emerald-600' },
];

const statusConfig: Record<string, {
    label: string;
    description: string;
    classes: string;
    icon: typeof Clock3;
}> = {
    pending: {
        label: 'Chờ xác nhận tư vấn',
        description: 'Yêu cầu đã được tạo và đang chờ giao dịch.',
        classes: 'border-amber-200 bg-amber-50 text-amber-700',
        icon: Clock3,
    },
    paid: {
        label: 'Đã xác nhận tư vấn',
        description: 'Xác nhận tư vấn thành công, quyền tải đang được cấp.',
        classes: 'border-sky-200 bg-sky-50 text-sky-700',
        icon: CreditCard,
    },
    completed: {
        label: 'Hoàn thành',
        description: 'Mẫu demo đã sẵn sàng trong khu vực tải xuống.',
        classes: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        icon: CheckCircle2,
    },
    refunded: {
        label: 'Đã xử lý yêu cầu',
        description: 'Giao dịch đã được hoàn lại theo yêu cầu.',
        classes: 'border-slate-200 bg-slate-100 text-slate-700',
        icon: RefreshCw,
    },
    cancelled: {
        label: 'Đã hủy',
        description: 'Yêu cầu đã bị hủy và không còn hiệu lực.',
        classes: 'border-rose-200 bg-rose-50 text-rose-700',
        icon: XCircle,
    },
};

const normalSteps = [
    { id: 'created', label: 'Tạo đơn', detail: 'Đã ghi nhận', icon: ReceiptText },
    { id: 'pending', label: 'Xác nhận tư vấn', detail: 'Chờ xác nhận', icon: CreditCard },
    { id: 'paid', label: 'Cấp quyền', detail: 'Tạo giấy phép', icon: KeyRound },
    { id: 'completed', label: 'Sẵn sàng tải', detail: 'Trong tài khoản', icon: Download },
];

function extractOrderId(value: string) {
    const matched = value.trim().match(/\d+/);
    if (!matched) return null;
    const id = Number.parseInt(matched[0], 10);
    return Number.isFinite(id) && id > 0 ? id : null;
}

function formatMoney(value: number) {
    return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }).format(new Date(value));
}

function maskEmail(value?: string | null) {
    if (!value || !value.includes('@')) return 'Email tài khoản';
    const [name, domain] = value.split('@');
    return `${name.slice(0, 2)}${'*'.repeat(Math.max(3, name.length - 2))}@${domain}`;
}

export default function TrackingContent() {
    const { isCatalogMode } = useSiteMode();
    const { addToast } = useToast();
    const [orderCode, setOrderCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<OrderData | null>(null);
    const [notFound, setNotFound] = useState(false);

    const status = useMemo(
        () => statusConfig[order?.status || 'pending'] || statusConfig.pending,
        [order?.status],
    );
    const currentStep = order?.status === 'completed' ? 3 : order?.status === 'paid' ? 2 : 1;

    const handleSearch = async (event: React.FormEvent) => {
        event.preventDefault();
        const orderId = extractOrderId(orderCode);
        if (!orderId) {
            addToast('Vui lòng nhập mã đơn hợp lệ, ví dụ #123', 'error');
            return;
        }

        setLoading(true);
        setNotFound(false);
        setOrder(null);

        try {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            if (!supabase) throw new Error('Supabase chưa được cấu hình');

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id, status, total, discount, created_at, updated_at,
                    payment_method, payment_id, billing_email,
                    order_items (product_name, product_image, price, license_type)
                `)
                .eq('id', orderId)
                .maybeSingle();

            if (error || !data) {
                setNotFound(true);
                return;
            }

            setOrder({
                id: data.id,
                status: data.status,
                total: Number(data.total || 0),
                discount: Number(data.discount || 0),
                created_at: data.created_at,
                updated_at: data.updated_at,
                payment_method: data.payment_method,
                payment_id: data.payment_id,
                billing_email: data.billing_email,
                items: (data.order_items || []).map((item: any) => ({
                    name: item.product_name || 'Mẫu demo số',
                    image: item.product_image,
                    price: Number(item.price || 0),
                    licenseType: item.license_type || 'Regular',
                })),
            });
            addToast('Đã tìm thấy yêu cầu', 'success');
        } catch (error) {
            console.error('Tracking lookup error:', error);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    const copyOrderCode = async () => {
        if (!order) return;
        await navigator.clipboard.writeText(`#${order.id}`);
        addToast('Đã sao chép mã yêu cầu', 'success');
    };

    return (
        <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
            <section className="relative overflow-hidden bg-[#fffaf6]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(251,146,60,0.13),transparent_30%),radial-gradient(circle_at_88%_20%,rgba(59,130,246,0.08),transparent_28%)]" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#f6f8fb]" />
                <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
                    <nav className="mb-8 flex items-center gap-2 text-sm font-semibold text-slate-500" aria-label="Breadcrumb">
                        <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-orange-600">
                            <Home size={15} /> Trang chủ
                        </Link>
                        <ChevronRight size={14} />
                        <span className="text-slate-900">Tra cứu yêu cầu</span>
                    </nav>

                    <div className="grid items-center gap-9 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
                        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.45 }}>
                            <div className="mb-5 flex w-fit items-center gap-3 rounded-2xl border border-white bg-white/85 px-3.5 py-3 shadow-[0_12px_35px_rgba(15,23,42,0.07)] backdrop-blur">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-orange-400">
                                    <ShieldCheck size={21} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-extrabold text-slate-950">Trung tâm yêu cầu</p>
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                                    </div>
                                    <p className="mt-0.5 text-xs font-medium text-slate-500">Tra cứu bảo mật, cập nhật theo thời gian thực</p>
                                </div>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3.5 py-2 text-[10px] font-extrabold uppercase text-orange-700 shadow-sm sm:text-xs">
                                <Sparkles size={15} /> Tra cứu giao dịch mẫu demo số
                            </div>
                            <h1 className="mt-5 max-w-2xl text-3xl font-black leading-[1.12] tracking-tight sm:text-4xl md:text-5xl lg:text-[3.45rem]">
                                Kiểm tra yêu cầu <span className="text-orange-600">nhanh và rõ ràng.</span>
                            </h1>
                            <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-slate-600 sm:text-base sm:leading-8">
                                {isCatalogMode
                                    ? 'Nhập mã tư vấn hoặc mã đơn cũ để kiểm tra thông tin hỗ trợ, mẫu quan tâm và quyền truy cập trong tài khoản của bạn.'
                                    : 'Nhập mã đơn để xem trạng thái xác nhận tư vấn, mẫu đã được cấp quyền và quyền tải xuống trong tài khoản của bạn.'}
                            </p>

                            <form onSubmit={handleSearch} className="mt-7 max-w-xl">
                                <div className="rounded-2xl border border-white bg-white/95 p-2 shadow-[0_20px_50px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/70">
                                    <div className="grid grid-cols-[1fr_auto] gap-2">
                                        <label className="relative min-w-0">
                                            <ReceiptText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                                            <input type="text" value={orderCode} onChange={(event) => setOrderCode(event.target.value)} placeholder="Nhập mã đơn, ví dụ #123" className="h-12 w-full rounded-xl bg-slate-50 pl-11 pr-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-200" inputMode="numeric" />
                                        </label>
                                        <button type="submit" disabled={loading} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-700 disabled:cursor-wait disabled:opacity-60 sm:px-6">
                                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                                            <span className="hidden sm:inline">Tra cứu</span>
                                        </button>
                                    </div>
                                </div>
                                <p className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                    <LockKeyhole size={13} className="text-emerald-600" />
                                    Yêu cầu chỉ hiển thị khi tài khoản của bạn có quyền truy cập.
                                </p>
                            </form>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 p-5 text-white shadow-[0_28px_70px_rgba(15,23,42,0.20)] sm:p-7">
                            <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-orange-500/10 blur-3xl" />
                            <div className="flex items-center justify-between border-b border-white/10 pb-5">
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-orange-300">Quy trình tự động</p>
                                    <h2 className="mt-1 text-xl font-black">{isCatalogMode ? 'Quy trình tư vấn rõ ràng' : 'Nhận file sau xác nhận tư vấn'}</h2>
                                </div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-600 shadow-lg shadow-orange-950/30"><PackageCheck size={22} /></div>
                            </div>
                            <div className="mt-5 grid grid-cols-2 gap-3">
                                {[
                                    { icon: Banknote, label: isCatalogMode ? 'Nhu cầu' : 'Xác nhận tư vấn', value: isCatalogMode ? 'Gửi mẫu quan tâm' : 'SePay / Ngân hàng' },
                                    { icon: BadgeCheck, label: 'Xác nhận', value: isCatalogMode ? 'Tư vấn phù hợp' : 'Tự động đối soát' },
                                    { icon: KeyRound, label: 'Giấy phép', value: 'Cấp theo yêu cầu' },
                                    { icon: FileArchive, label: 'Bàn giao', value: 'Tải file trong hồ sơ' },
                                ].map((item, index) => (
                                    <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 + index * 0.07 }} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 transition hover:bg-white/10">
                                        <item.icon size={19} className="text-orange-400" />
                                        <p className="mt-3 text-xs font-bold text-white">{item.label}</p>
                                        <p className="mt-1 text-[11px] font-medium leading-5 text-slate-400">{item.value}</p>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10">
                                <ShieldCheck size={20} className="shrink-0 text-emerald-400" />
                                <p className="text-xs font-medium leading-5 text-slate-300">
                                    {isCatalogMode
                                        ? 'Bạn có thể xem demo, gửi nhu cầu và nhận tư vấn trước khi quyết định triển khai.'
                                        : 'Không cần vận chuyển vật lý. File và giấy phép được bàn giao trực tiếp trong tài khoản.'}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="relative z-10 -mt-8 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-3 sm:gap-4">
                    {trustItems.map((item) => (
                        <div key={item.title} className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-1 hover:border-orange-100 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)] sm:p-5">
                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.tone}`}><item.icon size={20} /></div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-extrabold text-slate-900">{item.title}</p>
                                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                            </div>
                            <span className="absolute right-4 top-3 text-[10px] font-black tracking-widest text-slate-200 transition group-hover:text-orange-200">{item.number}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                {order && (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-5">
                        <article className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.07)]">
                            <header className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-200"><ShoppingBag size={22} /></div>
                                    <div>
                                        <button onClick={copyOrderCode} className="group inline-flex items-center gap-2 text-left">
                                            <h2 className="text-xl font-black sm:text-2xl">Yêu cầu #{order.id}</h2>
                                            <Copy size={15} className="text-slate-400 transition group-hover:text-orange-600" />
                                        </button>
                                        <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 sm:text-sm"><CalendarDays size={14} /> {formatDate(order.created_at)}</p>
                                    </div>
                                </div>
                                <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold sm:text-sm ${status.classes}`}><status.icon size={17} />{status.label}</div>
                            </header>

                            {order.status !== 'cancelled' && order.status !== 'refunded' ? (
                                <div className="border-b border-slate-200 p-5 sm:p-7">
                                    <div className="mb-5 flex items-center justify-between gap-4">
                                        <div><h3 className="font-bold">Tiến trình xử lý</h3><p className="mt-1 text-xs text-slate-500">{status.description}</p></div>
                                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{Math.round(((currentStep + 1) / normalSteps.length) * 100)}%</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-1 sm:gap-3">
                                        {normalSteps.map((step, index) => {
                                            const active = index <= currentStep;
                                            const current = index === currentStep;
                                            return (
                                                <div key={step.id} className="relative min-w-0 text-center">
                                                    {index < normalSteps.length - 1 && <div className={`absolute left-1/2 top-5 h-0.5 w-full ${index < currentStep ? 'bg-orange-500' : 'bg-slate-200'}`} />}
                                                    <div className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-sm sm:h-12 sm:w-12 ${active ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-400'} ${current ? 'ring-4 ring-orange-100' : ''}`}>
                                                        {index < currentStep ? <Check size={18} strokeWidth={3} /> : <step.icon size={17} />}
                                                    </div>
                                                    <p className={`mt-2 truncate text-[10px] font-bold sm:text-xs ${active ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                                                    <p className="mt-0.5 hidden text-[10px] text-slate-400 sm:block">{step.detail}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="border-b border-slate-200 p-5 sm:p-7">
                                    <div className={`flex items-start gap-3 rounded-2xl border p-4 ${status.classes}`}><status.icon size={22} className="shrink-0" /><div><p className="font-bold">{status.label}</p><p className="mt-1 text-sm opacity-80">{status.description}</p></div></div>
                                </div>
                            )}

                            <div className="grid lg:grid-cols-[1fr_300px]">
                                <div className="border-b border-slate-200 p-5 sm:p-7 lg:border-b-0 lg:border-r">
                                    <h3 className="flex items-center gap-2 font-bold"><FileArchive size={18} className="text-orange-600" />Mẫu demo trong đơn</h3>
                                    <div className="mt-4 space-y-3">
                                        {order.items.length > 0 ? order.items.map((item, index) => (
                                            <div key={`${item.name}-${index}`} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 transition hover:border-orange-100 hover:bg-orange-50/40">
                                                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
                                                    {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" /> : <div className="flex h-full w-full items-center justify-center text-slate-400"><FileArchive size={20} /></div>}
                                                </div>
                                                <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.name}</p><p className="mt-1 text-xs font-medium text-slate-500">License {item.licenseType}</p></div>
                                                <p className="shrink-0 text-sm font-black">{formatMoney(item.price)}</p>
                                            </div>
                                        )) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-5 text-center text-sm text-slate-500">Không có dữ liệu chi tiết mẫu demo.</div>}
                                    </div>
                                </div>
                                <aside className="bg-slate-50/70 p-5 sm:p-7">
                                    <h3 className="font-bold">Thông tin xác nhận tư vấn</h3>
                                    <dl className="mt-4 space-y-3 text-sm">
                                        <div className="flex items-center justify-between gap-3"><dt className="text-slate-500">Phương thức</dt><dd className="font-bold uppercase">{order.payment_method || 'Chuyển khoản'}</dd></div>
                                        <div className="flex items-center justify-between gap-3"><dt className="text-slate-500">Email</dt><dd className="max-w-[150px] truncate font-semibold">{maskEmail(order.billing_email)}</dd></div>
                                        {order.payment_id && <div className="flex items-center justify-between gap-3"><dt className="text-slate-500">Giao dịch</dt><dd className="max-w-[130px] truncate font-mono text-xs font-bold">{order.payment_id}</dd></div>}
                                        {order.discount > 0 && <div className="flex items-center justify-between gap-3 text-emerald-700"><dt>Giảm giá</dt><dd className="font-bold">-{formatMoney(order.discount)}</dd></div>}
                                    </dl>
                                    <div className="mt-5 border-t border-slate-200 pt-4"><div className="flex items-end justify-between gap-3"><span className="font-bold">Tổng cộng</span><span className="text-2xl font-black text-orange-600">{formatMoney(order.total)}</span></div></div>
                                </aside>
                            </div>
                        </article>

                        {(order.status === 'paid' || order.status === 'completed') && (
                            <div className="grid grid-cols-2 gap-3">
                                <Link href={isCatalogMode ? '/profile' : '/profile/downloads'} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-2xl bg-orange-600 px-3 py-3.5 text-xs font-bold text-white shadow-lg shadow-orange-100 transition hover:-translate-y-0.5 hover:bg-orange-700 sm:text-sm"><Download size={17} /><span className="truncate">{isCatalogMode ? 'Xem hồ sơ' : 'Tải mẫu demo'}</span></Link>
                                <Link href="/profile/licenses" className="inline-flex min-w-0 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3.5 text-xs font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-orange-200 hover:text-orange-700 sm:text-sm"><KeyRound size={17} /><span className="truncate">Xem giấy phép</span></Link>
                            </div>
                        )}
                    </motion.div>
                )}

                {notFound && !order && (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="rounded-[28px] border border-slate-200/80 bg-white p-6 text-center shadow-[0_22px_55px_rgba(15,23,42,0.07)] sm:p-10">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600"><AlertCircle size={30} /></div>
                        <h2 className="mt-5 text-2xl font-black">Không tìm thấy yêu cầu</h2>
                        <p className="mx-auto mt-2 max-w-lg text-sm font-medium leading-7 text-slate-500">Hãy kiểm tra lại mã đơn hoặc đăng nhập bằng đúng tài khoản đã gửi yêu cầu. Bạn cũng có thể xem mã đơn trong email xác nhận.</p>
                        <div className="mt-6 grid grid-cols-2 gap-3 sm:mx-auto sm:max-w-md">
                            <button onClick={() => { setNotFound(false); setOrderCode(''); }} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-3 py-3 text-xs font-bold text-white transition hover:bg-orange-700 sm:text-sm"><Search size={16} /> Thử lại</button>
                            <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-3 py-3 text-xs font-bold text-slate-700 transition hover:border-orange-200 hover:text-orange-700 sm:text-sm"><Headphones size={16} /> Hỗ trợ</Link>
                        </div>
                    </motion.div>
                )}

                {!order && !notFound && !loading && (
                    <div className="grid items-stretch gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                        <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)] sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-orange-600">Hướng dẫn tra cứu</p>
                                    <h2 className="mt-2 text-2xl font-black tracking-tight">Tìm mã yêu cầu của bạn</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">Mã thường có dạng <strong className="font-bold text-slate-700">#123</strong> và xuất hiện tại một trong các vị trí dưới đây.</p>
                                </div>
                                <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 sm:flex"><ReceiptText size={23} /></div>
                            </div>
                            <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
                                {['Email xác nhận', 'Hồ sơ cá nhân', 'Biên nhận giao dịch'].map((item, index) => (
                                    <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
                                        <div className="flex items-center gap-2"><CheckCircle2 size={16} className="shrink-0 text-emerald-600" /><span className="text-xs font-extrabold text-slate-800">{item}</span></div>
                                        <p className="mt-2 pl-6 text-[11px] leading-5 text-slate-500">{index === 0 ? 'Sau khi gửi yêu cầu' : index === 1 ? 'Mục Yêu cầu của tôi' : 'Nội dung chuyển khoản'}</p>
                                    </div>
                                ))}
                            </div>
                        </article>
                        <aside className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[#111827] p-6 text-white shadow-[0_18px_45px_rgba(15,23,42,0.12)] sm:p-7">
                            <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-orange-500/10 blur-3xl" />
                            <div className="relative flex h-full flex-col justify-between gap-6">
                                <div>
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-orange-400 ring-1 ring-white/10"><Headphones size={21} /></div>
                                    <h2 className="mt-4 text-xl font-black">Cần hỗ trợ tra cứu?</h2>
                                    <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-400">Gửi mã yêu cầu và email đã đăng ký, đội ngũ hỗ trợ sẽ kiểm tra giúp bạn.</p>
                                </div>
                                <a href="mailto:veutong961@gmail.com" className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-orange-50">Liên hệ hỗ trợ <ArrowRight size={16} /></a>
                            </div>
                        </aside>
                    </div>
                )}
            </section>
        </main>
    );
}
