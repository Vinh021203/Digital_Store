// components/MaintenanceGuard.tsx
// Wraps the app to check maintenance mode and hide storefront for non-admins.

'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Clock3, Mail, ShieldCheck, Sparkles, Wrench } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getSetting } from '@/lib/siteSettings';

interface MaintenanceGuardProps {
    children: React.ReactNode;
}

const ALLOWED_PATHS = [
    '/maintenance',
    '/login',
    '/register',
    '/admin',
    '/api',
];

const POLL_INTERVAL = 5000;

export default function MaintenanceGuard({ children }: MaintenanceGuardProps) {
    const { isAdmin, isLoading } = useAuth();
    const pathname = usePathname();
    const [checked, setChecked] = useState(false);
    const [blocked, setBlocked] = useState(false);
    const [message, setMessage] = useState('Website đang được bảo trì. Vui lòng quay lại sau.');

    const checkMaintenance = useCallback(async () => {
        const isAllowed = ALLOWED_PATHS.some(path => pathname?.startsWith(path));

        if (isLoading) return;

        try {
            const maintenanceMode = await getSetting('maintenance_mode');
            const maintenanceMessage = await getSetting('maintenance_message');

            if (typeof maintenanceMessage === 'string' && maintenanceMessage.trim()) {
                setMessage(maintenanceMessage);
            }

            setBlocked(maintenanceMode === true && !isAdmin && !isAllowed);
        } catch (error) {
            console.error('Maintenance check error:', error);
            setBlocked(false);
        }

        setChecked(true);
    }, [pathname, isAdmin, isLoading]);

    useEffect(() => {
        checkMaintenance();
    }, [checkMaintenance]);

    useEffect(() => {
        const interval = setInterval(() => {
            checkMaintenance();
        }, POLL_INTERVAL);

        return () => clearInterval(interval);
    }, [checkMaintenance]);

    if (!checked || isLoading) {
        return null;
    }

    if (blocked) {
        return (
            <main className="relative min-h-screen overflow-hidden bg-[#fffaf5] px-5 py-8 text-slate-950">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(234,88,12,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(234,88,12,0.055)_1px,transparent_1px)] bg-[size:42px_42px]" />
                <div className="pointer-events-none absolute left-[-12rem] top-[-12rem] h-96 w-96 rounded-full bg-orange-200/45 blur-3xl" />
                <div className="pointer-events-none absolute bottom-[-14rem] right-[-12rem] h-[28rem] w-[28rem] rounded-full bg-sky-100/80 blur-3xl" />

                <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center">
                    <div className="group relative w-full overflow-hidden rounded-[34px] border border-orange-100 bg-white/90 p-6 text-center shadow-2xl shadow-orange-100/70 backdrop-blur sm:p-10 lg:p-12">
                        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/70 to-transparent" />
                        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-orange-100/70 blur-2xl transition duration-700 group-hover:scale-110" />

                        <div className="mx-auto mb-6 flex h-20 w-20 animate-[maintenance-float_4s_ease-in-out_infinite] items-center justify-center rounded-[24px] bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-xl shadow-orange-200">
                            <Wrench size={34} aria-hidden="true" />
                        </div>

                        <p className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-700 shadow-sm">
                            <Sparkles size={14} aria-hidden="true" />
                            Shop Web rẻ
                        </p>

                        <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                            Website đang tạm bảo trì
                        </h1>
                        <p className="mx-auto mt-4 max-w-xl text-base font-semibold leading-7 text-slate-600">
                            {message}
                        </p>

                        <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                                <Clock3 className="mx-auto mb-2 text-orange-600" size={20} aria-hidden="true" />
                                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Trạng thái</p>
                                <p className="mt-1 text-sm font-black text-slate-800">Đang cập nhật</p>
                            </div>
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                                <ShieldCheck className="mx-auto mb-2 text-emerald-600" size={20} aria-hidden="true" />
                                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Dữ liệu</p>
                                <p className="mt-1 text-sm font-black text-slate-800">Được bảo toàn</p>
                            </div>
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                                <Mail className="mx-auto mb-2 text-blue-600" size={20} aria-hidden="true" />
                                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Liên hệ</p>
                                <p className="mt-1 break-words text-sm font-black text-slate-800">veutong961@gmail.com</p>
                            </div>
                        </div>

                        <p className="mt-7 text-sm font-semibold text-slate-400">
                            Cảm ơn bạn đã ghé thăm. Website sẽ mở lại sau khi hoàn tất cập nhật.
                        </p>
                    </div>
                </section>

                <style jsx>{`
                    @keyframes maintenance-float {
                        0%, 100% {
                            transform: translateY(0);
                        }
                        50% {
                            transform: translateY(-8px);
                        }
                    }
                `}</style>
            </main>
        );
    }

    return <>{children}</>;
}
