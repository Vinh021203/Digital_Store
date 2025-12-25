'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    FolderTree,
    Plus,
    Edit3,
    Trash2,
    Search,
    ArrowLeft,
    Loader2,
    RefreshCw,
    Eye,
} from 'lucide-react';
import {
    fetchCategories,
    deleteCategory,
    type DbCategory,
} from '@/lib/categories';
import { useToast } from '@/context/ToastContext';

const CategoriesManager = () => {
    const router = useRouter();
    const toast = useToast();

    // Data states
    const [categories, setCategories] = useState<DbCategory[]>([]);
    const [loading, setLoading] = useState(true);

    // UI states
    const [searchTerm, setSearchTerm] = useState('');

    // Load categories from Supabase
    const loadCategories = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
            toast.error('Không thể tải danh mục');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    // Filter categories
    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats
    const stats = {
        total: categories.length,
        totalProducts: categories.reduce((sum, cat) => sum + (cat.product_count || 0), 0),
        popular: categories.filter(cat => (cat.product_count || 0) > 10).length,
        empty: categories.filter(cat => (cat.product_count || 0) === 0).length,
    };

    // Delete category
    const handleDelete = async (cat: DbCategory) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}"?`)) return;

        try {
            await deleteCategory(cat.id);
            toast.success('Xóa danh mục thành công!');
            await loadCategories();
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.message || 'Không thể xóa danh mục');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/admin/products')}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <FolderTree size={24} className="text-indigo-600" />
                            Quản Lý Danh Mục
                        </h2>
                        <p className="text-sm text-slate-500">
                            Tạo và quản lý các danh mục sản phẩm digital của bạn.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={loadCategories}
                        disabled={loading}
                        className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        title="Làm mới"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => router.push('/admin/products/categories/new')}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                        <Plus size={18} /> Thêm Danh Mục
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <div className="text-2xl font-bold text-indigo-600">{stats.total}</div>
                    <div className="text-sm text-slate-500">Tổng danh mục</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <div className="text-2xl font-bold text-emerald-600">{stats.totalProducts}</div>
                    <div className="text-sm text-slate-500">Tổng sản phẩm</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <div className="text-2xl font-bold text-amber-600">{stats.popular}</div>
                    <div className="text-sm text-slate-500">Danh mục phổ biến</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <div className="text-2xl font-bold text-purple-600">{stats.empty}</div>
                    <div className="text-sm text-slate-500">Danh mục trống</div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-100">
                <div className="relative max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm danh mục..."
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-indigo-600" />
                </div>
            )}

            {/* Categories Grid */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCategories.map(cat => (
                        <div
                            key={cat.id}
                            className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-indigo-100 transition-all group"
                        >
                            {/* Image */}
                            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
                                {cat.icon ? (
                                    <img
                                        src={cat.icon}
                                        alt={cat.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <FolderTree size={48} className="text-indigo-300" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                                    <div>
                                        <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                                        <span className="text-white/80 text-xs">
                                            {cat.product_count || 0} sản phẩm
                                        </span>
                                    </div>
                                    {!cat.is_active && (
                                        <span className="px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded">
                                            Ẩn
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                                    {cat.description || 'Không có mô tả'}
                                </p>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                    <span className="text-xs text-slate-400 font-mono">
                                        /{cat.slug}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => router.push(`/admin/products/categories/${cat.id}`)}
                                            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Xem / Sửa"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => router.push(`/admin/products/categories/${cat.id}`)}
                                            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat)}
                                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Xóa"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredCategories.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                    {categories.length === 0 ? (
                        <>
                            <FolderTree size={48} className="mx-auto text-slate-300 mb-3" />
                            <h3 className="text-lg font-semibold text-slate-700">Chưa có danh mục nào</h3>
                            <p className="text-sm text-slate-500 mb-4">Tạo danh mục đầu tiên để bắt đầu</p>
                            <button
                                onClick={() => router.push('/admin/products/categories/new')}
                                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700"
                            >
                                <Plus size={16} /> Thêm Danh Mục
                            </button>
                        </>
                    ) : (
                        <>
                            <Search size={48} className="mx-auto text-slate-300 mb-3" />
                            <h3 className="text-lg font-semibold text-slate-700">Không tìm thấy danh mục</h3>
                            <p className="text-sm text-slate-500">Thử tìm kiếm với từ khóa khác</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default CategoriesManager;
