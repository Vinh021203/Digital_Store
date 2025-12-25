'use client';

import React, { useState, memo } from 'react';
import {
    Ticket, Plus, Edit2, Trash2, Copy, Check, Calendar, Percent,
    DollarSign, Users, ShoppingCart, Tag, Clock, X, Search
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

// ============================================
// TYPES
// ============================================
export interface Coupon {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrder: number;
    maxDiscount?: number;
    usageLimit: number;
    usedCount: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    applicableTo: 'all' | 'category' | 'product';
    categories?: string[];
    products?: number[];
}

// ============================================
// SAMPLE DATA
// ============================================
const SAMPLE_COUPONS: Coupon[] = [
    {
        id: '1',
        code: 'WELCOME20',
        type: 'percentage',
        value: 20,
        minOrder: 100000,
        maxDiscount: 500000,
        usageLimit: 1000,
        usedCount: 234,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
        applicableTo: 'all',
    },
    {
        id: '2',
        code: 'GIAM50K',
        type: 'fixed',
        value: 50000,
        minOrder: 300000,
        usageLimit: 500,
        usedCount: 156,
        startDate: '2024-06-01',
        endDate: '2024-06-30',
        isActive: false,
        applicableTo: 'all',
    },
    {
        id: '3',
        code: 'VIP30',
        type: 'percentage',
        value: 30,
        minOrder: 500000,
        maxDiscount: 1000000,
        usageLimit: 100,
        usedCount: 45,
        startDate: '2024-01-01',
        endDate: '2025-01-01',
        isActive: true,
        applicableTo: 'category',
        categories: ['themes', 'templates'],
    },
];

// ============================================
// COUPON CARD
// ============================================
interface CouponCardProps {
    coupon: Coupon;
    onEdit: (coupon: Coupon) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string) => void;
}

const CouponCard = memo(({ coupon, onEdit, onDelete, onToggle }: CouponCardProps) => {
    const { addToast } = useToast();
    const [copied, setCopied] = useState(false);

    const isExpired = new Date(coupon.endDate) < new Date();
    const isExhausted = coupon.usedCount >= coupon.usageLimit;
    const usagePercent = (coupon.usedCount / coupon.usageLimit) * 100;

    const handleCopy = () => {
        navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        addToast('Đã sao chép mã!', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`bg-white rounded-2xl border p-5 transition-all hover:shadow-lg ${!coupon.isActive || isExpired ? 'opacity-60 border-slate-200' : 'border-orange-200'
            }`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${coupon.type === 'percentage'
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-green-100 text-green-600'
                        }`}>
                        {coupon.type === 'percentage' ? <Percent size={20} /> : <DollarSign size={20} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-black text-lg text-slate-900">{coupon.code}</span>
                            <button onClick={handleCopy} className="p-1 hover:bg-slate-100 rounded">
                                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-slate-400" />}
                            </button>
                        </div>
                        <p className="text-sm text-slate-500">
                            {coupon.type === 'percentage'
                                ? `Giảm ${coupon.value}%`
                                : `Giảm ${coupon.value.toLocaleString()}₫`
                            }
                            {coupon.maxDiscount && ` (tối đa ${coupon.maxDiscount.toLocaleString()}₫)`}
                        </p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${isExpired
                        ? 'bg-slate-100 text-slate-600'
                        : isExhausted
                            ? 'bg-red-100 text-red-600'
                            : coupon.isActive
                                ? 'bg-green-100 text-green-600'
                                : 'bg-amber-100 text-amber-600'
                    }`}>
                    {isExpired ? 'Hết hạn' : isExhausted ? 'Đã hết' : coupon.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                    <p className="text-slate-500 text-xs">Đơn tối thiểu</p>
                    <p className="font-bold text-slate-900">{coupon.minOrder.toLocaleString()}₫</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                    <p className="text-slate-500 text-xs">Đã sử dụng</p>
                    <p className="font-bold text-slate-900">{coupon.usedCount}/{coupon.usageLimit}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                    <p className="text-slate-500 text-xs">Áp dụng</p>
                    <p className="font-bold text-slate-900 capitalize">{coupon.applicableTo === 'all' ? 'Tất cả' : coupon.applicableTo}</p>
                </div>
            </div>

            {/* Usage Progress */}
            <div className="mb-4">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${usagePercent > 80 ? 'bg-red-500' : 'bg-orange-500'}`}
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                </div>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                <Calendar size={12} />
                <span>{coupon.startDate} → {coupon.endDate}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <button
                    onClick={() => onToggle(coupon.id)}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${coupon.isActive
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                >
                    {coupon.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                </button>
                <button
                    onClick={() => onEdit(coupon)}
                    className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <Edit2 size={16} />
                </button>
                <button
                    onClick={() => onDelete(coupon.id)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
});
CouponCard.displayName = 'CouponCard';

// ============================================
// COUPON MANAGEMENT COMPONENT
// ============================================
export default function CouponManagement() {
    const [coupons, setCoupons] = useState<Coupon[]>(SAMPLE_COUPONS);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
    const { addToast } = useToast();

    const filteredCoupons = coupons.filter(c => {
        const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase());
        const isExpired = new Date(c.endDate) < new Date();

        if (filter === 'active') return matchesSearch && c.isActive && !isExpired;
        if (filter === 'inactive') return matchesSearch && !c.isActive;
        if (filter === 'expired') return matchesSearch && isExpired;
        return matchesSearch;
    });

    const handleToggle = (id: string) => {
        setCoupons(prev => prev.map(c =>
            c.id === id ? { ...c, isActive: !c.isActive } : c
        ));
        addToast('Đã cập nhật trạng thái!', 'success');
    };

    const handleDelete = (id: string) => {
        if (confirm('Bạn có chắc muốn xóa mã giảm giá này?')) {
            setCoupons(prev => prev.filter(c => c.id !== id));
            addToast('Đã xóa mã giảm giá!', 'success');
        }
    };

    const handleEdit = (coupon: Coupon) => {
        // TODO: Open edit modal
        addToast('Tính năng đang phát triển!', 'info');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Quản lý mã giảm giá</h1>
                    <p className="text-slate-500">Tạo và quản lý các mã khuyến mãi</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors">
                    <Plus size={18} />
                    Tạo mã mới
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Tìm mã giảm giá..."
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'active', 'inactive', 'expired'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${filter === f
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {f === 'all' ? 'Tất cả' : f === 'active' ? 'Hoạt động' : f === 'inactive' ? 'Tạm dừng' : 'Hết hạn'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Tổng mã', value: coupons.length, icon: Ticket, color: 'orange' },
                    { label: 'Đang hoạt động', value: coupons.filter(c => c.isActive).length, icon: Check, color: 'green' },
                    { label: 'Lượt sử dụng', value: coupons.reduce((sum, c) => sum + c.usedCount, 0), icon: Users, color: 'blue' },
                    { label: 'Hết hạn', value: coupons.filter(c => new Date(c.endDate) < new Date()).length, icon: Clock, color: 'red' },
                ].map((stat, idx) => (
                    <div key={idx} className={`bg-${stat.color}-50 rounded-xl p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                            <stat.icon size={16} className={`text-${stat.color}-600`} />
                            <span className="text-sm text-slate-600">{stat.label}</span>
                        </div>
                        <p className={`text-2xl font-black text-${stat.color}-700`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Coupon Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCoupons.map(coupon => (
                    <CouponCard
                        key={coupon.id}
                        coupon={coupon}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggle={handleToggle}
                    />
                ))}
            </div>

            {filteredCoupons.length === 0 && (
                <div className="text-center py-12">
                    <Ticket size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">Không tìm thấy mã giảm giá nào</p>
                </div>
            )}
        </div>
    );
}
