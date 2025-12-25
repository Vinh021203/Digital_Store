'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft, Package, User, Mail, CreditCard, Calendar,
    CheckCircle, Clock, AlertCircle, Loader2, FileText, Download
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface OrderItem {
    id: number;
    product_name: string;
    product_image: string;
    price: number;
    license_type: string;
}

interface Order {
    id: number;
    status: string;
    total: number;
    discount: number;
    payment_method: string;
    billing_name: string;
    billing_email: string;
    created_at: string;
    items?: OrderItem[];
}

export default function OrderDetail({ orderId }: { orderId: string }) {
    const { addToast } = useToast();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrder = async () => {
            try {
                const { createClient } = await import('@/lib/supabase/client');
                const supabase = createClient();
                if (!supabase) return;

                const { data } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        items:order_items(*)
                    `)
                    .eq('id', orderId)
                    .single();

                setOrder(data);
            } catch (error) {
                console.error('Error loading order:', error);
            } finally {
                setLoading(false);
            }
        };
        loadOrder();
    }, [orderId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': case 'paid': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': case 'paid': return CheckCircle;
            case 'pending': return Clock;
            case 'cancelled': return AlertCircle;
            default: return Package;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-16">
                <Package size={48} className="mx-auto text-slate-200 mb-4" />
                <h2 className="text-xl font-bold text-slate-900">Không tìm thấy đơn hàng</h2>
                <p className="text-slate-500 mb-4">Đơn hàng #{orderId} không tồn tại</p>
                <Link href="/admin/orders" className="text-orange-600 font-bold hover:underline">
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    const StatusIcon = getStatusIcon(order.status);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders" className="p-2 hover:bg-slate-100 rounded-lg">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Đơn hàng #{order.id}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {new Date(order.created_at).toLocaleString('vi-VN')}
                        </p>
                    </div>
                </div>
                <span className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 ${getStatusColor(order.status)}`}>
                    <StatusIcon size={16} />
                    {order.status.toUpperCase()}
                </span>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="bg-white rounded-xl border border-slate-100 p-6">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <User size={18} className="text-orange-600" />
                        Thông tin khách hàng
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <User size={16} className="text-slate-400" />
                            <span>{order.billing_name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail size={16} className="text-slate-400" />
                            <span>{order.billing_email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CreditCard size={16} className="text-slate-400" />
                            <span>{order.payment_method}</span>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-xl border border-slate-100 p-6">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-orange-600" />
                        Tổng quan đơn hàng
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Tổng tiền</span>
                            <span className="font-bold">{(order.total + order.discount).toLocaleString()}₫</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Giảm giá</span>
                                <span>-{order.discount.toLocaleString()}₫</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-3 border-t font-bold text-lg">
                            <span>Thành tiền</span>
                            <span className="text-orange-600">{order.total.toLocaleString()}₫</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl border border-slate-100 p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Package size={18} className="text-orange-600" />
                    Sản phẩm ({order.items?.length || 0})
                </h3>
                <div className="space-y-4">
                    {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                            <div className="w-16 h-16 rounded-lg overflow-hidden relative flex-shrink-0">
                                <Image
                                    src={item.product_image || '/placeholder.png'}
                                    alt={item.product_name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900">{item.product_name}</h4>
                                <span className="text-xs text-orange-600 font-medium">{item.license_type}</span>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-slate-900">{item.price.toLocaleString()}₫</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
