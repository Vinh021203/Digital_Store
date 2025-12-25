'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    History, Search, Filter, User, Calendar,
    Edit, Trash2, Plus, LogIn, Settings, AlertTriangle,
    Download, RefreshCcw, Clock, MapPin, Monitor, LogOut,
    FileUp, FileDown, Shield, ChevronDown, Eye, XCircle,
    CheckCircle, Activity, Loader2
} from 'lucide-react';
import {
    fetchActivityLogs,
    getActivityStats,
    DbActivityLog,
    SeverityType
} from '@/lib/activityLogs';

const ActivityLogPage = () => {
    const [logs, setLogs] = useState<DbActivityLog[]>([]);
    const [stats, setStats] = useState({ total: 0, today: 0, success: 0, failed: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState<string>('All');
    const [filterSeverity, setFilterSeverity] = useState<SeverityType | 'All'>('All');
    const [showFailedOnly, setShowFailedOnly] = useState(false);
    const [itemsToShow, setItemsToShow] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    // Load data
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const options: Parameters<typeof fetchActivityLogs>[0] = {
                limit: itemsToShow,
            };

            if (filterAction !== 'All') {
                options.action = filterAction;
            }
            if (filterSeverity !== 'All') {
                options.severity = filterSeverity;
            }
            if (showFailedOnly) {
                options.severity = 'error';
            }

            const [logsResult, statsResult] = await Promise.all([
                fetchActivityLogs(options),
                getActivityStats()
            ]);

            setLogs(logsResult.data);
            setTotalCount(logsResult.count);
            setStats(statsResult);
        } catch (error) {
            console.error('Error loading activity logs:', error);
        } finally {
            setLoading(false);
        }
    }, [filterAction, filterSeverity, showFailedOnly, itemsToShow]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Filter logs by search term (client-side for quick filtering)
    const filteredLogs = logs.filter(log => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            log.user?.name?.toLowerCase().includes(search) ||
            log.entity_name?.toLowerCase().includes(search) ||
            log.details?.toLowerCase().includes(search) ||
            log.action.toLowerCase().includes(search)
        );
    });

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'Create': return <Plus size={16} className="text-emerald-500" />;
            case 'Update': return <Edit size={16} className="text-blue-500" />;
            case 'Delete': return <Trash2 size={16} className="text-rose-500" />;
            case 'Login': return <LogIn size={16} className="text-indigo-500" />;
            case 'Logout': return <LogOut size={16} className="text-slate-500" />;
            case 'Warning': return <AlertTriangle size={16} className="text-amber-500" />;
            case 'Export': return <FileDown size={16} className="text-purple-500" />;
            case 'Import': return <FileUp size={16} className="text-cyan-500" />;
            case 'Config': return <Settings size={16} className="text-pink-500" />;
            default: return <Activity size={16} className="text-slate-500" />;
        }
    };

    const getSeverityStyle = (severity: SeverityType) => {
        switch (severity) {
            case 'success': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'info': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'warning': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'error': return 'bg-rose-50 text-rose-700 border-rose-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const getActionStyle = (action: string, severity: SeverityType) => {
        if (severity === 'error') return 'bg-rose-50 text-rose-700 border-rose-200';

        switch (action) {
            case 'Create': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Update': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Delete': return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'Login': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'Logout': return 'bg-slate-50 text-slate-700 border-slate-200';
            case 'Warning': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Export': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'Import': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
            case 'Config': return 'bg-pink-50 text-pink-700 border-pink-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'seller': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'user': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return {
            date: date.toLocaleDateString('vi-VN'),
            time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            relative: getRelativeTime(date)
        };
    };

    const getRelativeTime = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        return `${diffDays} ngày trước`;
    };

    const handleReset = () => {
        setSearchTerm('');
        setFilterAction('All');
        setFilterSeverity('All');
        setShowFailedOnly(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <History size={28} className="text-indigo-600" />
                        Nhật Ký Hoạt Động
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Theo dõi mọi thay đổi trong hệ thống để đảm bảo an toàn và minh bạch</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                        <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                        Làm mới
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                        <Download size={16} /> Xuất Báo Cáo
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Tổng hoạt động', value: stats.total, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Hôm nay', value: stats.today, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Thành công', value: stats.success, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Cảnh báo/Lỗi', value: stats.failed, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer">
                        <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                            <stat.icon size={20} className={stat.color} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                            <p className="text-xs text-slate-500">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Filters & Search */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm người dùng, hành động, mô tả..."
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter Controls */}
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none cursor-pointer hover:border-slate-300 transition-colors"
                        >
                            <option value="All">Tất cả hành động</option>
                            <option value="Create">Create</option>
                            <option value="Update">Update</option>
                            <option value="Delete">Delete</option>
                            <option value="Login">Login</option>
                            <option value="Logout">Logout</option>
                            <option value="Warning">Warning</option>
                            <option value="Export">Export</option>
                            <option value="Import">Import</option>
                            <option value="Config">Config</option>
                        </select>

                        <select
                            value={filterSeverity}
                            onChange={(e) => setFilterSeverity(e.target.value as SeverityType | 'All')}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none cursor-pointer hover:border-slate-300 transition-colors"
                        >
                            <option value="All">Tất cả mức độ</option>
                            <option value="success">Thành công</option>
                            <option value="info">Thông tin</option>
                            <option value="warning">Cảnh báo</option>
                            <option value="error">Lỗi</option>
                        </select>

                        <button
                            onClick={() => setShowFailedOnly(!showFailedOnly)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${showFailedOnly
                                    ? 'bg-rose-100 text-rose-700 border-2 border-rose-300'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <XCircle size={16} className="inline mr-2" />
                            Chỉ lỗi
                        </button>

                        {(searchTerm || filterAction !== 'All' || filterSeverity !== 'All' || showFailedOnly) && (
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
                            >
                                <RefreshCcw size={16} className="inline mr-2" />
                                Reset
                            </button>
                        )}
                    </div>

                    {/* Results Count */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">
                            Hiển thị <span className="font-bold text-slate-900">{filteredLogs.length}</span> / <span className="font-bold">{totalCount}</span> kết quả
                        </span>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="p-12 text-center">
                        <Loader2 size={40} className="text-indigo-500 mx-auto mb-4 animate-spin" />
                        <p className="text-slate-500 font-semibold">Đang tải dữ liệu...</p>
                    </div>
                )}

                {/* Table */}
                {!loading && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 text-left">Người dùng</th>
                                    <th className="px-6 py-4 text-left">Hành động</th>
                                    <th className="px-6 py-4 text-left">Đối tượng</th>
                                    <th className="px-6 py-4 text-left hidden lg:table-cell">Thời gian</th>
                                    <th className="px-6 py-4 text-left hidden xl:table-cell">IP</th>
                                    <th className="px-6 py-4 text-center">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredLogs.map((log) => {
                                    const time = formatTimestamp(log.created_at);
                                    return (
                                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                            {/* User */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        {log.user?.avatar ? (
                                                            <img
                                                                src={log.user.avatar}
                                                                className="w-10 h-10 rounded-full border-2 border-slate-100 object-cover"
                                                                alt={log.user.name}
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                                {log.user?.name?.charAt(0) || 'S'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-900 text-sm truncate">
                                                            {log.user?.name || 'Hệ thống'}
                                                        </p>
                                                        {log.user?.role && (
                                                            <span className={`text-xs px-2 py-0.5 rounded-md font-semibold border ${getRoleBadgeColor(log.user.role)}`}>
                                                                {log.user.role}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Action */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border uppercase tracking-wider ${getActionStyle(log.action, log.severity)}`}>
                                                    {getActionIcon(log.action)}
                                                    {log.action}
                                                </span>
                                            </td>

                                            {/* Target */}
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 mb-1">
                                                        {log.entity_name || log.entity || '-'}
                                                    </p>
                                                    {log.details && (
                                                        <p className="text-xs text-slate-500 line-clamp-1">{log.details}</p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Timestamp */}
                                            <td className="px-6 py-4 text-sm hidden lg:table-cell">
                                                <div className="space-y-1">
                                                    <p className="font-mono text-slate-700">{time.date} {time.time}</p>
                                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {time.relative}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* IP Address */}
                                            <td className="px-6 py-4 hidden xl:table-cell">
                                                <p className="text-sm font-mono text-slate-700">
                                                    {log.ip_address || '-'}
                                                </p>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 text-center">
                                                {log.severity === 'success' || log.severity === 'info' ? (
                                                    <CheckCircle size={20} className="text-emerald-500 inline" />
                                                ) : log.severity === 'warning' ? (
                                                    <AlertTriangle size={20} className="text-amber-500 inline" />
                                                ) : (
                                                    <XCircle size={20} className="text-rose-500 inline" />
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Load More */}
                {!loading && totalCount > itemsToShow && (
                    <div className="p-4 border-t border-slate-100 text-center bg-slate-50">
                        <button
                            onClick={() => setItemsToShow(prev => prev + 20)}
                            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center justify-center gap-2 mx-auto"
                        >
                            Tải thêm
                            <ChevronDown size={16} />
                        </button>
                    </div>
                )}

                {/* No Results */}
                {!loading && filteredLogs.length === 0 && (
                    <div className="p-12 text-center">
                        <AlertTriangle size={48} className="text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-semibold">Chưa có nhật ký hoạt động nào</p>
                        <p className="text-sm text-slate-400 mt-1">Các hoạt động sẽ được ghi lại tự động khi hệ thống hoạt động</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogPage;
