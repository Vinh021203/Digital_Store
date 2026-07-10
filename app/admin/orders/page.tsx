'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search, Download, Eye, MoreHorizontal,
  CheckCircle, Clock, Truck, XCircle,
  LayoutList, Kanban, RefreshCw, Loader2
} from 'lucide-react';
import { fetchOrders, type DbOrder } from '@/lib/orders';
import OrderKanban from '@/components/admin/OrderKanban';

type ViewMode = 'list' | 'kanban';
type StatusFilter = 'all' | 'pending' | 'paid' | 'completed' | 'refunded' | 'cancelled';

// Map DB status to display status
const getDisplayStatus = (status: string) => {
  const map: Record<string, string> = {
    'pending': 'Pending',
    'paid': 'Processing',
    'completed': 'Completed',
    'refunded': 'Refunded',
    'cancelled': 'Cancelled',
  };
  return map[status] || status;
};

const OrdersManager = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<10 | 20 | 50>(10);

  // Fetch orders from Supabase
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'paid':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'refunded':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={14} />;
      case 'paid':
        return <Truck size={14} />;
      case 'pending':
        return <Clock size={14} />;
      case 'cancelled':
      case 'refunded':
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  // Summary stats
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const paid = orders.filter(o => o.status === 'paid').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    const totalRevenue = orders
      .filter(o => o.status === 'paid' || o.status === 'completed')
      .reduce((sum, o) => sum + Number(o.total), 0);
    return { total, pending, paid, completed, cancelled, totalRevenue };
  }, [orders]);

  // Filtered data
  const filteredOrders = useMemo(
    () =>
      orders.filter(order => {
        const matchesStatus =
          statusFilter === 'all' || order.status === statusFilter;
        const term = searchTerm.toLowerCase().trim();
        const customerName = order.billing_name || order.user?.name || '';
        const matchesSearch =
          !term ||
          order.id.toString().includes(term) ||
          customerName.toLowerCase().includes(term);
        return matchesStatus && matchesSearch;
      }),
    [orders, statusFilter, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, pageSize]);

  const statusTabs: { key: StatusFilter; label: string; count?: number }[] = [
    { key: 'all', label: 'Tất cả', count: stats.total },
    { key: 'pending', label: 'Chờ TT', count: stats.pending },
    { key: 'paid', label: 'Đã TT', count: stats.paid },
    { key: 'completed', label: 'Hoàn thành', count: stats.completed },
    { key: 'cancelled', label: 'Hủy', count: stats.cancelled },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Quản Lý Đơn Hàng</h2>
            <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-xs font-bold">
              {filteredOrders.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tổng: {stats.total} • Completed: {stats.completed} • Pending: {stats.pending}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm mã đơn, khách hàng..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* View mode */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                ? 'bg-white shadow text-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
                }`}
              title="Danh sách"
            >
              <LayoutList size={18} />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'kanban'
                ? 'bg-white shadow text-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
                }`}
              title="Kanban"
            >
              <Kanban size={18} />
            </button>
          </div>

          {/* Export */}
          <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
            <Download size={18} /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Kanban / List view */}
      {viewMode === 'kanban' ? (
        // ✅ OrderKanban phải nhận props orders
        <OrderKanban orders={filteredOrders} />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Status tabs */}
          <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
            {statusTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-5 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-2 border-b-2 transition-colors ${statusFilter === tab.key
                  ? 'text-indigo-600 border-indigo-600 bg-indigo-50/40'
                  : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
                  }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Mã đơn</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4 hidden sm:table-cell">Ngày đặt</th>
                  <th className="px-6 py-4">Tổng tiền</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                      <p className="text-sm text-slate-500 mt-2">Đang tải...</p>
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map(order => {
                    const customerName = order.billing_name || order.user?.name || 'Khách hàng';
                    const orderDate = new Date(order.created_at).toLocaleDateString('vi-VN');

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-slate-600">
                            #{order.id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {order.user?.avatar ? (
                              <Image src={order.user.avatar} alt={customerName} width={32} height={32} className="h-8 w-8 shrink-0 rounded-full border border-slate-200 object-cover" />
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">{customerName.charAt(0).toUpperCase()}</div>
                            )}
                            <div>
                              <span className="font-bold text-slate-900 text-sm block">
                                {customerName}
                              </span>
                              <span className="text-xs text-slate-400">
                                {order.billing_email || order.user?.email || ''}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 hidden sm:table-cell">
                          {orderDate}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900">
                            {Number(order.total).toLocaleString('vi-VN')}₫
                          </span>
                          {order.discount > 0 && (
                            <span className="text-xs text-green-600 ml-1">
                              (-{Number(order.discount).toLocaleString('vi-VN')}₫)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            {getDisplayStatus(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                            <button
                              onClick={() =>
                                router.push(`/admin/orders/${order.id}`)
                              }
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors shadow-sm border border-transparent hover:border-slate-200"
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors shadow-sm border border-transparent hover:border-slate-200">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}

                {!loading && filteredOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-sm text-slate-500"
                    >
                      Không có đơn hàng nào phù hợp bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/30 p-4 text-xs text-slate-500 sm:flex-row">
            <span>
              Hiển thị {filteredOrders.length === 0 ? 0 : pageStart + 1}–{Math.min(pageStart + pageSize, filteredOrders.length)} / {filteredOrders.length} đơn
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <label htmlFor="orders-page-size" className="font-semibold text-slate-500">Số dòng</label>
              <select
                id="orders-page-size"
                value={pageSize}
                onChange={event => setPageSize(Number(event.target.value) as 10 | 20 | 50)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-2 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="min-w-[72px] text-center font-semibold">Trang {safeCurrentPage}/{totalPages}</span>
              <button
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={safeCurrentPage <= 1}
                className="h-9 rounded-lg border border-slate-200 px-3 font-bold hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="h-9 rounded-lg border border-slate-200 px-3 font-bold hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
