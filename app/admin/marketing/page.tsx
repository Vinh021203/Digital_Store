'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Tag,
  Plus,
  Edit3,
  Trash2,
  Search,
  Loader2,
  RefreshCw,
  Eye,
  Copy,
  Check,
  Percent,
  DollarSign,
} from 'lucide-react';
import { fetchCoupons, deleteCoupon, updateCoupon, type DbCoupon } from '@/lib/coupons';
import { useToast } from '@/context/ToastContext';

const CouponsManager = () => {
  const router = useRouter();
  const toast = useToast();

  const [coupons, setCoupons] = useState<DbCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Error loading coupons:', error);
      toast.error('Không thể tải mã giảm giá');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.is_active).length,
    used: coupons.reduce((sum, c) => sum + c.used_count, 0),
    percentage: coupons.filter(c => c.type === 'percentage').length,
  };

  const handleDelete = async (coupon: DbCoupon) => {
    if (!(await toast.confirm(`Bạn có chắc muốn xóa mã "${coupon.code}"?`))) return;
    try {
      await deleteCoupon(coupon.id);
      toast.success('Đã xóa mã giảm giá');
      loadCoupons();
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa');
    }
  };

  const handleToggle = async (coupon: DbCoupon) => {
    try {
      await updateCoupon(coupon.id, { is_active: !coupon.is_active });
      setCoupons(prev => prev.map(c =>
        c.id === coupon.id ? { ...c, is_active: !c.is_active } : c
      ));
      toast.success(`Đã ${!coupon.is_active ? 'kích hoạt' : 'tắt'} mã`);
    } catch (error) {
      toast.error('Không thể cập nhật');
    }
  };

  const handleCopy = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Đã copy mã');
  };

  const getStatus = (coupon: DbCoupon) => {
    const now = new Date();
    const end = coupon.end_date ? new Date(coupon.end_date) : null;
    const start = new Date(coupon.start_date);

    if (!coupon.is_active) return { label: 'Tắt', class: 'bg-slate-100 text-slate-600' };
    if (end && end < now) return { label: 'Hết hạn', class: 'bg-red-50 text-red-600' };
    if (start > now) return { label: 'Chờ', class: 'bg-amber-50 text-amber-600' };
    if (coupon.used_count >= coupon.usage_limit) return { label: 'Hết lượt', class: 'bg-orange-50 text-orange-600' };
    return { label: 'Hoạt động', class: 'bg-green-50 text-green-600' };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Tag size={24} className="text-indigo-600" />
            Quản Lý Mã Giảm Giá
          </h2>
          <p className="text-sm text-slate-500">
            Tạo và quản lý các mã khuyến mãi cho cửa hàng.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadCoupons}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50"
          >
            <RefreshCw size={16} /> Làm mới
          </button>
          <button
            onClick={() => router.push('/admin/marketing/new')}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200"
          >
            <Plus size={18} /> Tạo Mã Mới
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 p-5 text-white shadow-lg shadow-blue-200/60">
          <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
          <div className="relative flex h-full items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-white/85">Tổng mã giảm giá</p>
              <p className="mt-2 text-4xl font-black leading-none">{stats.total}</p>
              <p className="mt-3 text-sm font-medium text-white/75">Tất cả mã khuyến mãi</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><Tag size={28} strokeWidth={2.2} /></div>
          </div>
        </div>
        <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 p-5 text-white shadow-lg shadow-emerald-200/60">
          <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
          <div className="relative flex h-full items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-white/85">Đang hoạt động</p>
              <p className="mt-2 text-4xl font-black leading-none">{stats.active}</p>
              <p className="mt-3 text-sm font-medium text-white/75">Có thể áp dụng</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><Check size={28} strokeWidth={2.2} /></div>
          </div>
        </div>
        <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-5 text-white shadow-lg shadow-orange-200/60">
          <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
          <div className="relative flex h-full items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-white/85">Lượt sử dụng</p>
              <p className="mt-2 text-4xl font-black leading-none">{stats.used}</p>
              <p className="mt-3 text-sm font-medium text-white/75">Tổng lượt đã áp dụng</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><Eye size={28} strokeWidth={2.2} /></div>
          </div>
        </div>
        <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 p-5 text-white shadow-lg shadow-purple-200/60">
          <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
          <div className="relative flex h-full items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-white/85">Phân loại mã</p>
              <p className="mt-2 text-4xl font-black leading-none">{stats.percentage} / {stats.total - stats.percentage}</p>
              <p className="mt-3 text-sm font-medium text-white/75">Phần trăm / Cố định</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><Percent size={28} strokeWidth={2.2} /></div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm mã giảm giá..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-80 pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold">
              <tr>
                <th className="px-6 py-4 text-left">Mã</th>
                <th className="px-6 py-4 text-center">Loại</th>
                <th className="px-6 py-4 text-center">Giá trị</th>
                <th className="px-6 py-4 text-center">Lượt dùng</th>
                <th className="px-6 py-4 text-center">Hết hạn</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                    <p className="text-sm text-slate-500 mt-2">Đang tải...</p>
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    Không có mã giảm giá nào
                  </td>
                </tr>
              ) : (
                filteredCoupons.map(coupon => {
                  const status = getStatus(coupon);
                  return (
                    <tr key={coupon.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                            {coupon.code}
                          </code>
                          <button
                            onClick={() => handleCopy(coupon.id, coupon.code)}
                            className="p-1 hover:bg-slate-100 rounded"
                          >
                            {copiedId === coupon.id ? (
                              <Check size={14} className="text-green-500" />
                            ) : (
                              <Copy size={14} className="text-slate-400" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${coupon.type === 'percentage'
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'bg-emerald-50 text-emerald-600'
                          }`}>
                          {coupon.type === 'percentage' ? <Percent size={12} /> : <DollarSign size={12} />}
                          {coupon.type === 'percentage' ? 'Phần trăm' : 'Cố định'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-900">
                        {coupon.type === 'percentage'
                          ? `${coupon.value}%`
                          : `${coupon.value.toLocaleString()}₫`}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-mono text-sm">
                          {coupon.used_count}/{coupon.usage_limit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-500">
                        {coupon.end_date
                          ? new Date(coupon.end_date).toLocaleDateString('vi-VN')
                          : 'Không giới hạn'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggle(coupon)}
                          className={`px-2 py-1 rounded text-xs font-bold ${status.class}`}
                        >
                          {status.label}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => router.push(`/admin/marketing/${coupon.id}`)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/marketing/${coupon.id}/edit`)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600"
                            title="Chỉnh sửa"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon)}
                            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CouponsManager;
