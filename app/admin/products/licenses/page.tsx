'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Key, Search, Plus, Download, Copy, Check, X,
    RefreshCw, Loader2, ShieldCheck, Clock3, Ban
} from 'lucide-react';
import { fetchLicenses, revokeLicense, type DbLicense } from '@/lib/licenses';
import { useToast } from '@/context/ToastContext';

export default function LicensesPage() {
    const { confirm, addToast } = useToast();
    const [licenses, setLicenses] = useState<DbLicense[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState<10 | 20 | 50>(10);

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
        if (!(await confirm('Bạn có chắc muốn thu hồi license này?'))) return;
        try {
            await revokeLicense(id);
            loadLicenses(); // Reload
            addToast('Đã thu hồi license', 'success');
        } catch (error) {
            console.error('Failed to revoke license:', error);
            addToast('Không thể thu hồi license', 'error');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-green-100 text-green-700',
            expired: 'bg-yellow-100 text-yellow-700',
            revoked: 'bg-red-100 text-red-700',
        };
        const labels: Record<string, string> = {
            active: 'Hoạt động',
            expired: 'Hết hạn',
            revoked: 'Đã thu hồi',
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

    const totalPages = Math.max(1, Math.ceil(filteredLicenses.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedLicenses = filteredLicenses.slice(
        (safeCurrentPage - 1) * pageSize,
        safeCurrentPage * pageSize
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 md:text-3xl">Quản lý giấy phép</h1>
                    <p className="text-slate-500">Quản lý toàn bộ mã giấy phép của sản phẩm</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
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
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                {[
                    { label: 'Tổng giấy phép', value: stats.total, icon: Key, color: 'from-indigo-600 to-blue-500', note: 'Tất cả giấy phép' },
                    { label: 'Đang hoạt động', value: stats.active, icon: ShieldCheck, color: 'from-emerald-600 to-teal-500', note: 'Có thể sử dụng' },
                    { label: 'Đã hết hạn', value: stats.expired, icon: Clock3, color: 'from-amber-500 to-orange-500', note: 'Cần gia hạn' },
                    { label: 'Đã thu hồi', value: stats.revoked, icon: Ban, color: 'from-rose-600 to-red-500', note: 'Không còn hiệu lực' },
                ].map((stat, idx) => (
                    <div key={idx} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-5 text-white shadow-sm`}>
                        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                        <div className="relative flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-white/80">{stat.label}</p>
                                <p className="mt-1 text-3xl font-black">{stat.value}</p>
                                <p className="mt-1 text-xs text-white/75">{stat.note}</p>
                            </div>
                            <div className="rounded-xl bg-white/20 p-3 ring-1 ring-white/20">
                                <stat.icon size={22} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo key, sản phẩm, người mua..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                    className="min-w-52 cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="revoked">Revoked</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1050px] table-fixed">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold">
                            <tr>
                                <th className="w-[235px] px-6 py-4 text-left">Mã giấy phép</th>
                                <th className="w-[260px] px-6 py-4 text-left">Sản phẩm</th>
                                <th className="w-[220px] px-6 py-4 text-left">Người mua</th>
                                <th className="w-[110px] px-4 py-4 text-center">Loại</th>
                                <th className="w-[120px] px-4 py-4 text-center">Kích hoạt</th>
                                <th className="w-[120px] px-4 py-4 text-center">Trạng thái</th>
                                <th className="w-[80px] px-4 py-4 text-right">Thao tác</th>
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
                                paginatedLicenses.map(license => (
                                    <tr key={license.id} className="transition-colors hover:bg-orange-50/30">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <code className="max-w-[170px] truncate rounded-lg bg-indigo-50 px-2.5 py-1.5 font-mono text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
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
                                            <div className="flex items-center gap-3">
                                                <div className="aspect-video w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
                                                    {license.product?.image ? (
                                                        <img src={license.product.image} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center"><Key size={16} className="text-slate-300" /></div>
                                                    )}
                                                </div>
                                                <span className="line-clamp-2 text-sm font-bold leading-5 text-slate-900">
                                                    {license.product?.name || 'N/A'}
                                                </span>
                                            </div>
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
                                        <td className="px-4 py-4 text-center">
                                            <span className="inline-flex min-w-12 justify-center rounded-full bg-blue-50 px-2.5 py-1 font-mono text-xs font-bold text-blue-700">
                                                {license.activations_used}/{license.activations_limit}
                                            </span>
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
                {!loading && filteredLicenses.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                        <span>
                            Hiển thị <b>{(safeCurrentPage - 1) * pageSize + 1}–{Math.min(safeCurrentPage * pageSize, filteredLicenses.length)}</b> / {filteredLicenses.length} giấy phép
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold">Mỗi trang</span>
                            <select
                                value={pageSize}
                                onChange={(event) => { setPageSize(Number(event.target.value) as 10 | 20 | 50); setCurrentPage(1); }}
                                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-bold outline-none"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <button disabled={safeCurrentPage === 1} onClick={() => setCurrentPage(page => Math.max(1, page - 1))} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-bold disabled:cursor-not-allowed disabled:opacity-40">Trước</button>
                            <span className="min-w-[72px] text-center font-bold">{safeCurrentPage}/{totalPages}</span>
                            <button disabled={safeCurrentPage === totalPages} onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-bold disabled:cursor-not-allowed disabled:opacity-40">Sau</button>
                        </div>
                    </div>
                )}
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
