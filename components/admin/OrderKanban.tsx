'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { DbOrder } from '@/lib/orders';
import { CheckCircle, Clock, CreditCard, XCircle, Package, Ban } from 'lucide-react';

interface OrderKanbanProps {
  orders: DbOrder[]; // Props từ trang orders manager
}

type OrderStatus = 'pending' | 'paid' | 'completed' | 'refunded' | 'cancelled';

const OrderKanban: React.FC<OrderKanbanProps> = ({ orders }) => {
  // Group orders by status
  const ordersByStatus = useMemo(() => {
    const groups: Record<OrderStatus, DbOrder[]> = {
      pending: [],
      paid: [],
      completed: [],
      refunded: [],
      cancelled: [],
    };

    orders.forEach(order => {
      if (groups[order.status as OrderStatus]) {
        groups[order.status as OrderStatus].push(order);
      }
    });

    return groups;
  }, [orders]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 border-emerald-200';
      case 'paid':
        return 'bg-blue-50 border-blue-200';
      case 'pending':
        return 'bg-amber-50 border-amber-200';
      case 'cancelled':
        return 'bg-rose-50 border-rose-200';
      case 'refunded':
        return 'bg-slate-50 border-slate-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-emerald-600" />;
      case 'paid':
        return <CreditCard size={16} className="text-blue-600" />;
      case 'pending':
        return <Clock size={16} className="text-amber-600" />;
      case 'cancelled':
        return <Ban size={16} className="text-rose-600" />;
      case 'refunded':
        return <Package size={16} className="text-slate-600" />;
      default:
        return <Clock size={16} className="text-slate-600" />;
    }
  };

  const columns: { status: OrderStatus; label: string }[] = [
    { status: 'pending', label: 'Chờ thanh toán' },
    { status: 'paid', label: 'Đã thanh toán' },
    { status: 'completed', label: 'Hoàn thành' },
    { status: 'cancelled', label: 'Đã hủy' },
    { status: 'refunded', label: 'Hoàn tiền' },
  ];

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {columns.map(column => {
          const columnOrders = ordersByStatus[column.status] || [];

          return (
            <div
              key={column.status}
              className="flex-shrink-0 w-72 bg-slate-50 rounded-xl p-4"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(column.status)}
                  <h3 className="font-bold text-slate-900">{column.label}</h3>
                </div>
                <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-slate-600">
                  {columnOrders.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {columnOrders.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-400">
                    Không có đơn hàng
                  </div>
                ) : (
                  columnOrders.map(order => {
                    const customerName = order.billing_name || order.user?.name || 'Khách hàng';
                    const orderDate = new Date(order.created_at).toLocaleDateString('vi-VN');

                    return (
                      <div
                        key={order.id}
                        className={`bg-white rounded-lg border-2 p-4 hover:shadow-md transition-all cursor-pointer ${getStatusColor(
                          column.status
                        )}`}
                      >
                        {/* Order ID */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono font-bold text-sm text-slate-700">
                            #{order.id}
                          </span>
                          <span className="text-xs text-slate-500">{orderDate}</span>
                        </div>

                        {/* Customer */}
                        <div className="flex items-center gap-2 mb-3">
                          {order.user?.avatar ? (
                            <Image src={order.user.avatar} alt={customerName} width={24} height={24} className="h-6 w-6 shrink-0 rounded-full border border-slate-200 object-cover" />
                          ) : (
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">{customerName.charAt(0).toUpperCase()}</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold text-slate-900 truncate block">
                              {customerName}
                            </span>
                            {(order.billing_email || order.user?.email) && (
                              <span className="text-[10px] text-slate-400 truncate block">
                                {order.billing_email || order.user?.email}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Total */}
                        <div className="pt-3 border-t border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Tổng tiền</span>
                            <div>
                              <span className="font-bold text-slate-900">
                                {Number(order.total).toLocaleString('vi-VN')}₫
                              </span>
                              {order.discount > 0 && (
                                <span className="text-[10px] text-green-600 ml-1">
                                  (-{Number(order.discount).toLocaleString('vi-VN')}₫)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderKanban;
