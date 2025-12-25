'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Key, Search, Plus, Download, Copy, Check, X,
    RefreshCw, Loader2
} from 'lucide-react';
import { fetchLicenses, revokeLicense, type DbLicense } from '@/lib/licenses';

export default function LicensesPage() {
    const [licenses, setLicenses] = useState<DbLicense[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const loadLicenses = async () => {
        setLoading(true);
        try {
            const data = await fetchLicenses();
            setLicenses(data);
        } catch (error) {
            console.error('Failed to load licenses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLicenses();
    }, []);

    const handleCopy = (id: number, key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleRevoke = async (id: number) => {
        if (!confirm('Bạn có chắc muốn thu hồi license này?')) return;
        try {
            await revokeLicense(id);
            loadLicenses(); // Reload
        } catch (error) {
            console.error('Failed to revoke license:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-green-100 text-green-700',
            expired: 'bg-yellow-100 text-yellow-700',
            revoked: 'bg-red-100 text-red-700',
        };
        const labels: Record<string, string> = {
            active: 'Active',
            expired: 'Expired',
            revoked: 'Revoked',
        };
        return <span className={`px-2 py-1 rounded-lg text-xs font-bold ${styles[status] || 'bg-slate-100 text-slate-600'}`}>{labels[status] || status}</span>;
    };

    // Stats
    const stats = useMemo(() => ({
        total: licenses.length,
        active: licenses.filter(l => l.status === 'active').length,
        expired: licenses.filter(l => l.status === 'expired').length,
        revoked: licenses.filter(l => l.status === 'revoked').length,
    }), [licenses]);

    // Filtered
    const filteredLicenses = useMemo(() => {
        return licenses.filter(license => {
            if (filterStatus !== 'all' && license.status !== filterStatus) return false;
            if (searchQuery) {
                const term = searchQuery.toLowerCase();
                const productName = license.product?.name || '';
                const userName = license.user?.name || '';
                const userEmail = license.user?.email || '';
                if (!license.license_key.toLowerCase().includes(term) &&
                    !productName.toLowerCase().includes(term) &&
                    !userName.toLowerCase().includes(term) &&
                    !userEmail.toLowerCase().includes(term)) {
                    return false;
                }
            }
            return true;
        });
    }, [licenses, filterStatus, searchQuery]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900">Quản Lý Licenses</h1>
                    <p className="text-slate-500">Quản lý tất cả license keys của sản phẩm</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadLicenses}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
                    >
                        <RefreshCw size={16} />
                        Làm mới
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
                        <Download size={16} /> Export
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
                    >
                        <Plus size={16} /> Tạo License
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Tổng Licenses', value: stats.total, color: 'bg-blue-500' },
                    { label: 'Active', value: stats.active, color: 'bg-green-500' },
                    { label: 'Expired', value: stats.expired, color: 'bg-yellow-500' },
                    { label: 'Revoked', value: stats.revoked, color: 'bg-red-500' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${stat.color} text-white`}>
                                <Key size={18} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                                <p className="text-xs text-slate-500">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo key, sản phẩm, người mua..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm cursor-pointer"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="revoked">Revoked</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4 text-left">License Key</th>
                                <th className="px-6 py-4 text-left">Sản phẩm</th>
                                <th className="px-6 py-4 text-left">Người mua</th>
                                <th className="px-6 py-4 text-center">Loại</th>
                                <th className="px-6 py-4 text-center">Activations</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-600" />
                                        <p className="text-sm text-slate-500 mt-2">Đang tải...</p>
                                    </td>
                                </tr>
                            ) : filteredLicenses.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                                        Không có license nào
                                    </td>
                                </tr>
                            ) : (
                                filteredLicenses.map(license => (
                                    <tr key={license.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <code className="font-mono text-sm text-slate-700 bg-slate-100 px-2 py-1 rounded max-w-[200px] truncate">
                                                    {license.license_key}
                                                </code>
                                                <button
                                                    onClick={() => handleCopy(license.id, license.license_key)}
                                                    className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                                >
                                                    {copiedId === license.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-slate-400" />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-slate-900">
                                                {license.product?.name || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-slate-900">{license.user?.name || 'N/A'}</p>
                                                <p className="text-xs text-slate-400">{license.user?.email || ''}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${license.type === 'Extended' ? 'bg-purple-100 text-purple-700' : license.type === 'Unlimited' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {license.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono text-sm text-slate-600">
                                            {license.activations_used}/{license.activations_limit}
                                        </td>
                                        <td className="px-6 py-4 text-center">{getStatusBadge(license.status)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                {license.status === 'active' && (
                                                    <button
                                                        onClick={() => handleRevoke(license.id)}
                                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Thu hồi"
                                                    >
                                                        <X size={16} className="text-red-400" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
                    <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-black text-slate-900 mb-4">Tạo License Mới</h2>
                        <p className="text-slate-500 text-sm mb-4">License được tạo tự động khi khách hàng mua sản phẩm.</p>
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="w-full py-3 border border-slate-200 rounded-xl font-bold hover:bg-slate-50"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
