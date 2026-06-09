'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Download, Package, CheckCircle,
    ChevronRight, Home, Search, Loader2,
    Eye, Calendar, FileCode, ShoppingBag,
    ChevronDown, Clock, Zap, History, File,
    Sparkles, ArrowLeft, Star
} from 'lucide-react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useToast } from '@/context/ToastContext';
import { fetchUserDownloads, type UserDownload } from '@/lib/orders';
import { getProductVersions, getCurrentVersion, type DbProductFile } from '@/lib/productFiles';

interface DownloadWithVersions extends UserDownload {
    versions?: DbProductFile[];
    currentVersion?: DbProductFile | null;
    selectedVersion?: string;
    showVersions?: boolean;
}

export default function DownloadsPage() {
    const { user, profile, loading: authLoading } = useSupabaseAuth();
    const { addToast } = useToast();
    const [downloads, setDownloads] = useState<DownloadWithVersions[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const loadDownloads = useCallback(async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const data = await fetchUserDownloads(user.id);

            // Load versions for each product
            const downloadsWithVersions: DownloadWithVersions[] = await Promise.all(
                data.map(async (item) => {
                    const [versions, currentVersion] = await Promise.all([
                        getProductVersions(item.product_id),
                        getCurrentVersion(item.product_id)
                    ]);
                    return {
                        ...item,
                        versions,
                        currentVersion,
                        selectedVersion: currentVersion?.version || versions[0]?.version || '',
                        showVersions: false
                    };
                })
            );

            setDownloads(downloadsWithVersions);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user) {
            loadDownloads();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading, loadDownloads]);

    const filteredDownloads = downloads.filter(d =>
        d.product_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleVersionDropdown = (id: number) => {
        setDownloads(prev => prev.map(d => ({
            ...d,
            showVersions: d.id === id ? !d.showVersions : false
        })));
    };

    const selectVersion = (id: number, version: string) => {
        setDownloads(prev => prev.map(d =>
            d.id === id ? { ...d, selectedVersion: version, showVersions: false } : d
        ));
    };

    const handleDownload = async (item: DownloadWithVersions) => {
        const version = item.versions?.find(v => v.version === item.selectedVersion);
        if (!version) {
            addToast('Không tìm thấy phiên bản để tải', 'error');
            return;
        }

        try {
            addToast(`Đang chuẩn bị tải v${version.version}...`, 'info');

            // Call secure download API with license verification
            const response = await fetch(`/api/download/${item.product_id}?version=${version.version}`);
            const data = await response.json();

            if (!response.ok) {
                addToast(data.error || 'Lỗi khi tải file', 'error');
                return;
            }

            if (data.success && data.download?.url) {
                // Open download URL
                window.open(data.download.url, '_blank');
                addToast(`Đang tải ${data.download.filename}`, 'success');

                // Show remaining downloads if has limit
                if (data.license?.remainingDownloads !== undefined && data.license.remainingDownloads < 10) {
                    addToast(`Còn ${data.license.remainingDownloads} lượt tải trong tháng`, 'info');
                }
            } else {
                addToast('Không tìm thấy file để tải', 'error');
            }
        } catch (error) {
            console.error('Download error:', error);
            addToast('Lỗi khi tải file. Vui lòng thử lại.', 'error');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Download size={32} className="text-slate-300" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Vui lòng đăng nhập</h2>
                    <p className="text-slate-500 mb-4">Bạn cần đăng nhập để xem các sản phẩm đã mua</p>
                    <Link href="/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all">
                        Đăng nhập
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Dark Premium Header */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
                </div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />

                <div className="relative z-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                        <Link href="/" className="hover:text-white transition-colors"><Home size={14} /></Link>
                        <ChevronRight size={14} />
                        <Link href="/profile" className="hover:text-white transition-colors">Profile</Link>
                        <ChevronRight size={14} />
                        <span className="text-white font-medium">Downloads</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                                <Download size={28} className="text-white" />
                            </div>
                            <div>
                                <span className="bg-green-500/20 text-green-300 px-2.5 py-0.5 rounded-full text-xs font-bold mb-2 inline-block">
                                    <Sparkles size={10} className="inline mr-1" /> My Products
                                </span>
                                <h1 className="text-2xl md:text-3xl font-black">Sản phẩm đã mua</h1>
                                <p className="text-slate-400 text-sm">{downloads.length} sản phẩm có thể tải xuống</p>
                            </div>
                        </div>

                        <Link href="/profile" className="flex items-center gap-2 bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-white/20 transition-all">
                            <ArrowLeft size={16} />
                            Quay lại
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                            <Package size={22} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{downloads.length}</p>
                            <p className="text-xs text-slate-500 font-medium">Tổng sản phẩm</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                            <Zap size={22} className="text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-orange-600">{downloads.filter(d => d.currentVersion).length}</p>
                            <p className="text-xs text-slate-500 font-medium">Có bản mới</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                            <Star size={22} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-blue-600">VIP</p>
                            <p className="text-xs text-slate-500 font-medium">Tải không giới hạn</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            {downloads.length > 0 && (
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                    />
                </div>
            )}

            {/* Downloads Grid */}
            {filteredDownloads.length > 0 ? (
                <div className="grid gap-4">
                    {filteredDownloads.map((item) => {
                        const selectedVersionData = item.versions?.find(v => v.version === item.selectedVersion);
                        const hasMultipleVersions = (item.versions?.length || 0) > 1;

                        return (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-green-200 hover:shadow-xl transition-all"
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* Product Image */}
                                    <div className="md:w-52 h-44 md:h-auto flex-shrink-0 relative overflow-hidden">
                                        {item.product_image ? (
                                            <Image
                                                src={item.product_image}
                                                alt={item.product_name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                                                <FileCode size={48} className="text-slate-300" />
                                            </div>
                                        )}
                                        {/* Badge */}
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
                                                {item.license_type}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-5">
                                        <div className="flex flex-col h-full">
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                                            <CheckCircle size={10} /> Đã thanh toán
                                                        </span>
                                                    </div>
                                                    <h3 className="font-bold text-lg text-slate-900 hover:text-green-600 transition-colors">
                                                        <Link href={`/product/${item.product_slug || item.product_id}`}>
                                                            {item.product_name}
                                                        </Link>
                                                    </h3>
                                                </div>
                                                <p className="text-lg font-bold text-orange-500 whitespace-nowrap">
                                                    {item.price.toLocaleString('vi-VN')}₫
                                                </p>
                                            </div>

                                            {/* Meta */}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mb-4">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} className="text-green-400" />
                                                    Mua ngày {new Date(item.purchased_at).toLocaleDateString('vi-VN')}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <ShoppingBag size={12} className="text-blue-400" />
                                                    Đơn hàng #{item.order_id}
                                                </span>
                                                {item.currentVersion && (
                                                    <span className="flex items-center gap-1 text-orange-600 font-medium">
                                                        <Zap size={12} />
                                                        Mới nhất: v{item.currentVersion.version}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Version Selection & Download */}
                                            <div className="mt-auto flex flex-col sm:flex-row items-stretch gap-3">
                                                {/* Version Selector */}
                                                {hasMultipleVersions ? (
                                                    <div className="relative flex-1">
                                                        <button
                                                            onClick={() => toggleVersionDropdown(item.id)}
                                                            className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-green-300 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <File size={16} className="text-green-500" />
                                                                <span>Phiên bản {item.selectedVersion}</span>
                                                                {selectedVersionData && (
                                                                    <span className="text-slate-400">
                                                                        ({formatFileSize(selectedVersionData.file_size)})
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <ChevronDown size={16} className={`text-slate-400 transition-transform ${item.showVersions ? 'rotate-180' : ''}`} />
                                                        </button>

                                                        {/* Dropdown */}
                                                        {item.showVersions && (
                                                            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                                                                <div className="max-h-48 overflow-y-auto">
                                                                    {item.versions?.map((version) => (
                                                                        <button
                                                                            key={version.id}
                                                                            onClick={() => selectVersion(item.id, version.version)}
                                                                            className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-green-50 transition-colors ${version.version === item.selectedVersion ? 'bg-green-50' : ''
                                                                                }`}
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <span className={`font-medium ${version.is_current ? 'text-green-600' : 'text-slate-700'}`}>
                                                                                    v{version.version}
                                                                                </span>
                                                                                {version.is_current && (
                                                                                    <span className="bg-green-100 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                                                        Mới nhất
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                                                                <span>{formatFileSize(version.file_size)}</span>
                                                                                <span>{new Date(version.created_at).toLocaleDateString('vi-VN')}</span>
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500">
                                                        <File size={16} className="text-green-500" />
                                                        {item.currentVersion ? (
                                                            <span>Phiên bản {item.currentVersion.version} ({formatFileSize(item.currentVersion.file_size)})</span>
                                                        ) : (
                                                            <span>Chưa có file</span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/product/${item.product_slug || item.product_id}`}
                                                        className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                                                    >
                                                        <Eye size={18} />
                                                        <span className="hidden sm:inline">Xem</span>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDownload(item)}
                                                        disabled={!selectedVersionData?.file_url}
                                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Download size={18} />
                                                        Tải xuống
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Package size={32} className="text-slate-300" />
                    </div>
                    <h3 className="font-bold text-xl text-slate-900 mb-2">
                        {searchQuery ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
                    </h3>
                    <p className="text-slate-500 mb-6">
                        {searchQuery ? 'Thử tìm với từ khóa khác' : 'Các sản phẩm bạn mua sẽ xuất hiện ở đây'}
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                    >
                        Khám phá sản phẩm
                        <ChevronRight size={18} />
                    </Link>
                </div>
            )}
        </div>
    );
}
