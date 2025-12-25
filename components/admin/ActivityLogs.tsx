'use client';

import React, { useState, memo } from 'react';
import {
    Activity, User, Package, ShoppingCart, Settings, Trash2, Edit2,
    Plus, Eye, Download, Upload, Clock, Filter, Search, ChevronLeft,
    ChevronRight, AlertTriangle, CheckCircle, Info, XCircle
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
export interface ActivityLog {
    id: string;
    action: 'create' | 'update' | 'delete' | 'view' | 'download' | 'login' | 'logout' | 'export' | 'settings';
    entity: 'product' | 'order' | 'user' | 'coupon' | 'settings' | 'system';
    entityId?: string;
    entityName?: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    timestamp: string;
    details?: string;
    ip?: string;
    severity: 'info' | 'warning' | 'error' | 'success';
}

// ============================================
// SAMPLE DATA
// ============================================
const SAMPLE_LOGS: ActivityLog[] = [
    {
        id: '1',
        action: 'create',
        entity: 'product',
        entityName: 'Premium Dashboard Template',
        userId: 'admin1',
        userName: 'Admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        details: 'Tạo sản phẩm mới với giá 599,000₫',
        severity: 'success',
    },
    {
        id: '2',
        action: 'update',
        entity: 'order',
        entityId: 'ORD-12345',
        entityName: 'Đơn hàng #12345',
        userId: 'admin1',
        userName: 'Admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        details: 'Cập nhật trạng thái thành "Đã thanh toán"',
        severity: 'info',
    },
    {
        id: '3',
        action: 'delete',
        entity: 'coupon',
        entityName: 'EXPIRED2023',
        userId: 'admin2',
        userName: 'Moderator',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        details: 'Xóa mã giảm giá hết hạn',
        severity: 'warning',
    },
    {
        id: '4',
        action: 'login',
        entity: 'system',
        userId: 'admin1',
        userName: 'Admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        ip: '192.168.1.100',
        severity: 'info',
    },
    {
        id: '5',
        action: 'export',
        entity: 'order',
        entityName: 'Báo cáo tháng 12',
        userId: 'admin1',
        userName: 'Admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        details: 'Xuất 156 đơn hàng sang CSV',
        severity: 'success',
    },
];

// ============================================
// HELPERS
// ============================================
const getActionIcon = (action: ActivityLog['action']) => {
    const icons = {
        create: Plus,
        update: Edit2,
        delete: Trash2,
        view: Eye,
        download: Download,
        login: User,
        logout: User,
        export: Upload,
        settings: Settings,
    };
    return icons[action] || Activity;
};

const getEntityIcon = (entity: ActivityLog['entity']) => {
    const icons = {
        product: Package,
        order: ShoppingCart,
        user: User,
        coupon: Activity,
        settings: Settings,
        system: Activity,
    };
    return icons[entity] || Activity;
};

const getSeverityStyle = (severity: ActivityLog['severity']) => {
    const styles = {
        info: { bg: 'bg-blue-100', text: 'text-blue-600', icon: Info },
        warning: { bg: 'bg-amber-100', text: 'text-amber-600', icon: AlertTriangle },
        error: { bg: 'bg-red-100', text: 'text-red-600', icon: XCircle },
        success: { bg: 'bg-green-100', text: 'text-green-600', icon: CheckCircle },
    };
    return styles[severity];
};

const getActionLabel = (action: ActivityLog['action']) => {
    const labels = {
        create: 'Tạo mới',
        update: 'Cập nhật',
        delete: 'Xóa',
        view: 'Xem',
        download: 'Tải xuống',
        login: 'Đăng nhập',
        logout: 'Đăng xuất',
        export: 'Xuất dữ liệu',
        settings: 'Cài đặt',
    };
    return labels[action];
};

const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
};

// ============================================
// LOG ITEM COMPONENT
// ============================================
const LogItem = memo(({ log }: { log: ActivityLog }) => {
    const ActionIcon = getActionIcon(log.action);
    const severity = getSeverityStyle(log.severity);
    const SeverityIcon = severity.icon;

    return (
        <div className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0">
            {/* Avatar / Icon */}
            <div className={`w-10 h-10 rounded-xl ${severity.bg} ${severity.text} flex items-center justify-center flex-shrink-0`}>
                <ActionIcon size={18} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900">{log.userName}</span>
                    <span className="text-slate-500">{getActionLabel(log.action)}</span>
                    {log.entityName && (
                        <span className="font-medium text-orange-600">{log.entityName}</span>
                    )}
                </div>
                {log.details && (
                    <p className="text-sm text-slate-600 mt-1">{log.details}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatTimeAgo(log.timestamp)}
                    </span>
                    {log.ip && (
                        <span>IP: {log.ip}</span>
                    )}
                </div>
            </div>

            {/* Severity Badge */}
            <div className={`px-2 py-1 rounded-full text-xs font-bold ${severity.bg} ${severity.text} flex-shrink-0`}>
                <SeverityIcon size={12} />
            </div>
        </div>
    );
});
LogItem.displayName = 'LogItem';

// ============================================
// ACTIVITY LOGS COMPONENT
// ============================================
export default function ActivityLogs() {
    const [logs] = useState<ActivityLog[]>(SAMPLE_LOGS);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'create' | 'update' | 'delete' | 'login'>('all');
    const [page, setPage] = useState(1);
    const logsPerPage = 10;

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.entityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.details?.toLowerCase().includes(searchQuery.toLowerCase());

        if (filter === 'all') return matchesSearch;
        return matchesSearch && log.action === filter;
    });

    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    const paginatedLogs = filteredLogs.slice((page - 1) * logsPerPage, page * logsPerPage);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Nhật ký hoạt động</h1>
                    <p className="text-slate-500">Theo dõi mọi thao tác trong hệ thống</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                    <Download size={18} />
                    Xuất logs
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
                        placeholder="Tìm theo người dùng, nội dung..."
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {(['all', 'create', 'update', 'delete', 'login'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); setPage(1); }}
                            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${filter === f
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {f === 'all' ? 'Tất cả' : getActionLabel(f)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logs List */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                {paginatedLogs.length > 0 ? (
                    <>
                        {paginatedLogs.map(log => (
                            <LogItem key={log.id} log={log} />
                        ))}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <Activity size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500">Không có hoạt động nào</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Hiển thị {((page - 1) * logsPerPage) + 1}-{Math.min(page * logsPerPage, filteredLogs.length)} / {filteredLogs.length}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
