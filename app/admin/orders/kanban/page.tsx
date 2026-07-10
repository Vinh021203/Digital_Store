'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    MoreHorizontal, Clock, CheckCircle, Truck, AlertCircle,
    Package, Calendar, Eye, ArrowRight, Loader2, RefreshCw,
    CreditCard, Ban
} from 'lucide-react';
import { fetchOrders, type DbOrder } from '@/lib/orders';

interface OrderCardProps {
    order: DbOrder;
    onClick: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
    const customerName = order.billing_name || order.user?.name || 'Khách hàng';
    const customerEmail = order.billing_email || order.user?.email || '';
    const orderDate = new Date(order.created_at).toLocaleDateString('vi-VN');

    return (
        <div
            onClick={onClick}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group relative"
        >
            {/* Order ID Badge */}
            <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                    #{order.id}
                </span>
                <button
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-50 rounded-lg"
                >
                    <MoreHorizontal size={16} />
                </button>
            </div>

            {/* Customer Info */}
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                {order.user?.avatar ? (
                    <Image src={order.user.avatar} alt={customerName} width={28} height={28} className="h-7 w-7 shrink-0 rounded-full border-2 border-white object-cover shadow-sm" />
                ) : (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-indigo-100 to-indigo-200 text-[11px] font-bold text-indigo-700 shadow-sm">{customerName.charAt(0).toUpperCase()}</div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{customerName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{customerEmail}</p>
                </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-3">
                <Calendar size={10} />
                <span>{orderDate}</span>
            </div>

            {/* Footer: Price + Quick Action */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <div>
                    <span className="text-sm font-bold text-emerald-600">
                        {Number(order.total).toLocaleString('vi-VN')}₫
                    </span>
                    {order.discount > 0 && (
                        <span className="text-[10px] text-green-600 ml-1">
                            (-{Number(order.discount).toLocaleString('vi-VN')}₫)
                        </span>
                    )}
                </div>
                <button
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Xem chi tiết"
                >
                    <Eye size={16} />
                </button>
            </div>
        </div>
    );
};

const OrderKanbanPage = () => {
    const router = useRouter();
    const [orders, setOrders] = useState<DbOrder[]>([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await fetchOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    // Group orders by status
    const groupedOrders = useMemo(() => ({
        pending: orders.filter(o => o.status === 'pending'),
        paid: orders.filter(o => o.status === 'paid'),
        completed: orders.filter(o => o.status === 'completed'),
        cancelled: orders.filter(o => o.status === 'cancelled' || o.status === 'refunded'),
    }), [orders]);

    // Calculate totals for each column
    const calculateTotal = (orderList: DbOrder[]) =>
        orderList.reduce((sum, order) => sum + Number(order.total), 0);

    const columns = [
        {
            id: 'pending',
            title: 'Chờ thanh toán',
            icon: Clock,
            orders: groupedOrders.pending,
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            textColor: 'text-amber-700',
            iconBg: 'bg-amber-100'
        },
        {
            id: 'paid',
            title: 'Đã thanh toán',
            icon: CreditCard,
            orders: groupedOrders.paid,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-700',
            iconBg: 'bg-blue-100'
        },
        {
            id: 'completed',
            title: 'Hoàn thành',
            icon: CheckCircle,
            orders: groupedOrders.completed,
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200',
            textColor: 'text-emerald-700',
            iconBg: 'bg-emerald-100'
        },
        {
            id: 'cancelled',
            title: 'Đã hủy / Hoàn tiền',
            icon: Ban,
            orders: groupedOrders.cancelled,
            bgColor: 'bg-rose-50',
            borderColor: 'border-rose-200',
            textColor: 'text-rose-700',
            iconBg: 'bg-rose-100'
        }
    ];

    const handleOrderClick = (orderId: number) => {
        router.push(`/admin/orders/${orderId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-slate-500">Đang tải đơn hàng...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Kanban Đơn Hàng</h1>
                    <p className="text-sm text-slate-500">{orders.length} đơn hàng</p>
                </div>
                <button
                    onClick={loadOrders}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                    <RefreshCw size={16} />
                    Làm mới
                </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {columns.map((column) => (
                    <div
                        key={column.id}
                        className={`${column.bgColor} p-4 rounded-xl border ${column.borderColor} relative overflow-hidden`}
                    >
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    {column.title}
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {column.orders.length}
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                    {calculateTotal(column.orders).toLocaleString('vi-VN')}₫
                                </p>
                            </div>
                            <div className={`p-2.5 ${column.iconBg} rounded-xl`}>
                                <column.icon size={20} className={column.textColor} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Kanban Board */}
            <div className="overflow-x-auto pb-6 -mx-4 px-4 custom-scrollbar">
                <div className="flex gap-5 min-w-[1200px]">
                    {columns.map((column) => (
                        <div key={column.id} className="flex-1 min-w-[280px] flex flex-col">
                            {/* Column Header */}
                            <div className={`flex items-center justify-between mb-4 p-4 ${column.bgColor} rounded-xl border-2 ${column.borderColor} sticky top-0 z-20 backdrop-blur-sm bg-opacity-90`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 ${column.iconBg} rounded-lg`}>
                                        <column.icon size={18} className={column.textColor} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-sm">
                                            {column.title}
                                        </h3>
                                        <p className="text-[10px] text-slate-500 font-medium">
                                            {column.orders.length} đơn hàng
                                        </p>
                                    </div>
                                </div>
                                <div className={`${column.iconBg} ${column.textColor} px-2.5 py-1 rounded-lg text-xs font-bold border ${column.borderColor}`}>
                                    {calculateTotal(column.orders).toLocaleString('vi-VN', { notation: 'compact' })}₫
                                </div>
                            </div>

                            {/* Column Content */}
                            <div className="space-y-3 flex-1 bg-slate-50/50 p-3 rounded-xl border-2 border-dashed border-slate-200 min-h-[400px]">
                                {column.orders.length > 0 ? (
                                    column.orders.map((order) => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                            onClick={() => handleOrderClick(order.id)}
                                        />
                                    ))
                                ) : (
                                    <div className="h-32 flex flex-col items-center justify-center text-slate-400">
                                        <Package size={28} className="mb-2 opacity-30" />
                                        <span className="text-xs font-medium">Chưa có đơn hàng</span>
                                    </div>
                                )}
                            </div>

                            {/* Column Footer Stats */}
                            <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500 font-medium">Tổng giá trị</span>
                                    <span className="font-bold text-slate-900">
                                        {calculateTotal(column.orders).toLocaleString('vi-VN')}₫
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrderKanbanPage;
