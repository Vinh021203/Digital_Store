'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    Tag,
    ArrowLeft,
    Edit3,
    Trash2,
    Loader2,
    Percent,
    DollarSign,
    Calendar,
    Users,
    ShoppingCart,
    Copy,
    Check,
    Clock,
    BarChart3,
} from 'lucide-react';
import { fetchCoupons, deleteCoupon, type DbCoupon } from '@/lib/coupons';
import { useToast } from '@/context/ToastContext';

export default function CouponDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const toast = useToast();

    const [coupon, setCoupon] = useState<DbCoupon | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const loadCoupon = async () => {
            try {
                const coupons = await fetchCoupons();
                const found = coupons.find(c => c.id === Number(id));
                setCoupon(found || null);
            } catch (error) {
                console.error('Error loading coupon:', error);
                toast.error('Không thể tải mã giảm giá');
            } finally {
                setLoading(false);
            }
        };
        loadCoupon();
    }, [id, toast]);

    const handleCopy = () => {
        if (!coupon) return;
        navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Đã copy mã');
    };

    const handleDelete = async () => {
        if (!coupon) return;
        if (!(await toast.confirm(`Bạn có chắc muốn xóa mã "${coupon.code}"?`))) return;

        try {
            await deleteCoupon(coupon.id);
            toast.success('Đã xóa mã giảm giá');
            router.push('/admin/marketing');
        } catch (error: any) {
            toast.error(error.message || 'Không thể xóa');
        }
    };

    const getStatus = (c: DbCoupon) => {
        const now = new Date();
        const end = c.end_date ? new Date(c.end_date) : null;
        const start = new Date(c.start_date);

        if (!c.is_active) return { label: 'Tắt', class: 'bg-slate-100 text-slate-600', desc: 'Mã đang bị vô hiệu hóa' };
        if (end && end < now) return { label: 'Hết hạn', class: 'bg-red-50 text-red-600', desc: 'Mã đã hết hạn sử dụng' };
        if (start > now) return { label: 'Chờ', class: 'bg-amber-50 text-amber-600', desc: 'Mã chưa đến ngày bắt đầu' };
        if (c.used_count >= c.usage_limit) return { label: 'Hết lượt', class: 'bg-orange-50 text-orange-600', desc: 'Đã hết lượt sử dụng' };
        return { label: 'Hoạt động', class: 'bg-green-50 text-green-600', desc: 'Mã đang được sử dụng' };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!coupon) {
        return (
            <div className="text-center py-20">
                <Tag size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500">Không tìm thấy mã giảm giá</p>
                <button
                    onClick={() => router.push('/admin/marketing')}
                    className="mt-4 text-indigo-600 font-bold"
                >
                    ← Quay lại danh sách
                </button>
            </div>
        );
    }

    const status = getStatus(coupon);
    const usedPercent = coupon.usage_limit > 0
        ? Math.min(100, (coupon.used_count / coupon.usage_limit) * 100)
        : 0;

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/admin/marketing')}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Tag size={24} className="text-indigo-600" />
                            Chi Tiết Mã Giảm Giá
                        </h2>
                        <p className="text-sm text-slate-500">Xem thông tin chi tiết</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/admin/marketing/${coupon.id}/edit`)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
                    >
                        <Edit3 size={16} /> Chỉnh sửa
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100"
                    >
                        <Trash2 size={16} /> Xóa
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Code Card */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Code Display */}
                    <div className={`rounded-2xl p-6 ${coupon.type === 'percentage' ? 'bg-indigo-50' : 'bg-emerald-50'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${coupon.type === 'percentage' ? 'bg-indigo-100' : 'bg-emerald-100'}`}>
                                    {coupon.type === 'percentage' ? (
                                        <Percent size={24} className="text-indigo-600" />
                                    ) : (
                                        <DollarSign size={24} className="text-emerald-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">
                                        {coupon.type === 'percentage' ? 'Giảm theo phần trăm' : 'Giảm số tiền cố định'}
                                    </p>
                                    <p className={`text-3xl font-black ${coupon.type === 'percentage' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                                        {coupon.type === 'percentage'
                                            ? `${coupon.value}%`
                                            : `${coupon.value.toLocaleString()}₫`}
                                    </p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${status.class}`}>
                                {status.label}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 bg-white rounded-xl p-4">
                            <code className="flex-1 font-mono font-bold text-2xl text-slate-900">
                                {coupon.code}
                            </code>
                            <button
                                onClick={handleCopy}
                                className={`p-3 rounded-lg transition-colors ${copied ? 'bg-green-100 text-green-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                    }`}
                            >
                                {copied ? <Check size={20} /> : <Copy size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                            <BarChart3 size={18} className="text-indigo-600" />
                            Thống kê sử dụng
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Đã sử dụng</span>
                                <span className="font-bold">{coupon.used_count} / {coupon.usage_limit} lượt</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all ${usedPercent >= 100 ? 'bg-red-500' : usedPercent >= 80 ? 'bg-orange-500' : 'bg-indigo-500'
                                        }`}
                                    style={{ width: `${usedPercent}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-400">
                                Còn {coupon.usage_limit - coupon.used_count} lượt sử dụng
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Info */}
                <div className="space-y-6">
                    {/* Conditions */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6">
                        <h3 className="font-bold text-slate-900 mb-4">Điều kiện áp dụng</h3>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <ShoppingCart size={18} className="text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Đơn tối thiểu</p>
                                    <p className="font-bold text-slate-900">
                                        {coupon.min_order > 0 ? `${coupon.min_order.toLocaleString()}₫` : 'Không giới hạn'}
                                    </p>
                                </div>
                            </div>

                            {coupon.type === 'percentage' && coupon.max_discount && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <DollarSign size={18} className="text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Giảm tối đa</p>
                                        <p className="font-bold text-slate-900">{coupon.max_discount.toLocaleString()}₫</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Users size={18} className="text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Giới hạn sử dụng</p>
                                    <p className="font-bold text-slate-900">{coupon.usage_limit} lượt</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Time */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6">
                        <h3 className="font-bold text-slate-900 mb-4">Thời gian</h3>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Clock size={18} className="text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Ngày tạo</p>
                                    <p className="font-bold text-slate-900">
                                        {new Date(coupon.created_at).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Calendar size={18} className="text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Hết hạn</p>
                                    <p className="font-bold text-slate-900">
                                        {coupon.end_date
                                            ? new Date(coupon.end_date).toLocaleDateString('vi-VN')
                                            : 'Không giới hạn'}
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
