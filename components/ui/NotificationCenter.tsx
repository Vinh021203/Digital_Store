'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Bell, X, Check, CheckCheck, Trash2, DollarSign, Package,
    Gift, AlertCircle, Star, Clock, Ticket, Users, Loader2, PartyPopper
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    fetchUserNotifications,
    getUnreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    deleteReadNotifications,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    type DbNotification
} from '@/lib/notifications';

// ============================================
// Icon & Style Helpers
// ============================================
const getTypeIcon = (type: DbNotification['type']) => {
    switch (type) {
        case 'order': return <Package size={16} className="text-orange-500" />;
        case 'review': return <Star size={16} className="text-amber-500" />;
        case 'ticket': return <Ticket size={16} className="text-blue-500" />;
        case 'affiliate': return <Users size={16} className="text-green-500" />;
        case 'promotion': return <Gift size={16} className="text-purple-500" />;
        case 'system': return <AlertCircle size={16} className="text-slate-500" />;
        case 'welcome': return <PartyPopper size={16} className="text-pink-500" />;
        default: return <Bell size={16} className="text-slate-500" />;
    }
};

const getTypeBgColor = (type: DbNotification['type']) => {
    switch (type) {
        case 'order': return 'bg-orange-100';
        case 'review': return 'bg-amber-100';
        case 'ticket': return 'bg-blue-100';
        case 'affiliate': return 'bg-green-100';
        case 'promotion': return 'bg-purple-100';
        case 'system': return 'bg-slate-100';
        case 'welcome': return 'bg-pink-100';
        default: return 'bg-slate-100';
    }
};

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
};

// ============================================
// NotificationCenter Component
// ============================================
interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
    onCountChange?: (count: number) => void;
}

export function NotificationCenter({ isOpen, onClose, onCountChange }: NotificationCenterProps) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<DbNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const loadNotifications = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await fetchUserNotifications(user.id, { limit: 20 });
            setNotifications(data);
            const unreadCount = data.filter(n => !n.is_read).length;
            onCountChange?.(unreadCount);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id, onCountChange]);

    useEffect(() => {
        if (isOpen && user?.id) {
            loadNotifications();
        }
    }, [isOpen, user?.id, loadNotifications]);

    // Real-time subscription for new notifications
    useEffect(() => {
        if (!user?.id) return;

        // Initial count fetch
        const fetchCount = async () => {
            const count = await getUnreadNotificationCount(user.id);
            onCountChange?.(count);
        };
        fetchCount();

        // Interval polling for new notifications (every 30 seconds)
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, [user?.id, onCountChange]);

    const handleMarkAsRead = async (id: number) => {
        setActionLoading(id);
        try {
            await markNotificationRead(id);
            // Find the notification being marked
            const targetNotification = notifications.find(n => n.id === id);
            // Update local state
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            // Only decrease count if it was unread before
            if (targetNotification && !targetNotification.is_read) {
                const currentUnread = notifications.filter(n => !n.is_read).length;
                onCountChange?.(Math.max(0, currentUnread - 1));
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            await markAllNotificationsRead(user.id);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            onCountChange?.(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        setActionLoading(id);
        try {
            await deleteNotification(id);
            const deleted = notifications.find(n => n.id === id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (deleted && !deleted.is_read) {
                const currentUnread = notifications.filter(n => !n.is_read).length;
                onCountChange?.(currentUnread - 1);
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleClearAllRead = async () => {
        if (!user?.id) return;
        try {
            await deleteReadNotifications(user.id);
            setNotifications(prev => prev.filter(n => !n.is_read));
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;
    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.is_read)
        : notifications;

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop - click outside to close */}
            <div
                className="fixed inset-0 z-[100] bg-transparent"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Dropdown */}
            <div className="fixed right-4 top-11 lg:right-6 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[101] animate-fade-in">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-amber-50">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-black text-slate-900 flex items-center gap-2">
                            <Bell size={18} className="text-orange-600" />
                            Thông báo
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    disabled={loading}
                                    className="text-xs font-bold text-orange-600 hover:text-orange-700 disabled:opacity-50"
                                >
                                    <CheckCheck size={14} className="inline mr-1" />
                                    Đọc tất cả
                                </button>
                            )}
                            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
                                <X size={18} className="text-slate-400" />
                            </button>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                        {(['all', 'unread'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === tab
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {tab === 'all' ? 'Tất cả' : `Chưa đọc (${unreadCount})`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-[400px] overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center">
                            <Loader2 size={32} className="mx-auto text-orange-600 animate-spin" />
                        </div>
                    ) : !user?.id ? (
                        <div className="p-8 text-center">
                            <Bell size={40} className="mx-auto text-slate-200 mb-3" />
                            <p className="text-slate-500 mb-2">Vui lòng đăng nhập</p>
                            <p className="text-xs text-slate-400">Để xem thông báo của bạn</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell size={40} className="mx-auto text-slate-200 mb-3" />
                            <p className="text-slate-500">Không có thông báo</p>
                        </div>
                    ) : (
                        filteredNotifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors relative ${!notification.is_read ? 'bg-orange-50/50' : ''
                                    }`}
                            >
                                {!notification.is_read && (
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full" />
                                )}
                                <div className="flex gap-3 pl-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeBgColor(notification.type)}`}>
                                        {getTypeIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm">{notification.title}</h4>
                                                <p className="text-sm text-slate-600 line-clamp-2">{notification.message}</p>
                                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                    <Clock size={10} /> {formatTime(notification.created_at)}
                                                </p>
                                            </div>
                                            <div className="flex gap-1 flex-shrink-0">
                                                {!notification.is_read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        disabled={actionLoading === notification.id}
                                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-green-600 disabled:opacity-50"
                                                        title="Đánh dấu đã đọc"
                                                    >
                                                        {actionLoading === notification.id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Check size={14} />
                                                        )}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(notification.id)}
                                                    disabled={actionLoading === notification.id}
                                                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 disabled:opacity-50"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        {notification.link && (
                                            <Link
                                                href={notification.link}
                                                onClick={onClose}
                                                className="inline-block mt-2 text-xs font-bold text-orange-600 hover:text-orange-700"
                                            >
                                                Xem chi tiết →
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="p-3 border-t border-slate-100 flex items-center justify-between">
                        <Link
                            href="/profile"
                            onClick={onClose}
                            className="text-sm font-bold text-slate-600 hover:text-orange-600"
                        >
                            Xem tất cả
                        </Link>
                        <button
                            onClick={handleClearAllRead}
                            className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1"
                        >
                            <Trash2 size={12} /> Xóa đã đọc
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

// ============================================
// Badge Component for Navbar
// ============================================
export function NotificationBadge({ count }: { count: number }) {
    if (count === 0) return null;

    return (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            {count > 9 ? '9+' : count}
        </span>
    );
}

// ============================================
// Hook to use notifications (with real data + realtime)
// ============================================
export function useNotifications() {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const channelRef = useRef<any>(null);

    useEffect(() => {
        const loadCount = async () => {
            if (!user?.id) {
                setUnreadCount(0);
                setLoading(false);
                return;
            }
            try {
                const count = await getUnreadNotificationCount(user.id);
                setUnreadCount(count);
            } catch (error) {
                console.error('Error loading notification count:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCount();

        // Setup realtime subscription
        if (user?.id) {
            channelRef.current = subscribeToNotifications(user.id, (newNotification) => {
                // New notification arrived - increment count
                if (!newNotification.is_read) {
                    setUnreadCount(prev => prev + 1);
                }
            });
        }

        // Fallback polling every 60 seconds
        const interval = setInterval(loadCount, 60000);

        return () => {
            clearInterval(interval);
            if (channelRef.current) {
                unsubscribeFromNotifications(channelRef.current);
            }
        };
    }, [user?.id]);

    return {
        unreadCount,
        loading,
        setUnreadCount,
        refresh: async () => {
            if (!user?.id) return;
            const count = await getUnreadNotificationCount(user.id);
            setUnreadCount(count);
        }
    };
}

export default NotificationCenter;
