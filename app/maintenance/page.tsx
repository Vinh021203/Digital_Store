'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Construction, Mail, Phone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { getSetting } from '@/lib/siteSettings';

// Polling interval to check if maintenance mode is still on
const POLL_INTERVAL = 3000;

export default function MaintenancePage() {
    const { settings } = useSiteSettings();
    const router = useRouter();

    // Poll to check if maintenance mode is turned off
    useEffect(() => {
        const checkMaintenanceStatus = async () => {
            try {
                const maintenanceMode = await getSetting('maintenance_mode');
                if (maintenanceMode !== true) {
                    // Maintenance is off, redirect to home
                    router.replace('/');
                }
            } catch (error) {
                // If error, redirect home anyway
                router.replace('/');
            }
        };

        // Check immediately
        checkMaintenanceStatus();

        // Then poll every few seconds
        const interval = setInterval(checkMaintenanceStatus, POLL_INTERVAL);

        return () => clearInterval(interval);
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
            <div className="max-w-lg w-full text-center">
                {/* Icon */}
                <div className="mb-8 relative">
                    <div className="w-32 h-32 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center animate-pulse">
                        <Construction size={64} className="text-amber-400" />
                    </div>
                    <div className="absolute inset-0 w-32 h-32 mx-auto border-4 border-amber-500/30 rounded-full animate-ping" />
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Website đang bảo trì
                </h1>

                {/* Message */}
                <p className="text-lg text-slate-300 mb-8">
                    {settings.maintenanceMessage || 'Chúng tôi đang nâng cấp hệ thống để mang đến trải nghiệm tốt hơn. Vui lòng quay lại sau!'}
                </p>

                {/* Decorative line */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-slate-500" />
                    <span className="text-amber-400 text-sm font-medium">Sẽ tự chuyển về trang chủ khi hoàn tất</span>
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-slate-500" />
                </div>

                {/* Contact Info */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <p className="text-slate-400 text-sm mb-4">
                        Nếu cần hỗ trợ gấp, vui lòng liên hệ:
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white">
                        {settings.email && (
                            <a
                                href={`mailto:${settings.email}`}
                                className="flex items-center gap-2 hover:text-amber-400 transition-colors"
                            >
                                <Mail size={18} />
                                <span>{settings.email}</span>
                            </a>
                        )}
                        {settings.phone && (
                            <a
                                href={`tel:${settings.phone}`}
                                className="flex items-center gap-2 hover:text-amber-400 transition-colors"
                            >
                                <Phone size={18} />
                                <span>{settings.phone}</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Admin login link */}
                <div className="mt-8">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Admin đăng nhập
                    </Link>
                </div>

                {/* Site name */}
                <p className="mt-8 text-slate-500 text-sm">
                    © {new Date().getFullYear()} {settings.siteName || 'Shop Web rẻ'}
                </p>
            </div>
        </div>
    );
}
