'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    Tag,
    ArrowLeft,
    Save,
    Loader2,
    Percent,
    DollarSign,
    Calendar,
    Users,
    ShoppingCart,
} from 'lucide-react';
import { fetchCoupons, updateCoupon, type DbCoupon } from '@/lib/coupons';
import { useToast } from '@/context/ToastContext';

export default function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const toast = useToast();

    const [coupon, setCoupon] = useState<DbCoupon | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage' as 'percentage' | 'fixed',
        value: 10,
        min_order: 0,
        max_discount: 0,
        usage_limit: 100,
        end_date: '',
        is_active: true,
    });

    useEffect(() => {
        const loadCoupon = async () => {
            try {
                const coupons = await fetchCoupons();
                const found = coupons.find(c => c.id === Number(id));
                if (found) {
                    setCoupon(found);
                    setFormData({
                        code: found.code,
                        type: found.type,
                        value: found.value,
                        min_order: found.min_order,
                        max_discount: found.max_discount || 0,
                        usage_limit: found.usage_limit,
                        end_date: found.end_date?.split('T')[0] || '',
                        is_active: found.is_active,
                    });
                }
            } catch (error) {
                console.error('Error loading coupon:', error);
                toast.error('Không thể tải mã giảm giá');
            } finally {
                setLoading(false);
            }
        };
        loadCoupon();
    }, [id, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!coupon) return;
        if (!formData.code.trim()) {
            toast.error('Vui lòng nhập mã code');
            return;
        }

        setSaving(true);
        try {
            await updateCoupon(coupon.id, {
                code: formData.code.trim().toUpperCase(),
                type: formData.type,
                value: formData.value,
                min_order: formData.min_order,
                max_discount: formData.max_discount || null,
                usage_limit: formData.usage_limit,
                end_date: formData.end_date || null,
                is_active: formData.is_active,
            });

            toast.success('Cập nhật mã giảm giá thành công!');
            router.push(`/admin/marketing/${coupon.id}`);
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error(error.message || 'Không thể cập nhật');
        } finally {
            setSaving(false);
        }
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

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.push(`/admin/marketing/${coupon.id}`)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Tag size={24} className="text-indigo-600" />
                        Chỉnh Sửa Mã: {coupon.code}
                    </h2>
                    <p className="text-sm text-slate-500">
                        Cập nhật thông tin mã giảm giá
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
                    <h3 className="font-bold text-slate-900 border-b pb-3">Thông tin mã giảm giá</h3>

                    {/* Code */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Mã Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={e => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 font-mono font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                            required
                        />
                    </div>

                    {/* Type & Value */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Loại giảm giá
                            </label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, type: 'percentage' }))}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all ${formData.type === 'percentage'
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                            : 'border-slate-200 text-slate-600'
                                        }`}
                                >
                                    <Percent size={18} />
                                    Phần trăm
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, type: 'fixed' }))}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all ${formData.type === 'fixed'
                                            ? 'border-emerald-600 bg-emerald-50 text-emerald-600'
                                            : 'border-slate-200 text-slate-600'
                                        }`}
                                >
                                    <DollarSign size={18} />
                                    Cố định
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Giá trị giảm <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.value}
                                    onChange={e => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                                    min={1}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                                    {formData.type === 'percentage' ? '%' : '₫'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Min Order & Max Discount */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                <ShoppingCart size={14} className="inline mr-1" />
                                Đơn tối thiểu (VNĐ)
                            </label>
                            <input
                                type="number"
                                value={formData.min_order}
                                onChange={e => setFormData(prev => ({ ...prev, min_order: Number(e.target.value) }))}
                                min={0}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Giảm tối đa (VNĐ)
                            </label>
                            <input
                                type="number"
                                value={formData.max_discount}
                                onChange={e => setFormData(prev => ({ ...prev, max_discount: Number(e.target.value) }))}
                                min={0}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Usage & Expiry */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                <Users size={14} className="inline mr-1" />
                                Số lượt sử dụng
                            </label>
                            <input
                                type="number"
                                value={formData.usage_limit}
                                onChange={e => setFormData(prev => ({ ...prev, usage_limit: Number(e.target.value) }))}
                                min={1}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <p className="text-xs text-slate-400 mt-1">
                                Đã dùng: {coupon.used_count} lượt
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                <Calendar size={14} className="inline mr-1" />
                                Ngày hết hạn
                            </label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={e => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Trạng thái
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, is_active: true }))}
                                className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${formData.is_active
                                        ? 'border-green-600 bg-green-50 text-green-600'
                                        : 'border-slate-200 text-slate-600'
                                    }`}
                            >
                                ✓ Kích hoạt
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, is_active: false }))}
                                className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${!formData.is_active
                                        ? 'border-slate-600 bg-slate-50 text-slate-600'
                                        : 'border-slate-200 text-slate-400'
                                    }`}
                            >
                                Tắt
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => router.push(`/admin/marketing/${coupon.id}`)}
                        className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 disabled:opacity-60"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {saving ? 'Đang lưu...' : 'Cập Nhật'}
                    </button>
                </div>
            </form>
        </div>
    );
}
