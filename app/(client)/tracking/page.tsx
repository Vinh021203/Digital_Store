'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, Search, Package, Truck, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function TrackingPage() {
    const { addToast } = useToast();
    const [orderCode, setOrderCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<any>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderCode.trim()) {
            addToast('Vui lòng nhập mã đơn hàng', 'error');
            return;
        }
        setLoading(true);
        try {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            if (!supabase) return;

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', parseInt(orderCode))
                .single();

            if (error || !data) {
                addToast('Không tìm thấy đơn hàng', 'error');
                setOrder(null);
            } else {
                setOrder(data);
            }
        } catch (error) {
            addToast('Có lỗi xảy ra', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'completed': case 'paid':
                return { label: 'Hoàn thành', color: 'green', icon: CheckCircle };
            case 'pending':
                return { label: 'Chờ thanh toán', color: 'yellow', icon: Package };
            default:
                return { label: status, color: 'slate', icon: Package };
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-orange-600 flex items-center gap-1">
                        <Home size={14} /> Trang chủ
                    </Link>
                    <ChevronRight size={14} />
                    <span className="text-slate-900 font-medium">Theo dõi đơn hàng</span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-8">
                    <div className="text-center mb-8">
                        <Truck size={48} className="mx-auto text-orange-500 mb-4" />
                        <h1 className="text-2xl font-black text-slate-900 mb-2">Theo dõi đơn hàng</h1>
                        <p className="text-slate-500">Nhập mã đơn hàng để kiểm tra trạng thái</p>
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-3 mb-8">
                        <input
                            type="text"
                            placeholder="Nhập mã đơn hàng (VD: 123)"
                            value={orderCode}
                            onChange={e => setOrderCode(e.target.value)}
                            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-orange-600 text-white px-6 rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                            Tra cứu
                        </button>
                    </form>

                    {order && (
                        <div className="border-t pt-6">
                            <h3 className="font-bold text-slate-900 mb-4">Thông tin đơn hàng #{order.id}</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Trạng thái</span>
                                    <span className={`font-bold text-${getStatusInfo(order.status).color}-600`}>
                                        {getStatusInfo(order.status).label}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Tổng tiền</span>
                                    <span className="font-bold text-orange-600">{order.total?.toLocaleString()}₫</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Ngày đặt</span>
                                    <span>{new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
