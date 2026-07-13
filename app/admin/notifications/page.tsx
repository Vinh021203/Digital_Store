'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Bell, Send, Users, Plus, Search, Filter, Trash2, Eye,
    Loader2, CheckCircle, AlertCircle, Gift, Star, Package,
    DollarSign, Ticket, RefreshCw
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createNotification, createBulkNotifications, type NotificationPayload } from '@/lib/notifications';
import { useToast } from '@/context/ToastContext';

interface Profile {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
}

interface NotificationStats {
    total: number;
    unread: number;
    today: number;
    types: Record<string, number>;
}

type NotificationType = 'order' | 'review' | 'ticket' | 'affiliate' | 'system' | 'promotion';

const NOTIFICATION_TYPES: { value: NotificationType; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'system', label: 'Hệ thống', icon: <AlertCircle size={18} />, color: 'slate' },
    { value: 'promotion', label: 'Khuyến mãi', icon: <Gift size={18} />, color: 'purple' },
    { value: 'order', label: 'Đơn hàng', icon: <Package size={18} />, color: 'orange' },
    { value: 'review', label: 'Đánh giá', icon: <Star size={18} />, color: 'amber' },
    { value: 'ticket', label: 'Hỗ trợ', icon: <Ticket size={18} />, color: 'blue' },
    { value: 'affiliate', label: 'Affiliate', icon: <DollarSign size={18} />, color: 'green' },
];

export default function AdminNotificationsPage() {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [sendLoading, setSendLoading] = useState(false);
    const [stats, setStats] = useState<NotificationStats>({
        total: 0, unread: 0, today: 0, types: {}
    });
    const [users, setUsers] = useState<Profile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        type: 'system' as NotificationType,
        title: '',
        message: '',
        link: '',
        sendToAll: false,
    });

    // Load users and stats
    const loadData = useCallback(async () => {
        setLoading(true);
        const supabase = createClient();
        if (!supabase) {
            setLoading(false);
            return;
        }

        try {
            // Fetch users for targeting
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, name, email, avatar')
                .order('name');

            if (profilesData) {
                setUsers(profilesData);
            }

            // Fetch notification stats
            const { count: totalCount } = await supabase
                .from('notifications')
                .select('id', { count: 'exact', head: true });

            const { count: unreadCount } = await supabase
                .from('notifications')
                .select('id', { count: 'exact', head: true })
                .eq('is_read', false);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const { count: todayCount } = await supabase
                .from('notifications')
                .select('id', { count: 'exact', head: true })
                .gte('created_at', today.toISOString());

            setStats({
                total: totalCount || 0,
                unread: unreadCount || 0,
                today: todayCount || 0,
                types: {}
            });
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Handle send notification
    const handleSend = async () => {
        if (!formData.title.trim() || !formData.message.trim()) {
            addToast('Vui lòng nhập tiêu đề và nội dung', 'error');
            return;
        }

        if (!formData.sendToAll && selectedUsers.length === 0) {
            addToast('Vui lòng chọn ít nhất 1 người nhận', 'error');
            return;
        }

        setSendLoading(true);
        try {
            const payload: Omit<NotificationPayload, 'user_id'> = {
                type: formData.type,
                title: formData.title.trim(),
                message: formData.message.trim(),
                link: formData.link.trim() || undefined,
            };

            if (formData.sendToAll) {
                // Send to all users
                const userIds = users.map(u => u.id);
                await createBulkNotifications(userIds, payload);
                addToast(`Đã gửi thông báo đến ${userIds.length} người dùng!`, 'success');
            } else {
                // Send to selected users
                await createBulkNotifications(selectedUsers, payload);
                addToast(`Đã gửi thông báo đến ${selectedUsers.length} người dùng!`, 'success');
            }

            // Reset form
            setFormData({
                type: 'system',
                title: '',
                message: '',
                link: '',
                sendToAll: false,
            });
            setSelectedUsers([]);
            loadData();
        } catch (error: any) {
            console.error('Error sending notification:', error);
            addToast(error.message || 'Có lỗi xảy ra', 'error');
        } finally {
            setSendLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleUserSelection = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const selectAllFiltered = () => {
        setSelectedUsers(filteredUsers.map(u => u.id));
    };

    const clearSelection = () => {
        setSelectedUsers([]);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <Bell className="text-orange-600" /> Quản Lý Thông Báo
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Gửi thông báo đến người dùng</p>
                </div>
                <button
                    onClick={loadData}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                >
                    <RefreshCw size={16} /> Làm mới
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-5 text-white shadow-lg shadow-orange-200/60">
                    <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
                    <div className="relative flex h-full items-center justify-between gap-3">
                    <div><p className="text-xs font-black uppercase tracking-wide text-white/85">Tổng thông báo</p>
                    <p className="mt-2 text-4xl font-black leading-none">{stats.total.toLocaleString()}</p><p className="mt-3 text-sm font-medium text-white/75">Tất cả thông báo đã tạo</p></div>
                    <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><Bell size={28} strokeWidth={2.2} /></div>
                    </div>
                </div>
                <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-5 text-white shadow-lg shadow-blue-200/60">
                    <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
                    <div className="relative flex h-full items-center justify-between gap-3">
                    <div><p className="text-xs font-black uppercase tracking-wide text-white/85">Chưa đọc</p>
                    <p className="mt-2 text-4xl font-black leading-none">{stats.unread.toLocaleString()}</p><p className="mt-3 text-sm font-medium text-white/75">Đang chờ người dùng xem</p></div>
                    <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><AlertCircle size={28} strokeWidth={2.2} /></div>
                    </div>
                </div>
                <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 p-5 text-white shadow-lg shadow-emerald-200/60">
                    <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
                    <div className="relative flex h-full items-center justify-between gap-3">
                    <div><p className="text-xs font-black uppercase tracking-wide text-white/85">Gửi hôm nay</p>
                    <p className="mt-2 text-4xl font-black leading-none">{stats.today}</p><p className="mt-3 text-sm font-medium text-white/75">Thông báo trong ngày</p></div>
                    <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><CheckCircle size={28} strokeWidth={2.2} /></div>
                    </div>
                </div>
                <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 p-5 text-white shadow-lg shadow-purple-200/60">
                    <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
                    <div className="relative flex h-full items-center justify-between gap-3">
                    <div><p className="text-xs font-black uppercase tracking-wide text-white/85">Người dùng</p>
                    <p className="mt-2 text-4xl font-black leading-none">{users.length}</p><p className="mt-3 text-sm font-medium text-white/75">Có thể nhận thông báo</p></div>
                    <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><Users size={28} strokeWidth={2.2} /></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Send Notification Form */}
                <div className="rounded-2xl border border-slate-100 border-t-4 border-t-orange-500 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:col-span-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Send size={20} className="text-orange-600" /> Gửi Thông Báo
                    </h2>

                    <div className="space-y-4">
                        {/* Type Selection */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Loại thông báo</label>
                            <div className="flex flex-wrap gap-2">
                                {NOTIFICATION_TYPES.map(type => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: type.value })}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${formData.type === type.value
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                            }`}
                                    >
                                        {type.icon} {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tiêu đề *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="VD: Ưu đãi đặc biệt cuối năm!"
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nội dung *</label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Nhập nội dung thông báo..."
                                rows={3}
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                            />
                        </div>

                        {/* Link */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Link (tùy chọn)</label>
                            <input
                                type="url"
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        {/* Send to All Toggle */}
                        <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                            <input
                                type="checkbox"
                                id="sendToAll"
                                checked={formData.sendToAll}
                                onChange={(e) => setFormData({ ...formData, sendToAll: e.target.checked })}
                                className="w-5 h-5 rounded accent-orange-600"
                            />
                            <label htmlFor="sendToAll" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                Gửi đến tất cả {users.length} người dùng
                            </label>
                        </div>

                        {/* Send Button */}
                        <button
                            onClick={handleSend}
                            disabled={sendLoading}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-200 disabled:opacity-60"
                        >
                            {sendLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <Send size={20} />
                            )}
                            {formData.sendToAll
                                ? `Gửi đến ${users.length} người dùng`
                                : selectedUsers.length > 0
                                    ? `Gửi đến ${selectedUsers.length} người đã chọn`
                                    : 'Gửi Thông Báo'
                            }
                        </button>
                    </div>
                </div>

                {/* User Selection */}
                <div className="rounded-2xl border border-slate-100 border-t-4 border-t-blue-500 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Users size={20} className="text-blue-600" /> Chọn Người Nhận
                    </h2>

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm người dùng..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={selectAllFiltered}
                            className="flex-1 text-xs font-bold text-blue-600 hover:text-blue-700 py-2 bg-blue-50 rounded-lg"
                        >
                            Chọn tất cả ({filteredUsers.length})
                        </button>
                        <button
                            onClick={clearSelection}
                            className="flex-1 text-xs font-bold text-slate-600 hover:text-slate-700 py-2 bg-slate-100 rounded-lg"
                        >
                            Bỏ chọn ({selectedUsers.length})
                        </button>
                    </div>

                    {/* User List */}
                    <div className="max-h-[400px] overflow-y-auto space-y-2">
                        {filteredUsers.map(user => (
                            <label
                                key={user.id}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedUsers.includes(user.id)
                                    ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user.id)}
                                    onChange={() => toggleUserSelection(user.id)}
                                    className="w-4 h-4 rounded accent-orange-600"
                                />
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        user.name?.charAt(0) || '?'
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                </div>
                            </label>
                        ))}

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                <Users size={32} className="mx-auto text-slate-300 mb-2" />
                                <p className="text-sm">Không tìm thấy người dùng</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
