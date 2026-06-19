"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    BadgeCheck,
    Building2,
    CreditCard,
    Loader2,
    ShieldCheck,
    Store,
} from 'lucide-react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useToast } from '@/context/ToastContext';
import { getSellerByUserId } from '@/lib/sellers';

export default function SellerRegisterPage() {
    const router = useRouter();
    const { user, loading, refreshProfile } = useSupabaseAuth();
    const { addToast } = useToast();
    const [checking, setChecking] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        store_name: '',
        description: '',
        bank_name: '',
        bank_account: '',
    });

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.push('/login?redirect=/seller/register');
            return;
        }

        let mounted = true;

        getSellerByUserId(user.id)
            .then((seller) => {
                if (!mounted) return;

                if (seller) {
                    router.replace('/profile/marketplace');
                    return;
                }

                setChecking(false);
            })
            .catch(() => {
                if (mounted) setChecking(false);
            });

        return () => {
            mounted = false;
        };
    }, [loading, router, user]);

    const updateField = (field: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!form.store_name.trim()) {
            addToast('Vui lòng nhập tên cửa hàng.', 'warning');
            return;
        }

        setSaving(true);

        try {
            const response = await fetch('/api/seller/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Đăng ký người bán thất bại.');
            }

            await refreshProfile();
            addToast('Đăng ký người bán thành công. Hồ sơ đang chờ duyệt.', 'success');
            router.push('/profile/marketplace');
        } catch (error) {
            addToast(error instanceof Error ? error.message : 'Đăng ký người bán thất bại.', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading || checking) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm">
                    <Loader2 size={20} className="animate-spin text-orange-500" />
                    Đang kiểm tra tài khoản...
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <section className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
                    <Link href="/profile/marketplace" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors">
                        <ArrowLeft size={18} />
                        Marketplace
                    </Link>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        <ShieldCheck size={14} />
                        Đăng ký an toàn
                    </div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 lg:gap-8 items-start">
                    <aside className="rounded-2xl bg-slate-900 text-white p-6 md:p-8 overflow-hidden relative">
                        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-orange-600/35 to-transparent" />
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mb-6">
                                <Store size={28} className="text-orange-300" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
                                Mở gian hàng Shop Web rẻ
                            </h1>
                            <p className="text-slate-300 leading-7 mb-8">
                                Tạo hồ sơ người bán để đăng giao diện website, theo dõi doanh thu và gửi sản phẩm cho admin duyệt.
                            </p>
                            <div className="space-y-4">
                                {[
                                    ['Hồ sơ seller được tạo ở trạng thái chờ duyệt', BadgeCheck],
                                    ['Quyền seller được cấp qua server bảo mật', ShieldCheck],
                                    ['Có thể bổ sung thông tin thanh toán sau', CreditCard],
                                ].map(([label, Icon]) => {
                                    const SafeIcon = Icon as typeof BadgeCheck;
                                    return (
                                        <div key={label as string} className="flex items-center gap-3 text-sm font-semibold text-slate-100">
                                            <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                                                <SafeIcon size={17} className="text-orange-300" />
                                            </span>
                                            {label as string}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 md:p-8 shadow-sm">
                        <div className="mb-7">
                            <p className="text-sm font-bold text-orange-600 mb-2">Thông tin cửa hàng</p>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-950">Đăng ký người bán</h2>
                        </div>

                        <div className="space-y-5">
                            <label className="block">
                                <span className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Building2 size={16} />
                                    Tên cửa hàng
                                </span>
                                <input
                                    value={form.store_name}
                                    onChange={(event) => updateField('store_name', event.target.value)}
                                    placeholder="Ví dụ: Vinh Digital Studio"
                                    maxLength={80}
                                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm font-bold text-slate-700 mb-2 block">Mô tả ngắn</span>
                                <textarea
                                    value={form.description}
                                    onChange={(event) => updateField('description', event.target.value)}
                                    placeholder="Bạn bán loại sản phẩm gì, thế mạnh của cửa hàng là gì..."
                                    maxLength={500}
                                    rows={5}
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                                />
                                <span className="mt-1 block text-xs font-medium text-slate-400">{form.description.length}/500</span>
                            </label>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <label className="block">
                                    <span className="text-sm font-bold text-slate-700 mb-2 block">Ngân hàng</span>
                                    <input
                                        value={form.bank_name}
                                        onChange={(event) => updateField('bank_name', event.target.value)}
                                        placeholder="VD: Vietcombank"
                                        maxLength={100}
                                        className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-bold text-slate-700 mb-2 block">Số tài khoản</span>
                                    <input
                                        value={form.bank_account}
                                        onChange={(event) => updateField('bank_account', event.target.value)}
                                        placeholder="Có thể bổ sung sau"
                                        maxLength={100}
                                        className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:shadow-orange-500/30 disabled:opacity-60"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Store size={18} />}
                                {saving ? 'Đang đăng ký...' : 'Gửi đăng ký'}
                            </button>
                            <Link
                                href="/profile/marketplace"
                                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                            >
                                Hủy
                            </Link>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
