'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Package, Check, X, Eye, Clock, DollarSign, Loader2,
    CheckCircle, Store, ExternalLink
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchAllProducts, updateProductStatus, DbProduct } from '@/lib/products';
import { useToast } from '@/context/ToastContext';

export default function PendingProductsPage() {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [products, setProducts] = useState<DbProduct[]>([]);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchAllProducts({ status: 'pending' });
            setProducts(data);
        } catch (error) {
            console.error('Error loading pending products:', error);
            addToast('Lỗi tải danh sách sản phẩm', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const handleApprove = async (id: number) => {
        setActionLoading(id);
        try {
            await updateProductStatus(id, 'active');
            addToast('Đã duyệt sản phẩm!', 'success');
            loadProducts();
        } catch (error: any) {
            addToast(error.message || 'Lỗi duyệt sản phẩm', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: number) => {
        const reason = prompt('Nhập lý do từ chối (để trống nếu không có):');
        setActionLoading(id);
        try {
            await updateProductStatus(id, 'rejected', reason || undefined);
            addToast('Đã từ chối sản phẩm', 'success');
            loadProducts();
        } catch (error: any) {
            addToast(error.message || 'Lỗi từ chối sản phẩm', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleApproveAll = async () => {
        if (!confirm(`Duyệt tất cả ${products.length} sản phẩm?`)) return;
        setLoading(true);
        try {
            for (const product of products) {
                await updateProductStatus(product.id, 'active');
            }
            addToast(`Đã duyệt ${products.length} sản phẩm!`, 'success');
            loadProducts();
        } catch (error: any) {
            addToast(error.message || 'Có lỗi xảy ra', 'error');
        } finally {
            setLoading(false);
        }
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
                        Duyệt Sản Phẩm
                        {products.length > 0 && (
                            <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                                {products.length}
                            </span>
                        )}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Xét duyệt sản phẩm mới từ sellers</p>
                </div>
                {products.length > 0 && (
                    <button
                        onClick={handleApproveAll}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all"
                    >
                        <CheckCircle size={16} /> Duyệt Tất Cả
                    </button>
                )}
            </div>

            {/* Stats Bar */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-3xl font-black">{products.length}</p>
                        <p className="text-orange-100 text-sm">Chờ Duyệt</p>
                    </div>
                    <div>
                        <p className="text-3xl font-black">—</p>
                        <p className="text-orange-100 text-sm">Đã Duyệt Tuần Này</p>
                    </div>
                    <div>
                        <p className="text-3xl font-black">—</p>
                        <p className="text-orange-100 text-sm">Từ Chối</p>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {products.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Không có sản phẩm chờ duyệt</h3>
                    <p className="text-slate-500 dark:text-slate-400">Tất cả sản phẩm đã được xét duyệt</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {products.map(product => (
                        <div key={product.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                                {/* Product Image */}
                                <div className="md:w-48 h-48 md:h-auto flex-shrink-0 relative bg-slate-100">
                                    {product.image ? (
                                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package size={48} className="text-slate-300" />
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 p-5">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold px-2 py-1 rounded uppercase">
                                                    {product.format || 'Template'}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                    <Clock size={12} /> {new Date(product.created_at).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{product.name}</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                                                {product.description || 'Không có mô tả'}
                                            </p>

                                            {/* Seller */}
                                            {product.seller && (
                                                <div className="flex items-center gap-2">
                                                    <Store size={14} className="text-slate-400" />
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        {(product.seller as any).store_name || 'Seller'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Price & Actions */}
                                        <div className="flex flex-col items-end gap-3">
                                            <p className="text-2xl font-black text-orange-600">
                                                {Number(product.price).toLocaleString('vi-VN')}₫
                                            </p>

                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/product/${product.slug}`}
                                                    target="_blank"
                                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                                                >
                                                    <Eye size={16} /> Xem
                                                </Link>
                                                <button
                                                    onClick={() => handleReject(product.id)}
                                                    disabled={actionLoading === product.id}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl font-bold text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-all disabled:opacity-60"
                                                >
                                                    {actionLoading === product.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                                                    Từ Chối
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(product.id)}
                                                    disabled={actionLoading === product.id}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all disabled:opacity-60"
                                                >
                                                    {actionLoading === product.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                    Duyệt
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
