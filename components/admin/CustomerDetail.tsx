'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    Star,
    Package,
    CreditCard,
    Edit2,
    Ban,
    Loader2,
    ShoppingBag,
    Crown,
    MessageSquare,
    Settings,
} from 'lucide-react';
import { getProfileById, updateUserRole, type DbProfile } from '@/lib/profiles';
import { fetchUserOrders, type DbOrder } from '@/lib/orders';
import { fetchUserTickets, type DbTicket } from '@/lib/tickets';
import { useToast } from '@/context/ToastContext';

interface CustomerDetailProps {
    customerId: string;
}

export default function CustomerDetail({ customerId }: CustomerDetailProps) {
    const router = useRouter();
    const { addToast } = useToast();

    const [customer, setCustomer] = useState<DbProfile | null>(null);
    const [orders, setOrders] = useState<DbOrder[]>([]);
    const [tickets, setTickets] = useState<DbTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'tickets'>('overview');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [profileData, ordersData, ticketsData] = await Promise.all([
                getProfileById(customerId),
                fetchUserOrders(customerId),
                fetchUserTickets(customerId),
            ]);
            setCustomer(profileData);
            setOrders(ordersData);
            setTickets(ticketsData);
        } catch (error) {
            console.error('Error loading customer:', error);
            addToast('Không thể tải thông tin khách hàng', 'error');
        } finally {
            setLoading(false);
        }
    }, [customerId, addToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleChangeRole = async (newRole: DbProfile['role']) => {
        if (!customer) return;
        try {
            await updateUserRole(customer.id, newRole);
            setCustomer(prev => prev ? { ...prev, role: newRole } : null);
            addToast('Đã cập nhật vai trò', 'success');
        } catch (error) {
            addToast('Lỗi khi cập nhật', 'error');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + '₫';
    };

    const totalSpent = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.total, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-500 mb-4">Không tìm thấy khách hàng</p>
                <button
                    onClick={() => router.back()}
                    className="text-indigo-600 font-medium hover:underline"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Chi tiết khách hàng</h2>
                    <p className="text-sm text-slate-500">ID: {customer.id}</p>
                </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Cover */}
                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                    {customer.cover_image && (
                        <Image
                            src={customer.cover_image}
                            alt="Cover"
                            fill
                            className="object-cover"
                        />
                    )}
                </div>

                {/* Profile Info */}
                <div className="px-6 pb-6">
                    <div className="flex flex-col lg:flex-row gap-6 -mt-12">
                        {/* Avatar */}
                        <div className="relative">
                            {customer.avatar ? (
                                <Image
                                    src={customer.avatar}
                                    alt={customer.name}
                                    width={96}
                                    height={96}
                                    className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-indigo-100 flex items-center justify-center">
                                    <span className="text-3xl font-bold text-indigo-600">
                                        {customer.name?.charAt(0) || 'U'}
                                    </span>
                                </div>
                            )}
                            {customer.is_affiliate && (
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                                    <Crown size={16} className="text-white" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 pt-4 lg:pt-8">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900">{customer.name}</h3>
                                    <div className="flex flex-wrap items-center gap-3 mt-2">
                                        <span
                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase ${customer.role === 'admin'
                                                ? 'bg-indigo-100 text-indigo-700'
                                                : customer.role === 'seller'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-600'
                                                }`}
                                        >
                                            {customer.role === 'admin' && <Shield size={12} />}
                                            {customer.role}
                                        </span>
                                        {customer.is_affiliate && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-700">
                                                <Star size={12} fill="currentColor" />
                                                Affiliate
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <select
                                        value={customer.role}
                                        onChange={e => handleChangeRole(e.target.value as DbProfile['role'])}
                                        className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
                                    >
                                        <option value="user">User</option>
                                        <option value="seller">Seller</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium hover:bg-rose-100">
                                        <Ban size={16} /> Khóa
                                    </button>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <Mail size={18} className="text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Email</p>
                                        <p className="text-sm font-medium text-slate-700">{customer.email}</p>
                                    </div>
                                </div>
                                {customer.phone && (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                        <Phone size={18} className="text-slate-400" />
                                        <div>
                                            <p className="text-xs text-slate-500">Điện thoại</p>
                                            <p className="text-sm font-medium text-slate-700">{customer.phone}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <Calendar size={18} className="text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Ngày tham gia</p>
                                        <p className="text-sm font-medium text-slate-700">{formatDate(customer.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <ShoppingBag size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Đơn hàng</p>
                            <p className="text-xl font-bold text-slate-900">{orders.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <CreditCard size={20} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Tổng chi tiêu</p>
                            <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalSpent)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                            <MessageSquare size={20} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Tickets</p>
                            <p className="text-xl font-bold text-slate-900">{tickets.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Package size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Sản phẩm</p>
                            <p className="text-xl font-bold text-slate-900">
                                {orders.reduce((sum, o) => sum + (o.items?.length || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex border-b border-slate-100">
                    {[
                        { key: 'overview', label: 'Tổng quan' },
                        { key: 'orders', label: `Đơn hàng (${orders.length})` },
                        { key: 'tickets', label: `Hỗ trợ (${tickets.length})` },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as typeof activeTab)}
                            className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === tab.key
                                ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Recent Orders */}
                            <div>
                                <h4 className="font-bold text-slate-900 mb-4">Đơn hàng gần đây</h4>
                                {orders.slice(0, 3).length === 0 ? (
                                    <p className="text-slate-500 text-sm">Chưa có đơn hàng</p>
                                ) : (
                                    <div className="space-y-3">
                                        {orders.slice(0, 3).map(order => (
                                            <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">#{order.id}</p>
                                                    <p className="text-xs text-slate-500">{formatDate(order.created_at)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-slate-900">{formatCurrency(order.total)}</p>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                        order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Recent Tickets */}
                            <div>
                                <h4 className="font-bold text-slate-900 mb-4">Tickets gần đây</h4>
                                {tickets.slice(0, 3).length === 0 ? (
                                    <p className="text-slate-500 text-sm">Chưa có ticket</p>
                                ) : (
                                    <div className="space-y-3">
                                        {tickets.slice(0, 3).map(ticket => (
                                            <div key={ticket.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700 line-clamp-1">{ticket.subject}</p>
                                                    <p className="text-xs text-slate-500">{formatDate(ticket.created_at)}</p>
                                                </div>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${ticket.status === 'open' ? 'bg-rose-100 text-rose-700' :
                                                    ticket.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                    {ticket.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Mã đơn</th>
                                        <th className="px-4 py-3">Ngày</th>
                                        <th className="px-4 py-3">Sản phẩm</th>
                                        <th className="px-4 py-3">Tổng tiền</th>
                                        <th className="px-4 py-3">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {orders.map(order => (
                                        <tr key={order.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-900">#{order.id}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{formatDate(order.created_at)}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{order.items?.length || 0} sản phẩm</td>
                                            <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(order.total)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                    order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        order.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                                                            'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {orders.length === 0 && (
                                <p className="text-center py-10 text-slate-500">Không có đơn hàng</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'tickets' && (
                        <div className="space-y-3">
                            {tickets.map(ticket => (
                                <Link
                                    key={ticket.id}
                                    href={`/admin/customers/support?ticket=${ticket.id}`}
                                    className="block p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h5 className="font-medium text-slate-900">{ticket.subject}</h5>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {formatDate(ticket.created_at)} • {ticket.priority}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${ticket.status === 'open' ? 'bg-rose-100 text-rose-700' :
                                            ticket.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                            {tickets.length === 0 && (
                                <p className="text-center py-10 text-slate-500">Không có ticket hỗ trợ</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
