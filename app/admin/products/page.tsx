'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Palette,
  Globe,
  Code,
  Zap,
  Package,
  Star,
  Eye,
  MoreHorizontal,
  FolderTree,
  Layers,
  Tag,
  Settings,
  ChevronDown,
  RefreshCw,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  FileEdit,
} from 'lucide-react';
import {
  fetchAllProducts,
  deleteProduct,
  getProductStats,
  type DbProduct,
} from '@/lib/products';
import { fetchCategories, type DbCategory } from '@/lib/categories';
import { fetchProductTypes, type DbProductType } from '@/lib/productTypes';
import { getProductTypeSoftStyle } from '@/lib/productTypeDisplay';
import { useToast } from '@/context/ToastContext';
import { createActivityLog } from '@/lib/activityLogs';

type ProductTypeFilter = 'all' | string;
type StatusFilter = 'all' | 'active' | 'draft' | 'pending' | 'rejected';

const ProductsManager = () => {
  const router = useRouter();
  const toast = useToast();

  // Data states
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [productTypes, setProductTypes] = useState<DbProductType[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [filterType, setFilterType] = useState<ProductTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<10 | 20 | 50>(10);
  const [activeActionId, setActiveActionId] = useState<number | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData, productTypesData, statsData] = await Promise.all([
        fetchAllProducts({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          format: filterType !== 'all' ? filterType : undefined,
          category_id: categoryFilter !== 'all' ? Number(categoryFilter) : undefined,
          search: searchTerm || undefined,
        }),
        fetchCategories(),
        fetchProductTypes(),
        getProductStats(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setProductTypes(productTypesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [filterType, statusFilter, categoryFilter, searchTerm, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Pagination
  const totalItems = products.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = products.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  // Helpers
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'Theme':
        return <Palette size={12} />;
      case 'Template':
        return <Code size={12} />;
      case 'Landing':
        return <Globe size={12} />;
      case 'MiniApp':
        return <Zap size={12} />;
      case 'Bundle':
      default:
        return <Package size={12} />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return { icon: <CheckCircle size={14} />, bg: 'bg-emerald-50 text-emerald-700', label: 'Hoạt động' };
      case 'draft':
        return { icon: <FileEdit size={14} />, bg: 'bg-slate-100 text-slate-600', label: 'Nháp' };
      case 'pending':
        return { icon: <Clock size={14} />, bg: 'bg-amber-50 text-amber-700', label: 'Chờ duyệt' };
      case 'rejected':
        return { icon: <XCircle size={14} />, bg: 'bg-rose-50 text-rose-700', label: 'Từ chối' };
      default:
        return { icon: null, bg: 'bg-slate-100 text-slate-600', label: status };
    }
  };

  const handleChangeFilterType = (type: ProductTypeFilter) => {
    setFilterType(type);
    setCurrentPage(1);
  };

  const handleDelete = async (product: DbProduct) => {
    if (!(await toast.confirm(`Bạn có chắc chắn muốn xóa "${product.name}"?`))) return;

    try {
      await deleteProduct(product.id);
      await createActivityLog({ action: 'Delete', entity: 'product', entity_id: String(product.id), entity_name: product.name, details: `Xóa sản phẩm: ${product.name}`, severity: 'warning' });
      toast.success('Xóa sản phẩm thành công!');
      await loadData();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Không thể xóa sản phẩm');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" onClick={() => setActiveActionId(null)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Danh Sách Sản Phẩm
          </h2>
          <p className="text-sm text-slate-500">
            Quản lý Themes, Templates, Landing Pages và các sản phẩm digital.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            title="Làm mới"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActionsMenu(!showActionsMenu);
              }}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              <Settings size={18} />
              Quản lý
              <ChevronDown size={16} className={`transition-transform ${showActionsMenu ? 'rotate-180' : ''}`} />
            </button>
            {showActionsMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                <button
                  onClick={() => {
                    router.push('/admin/products/categories');
                    setShowActionsMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-3"
                >
                  <FolderTree size={18} />
                  Quản lý Danh mục
                </button>
                <button
                  onClick={() => {
                    router.push('/admin/products/inventory');
                    setShowActionsMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-3"
                >
                  <Layers size={18} />
                  Quản lý Tồn kho
                </button>
                <button
                  onClick={() => {
                    router.push('/admin/products/types');
                    setShowActionsMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-3"
                >
                  <Layers size={18} />
                  Quản lý loại sản phẩm
                </button>
                <button
                  onClick={() => {
                    router.push('/admin/products/licenses');
                    setShowActionsMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-3"
                >
                  <Tag size={18} />
                  Quản lý Licenses
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => router.push('/admin/products/new')}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Plus size={18} /> Thêm Sản Phẩm
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 p-5 text-white shadow-lg shadow-blue-200/60">
          <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
          <div className="relative flex h-full items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-white/85">Tổng sản phẩm</p>
              <p className="mt-2 text-4xl font-black leading-none">{stats?.total || 0}</p>
              <p className="mt-3 text-sm font-medium text-white/75">{stats?.active || 0} đang hoạt động</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><Package size={28} strokeWidth={2.2} /></div>
          </div>
        </div>
        <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 p-5 text-white shadow-lg shadow-emerald-200/60">
          <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
          <div className="relative flex h-full items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-white/85">Themes</p>
              <p className="mt-2 text-4xl font-black leading-none">{stats?.byFormat?.Theme || 0}</p>
              <p className="mt-3 text-sm font-medium text-white/75">UI Kits & Web Themes</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><Palette size={28} strokeWidth={2.2} /></div>
          </div>
        </div>
        <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 p-5 text-white shadow-lg shadow-purple-200/60">
          <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
          <div className="relative flex h-full items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-white/85">Templates</p>
              <p className="mt-2 text-4xl font-black leading-none">{stats?.byFormat?.Template || 0}</p>
              <p className="mt-3 text-sm font-medium text-white/75">Figma, Notion, Email</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><Layers size={28} strokeWidth={2.2} /></div>
          </div>
        </div>
        <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 p-5 text-white shadow-lg shadow-orange-200/60">
          <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
          <div className="relative flex h-full items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-white/85">Landing & Apps</p>
              <p className="mt-2 text-4xl font-black leading-none">{(stats?.byFormat?.Landing || 0) + (stats?.byFormat?.MiniApp || 0)}</p>
              <p className="mt-3 text-sm font-medium text-white/75">Landing Pages & MiniApps</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><Zap size={28} strokeWidth={2.2} /></div>
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="grid gap-3 border-b border-slate-100 bg-slate-50/50 p-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          {/* Type Filter Tabs */}
          <div className="flex min-w-0 gap-2 overflow-x-auto rounded-lg bg-slate-200/50 p-1 no-scrollbar">
            {[
              { key: 'all', label: 'Tất cả', count: stats?.total || 0 },
              ...productTypes.map(type => ({ key: type.name, label: type.label, count: stats?.byFormat?.[type.name] || 0 })),
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => handleChangeFilterType(tab.key as ProductTypeFilter)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${filterType === tab.key
                  ? 'bg-white shadow text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${filterType === tab.key ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100'
                  }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Right side filters */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:flex xl:flex-nowrap xl:items-center">
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value as StatusFilter);
                setCurrentPage(1);
              }}
              className="h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 xl:w-44"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="draft">Nháp</option>
              <option value="pending">Chờ duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>

            <select
              value={categoryFilter}
              onChange={e => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 xl:w-48"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <div className="relative min-w-0 xl:w-52">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-indigo-600" />
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4 pl-8">Sản phẩm</th>
                  <th className="px-6 py-4">Loại</th>
                  <th className="px-6 py-4">Danh mục</th>
                  <th className="px-6 py-4">Giá</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4 text-right pr-8">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedProducts.map((product, productIndex) => {
                  const statusInfo = getStatusStyle(product.status);
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 pl-8">
                        <div className="flex items-center gap-4">
                          <div className="aspect-video w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-100">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={24} className="text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              by {product.author}
                            </p>
                            {product.is_new && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded">
                                NEW
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold ${getProductTypeSoftStyle(product.format)}`}>
                          {getFormatIcon(product.format)}
                          {product.format}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {product.category?.name || '-'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <span className="block font-bold text-slate-900">
                            {Number(product.price).toLocaleString('vi-VN')}₫
                          </span>
                          {product.original_price && Number(product.original_price) > Number(product.price) && (
                            <span className="text-xs text-slate-400 line-through">
                              {Number(product.original_price).toLocaleString('vi-VN')}₫
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${statusInfo.bg}`}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-amber-400 fill-amber-400" />
                          <span className="font-bold text-slate-700">{Number(product.rating).toFixed(1)}</span>
                          <span className="text-xs text-slate-400">({product.reviews_count})</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right pr-8 relative">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setActiveActionId(prev => prev === product.id ? null : product.id);
                          }}
                          className={`p-2 rounded-lg transition-colors ${activeActionId === product.id
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                          <MoreHorizontal size={20} />
                        </button>

                        {activeActionId === product.id && (
                          <div className={`absolute right-8 z-30 w-44 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl animate-fade-in ${productIndex >= paginatedProducts.length - 2 ? 'bottom-12' : 'top-12'}`}>
                            <div className="p-1">
                              <button
                                onClick={() => router.push(`/admin/products/${product.id}`)}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Edit3 size={16} className="text-slate-400" />
                                Chỉnh sửa
                              </button>
                              <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Eye size={16} className="text-slate-400" />
                                Xem trước
                              </button>
                              <div className="my-1 border-t border-slate-100" />
                              <button
                                onClick={() => handleDelete(product)}
                                className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                              >
                                <Trash2 size={16} />
                                Xóa sản phẩm
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <Package size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-semibold text-slate-700 mb-1">Chưa có sản phẩm</h3>
            <p className="text-sm mb-4">Thêm sản phẩm đầu tiên để bắt đầu</p>
            <button
              onClick={() => router.push('/admin/products/new')}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700"
            >
              <Plus size={16} /> Thêm Sản Phẩm
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && products.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/40 p-4 text-xs text-slate-500 sm:flex-row">
            <span>
              Hiển thị{' '}
              {totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}–{' '}
              {Math.min(safeCurrentPage * pageSize, totalItems)} / {totalItems} sản phẩm
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <label htmlFor="products-page-size" className="font-semibold">Số dòng</label>
              <select
                id="products-page-size"
                value={pageSize}
                onChange={event => {
                  setPageSize(Number(event.target.value) as 10 | 20 | 50);
                  setCurrentPage(1);
                }}
                className="h-9 rounded-lg border border-slate-200 bg-white px-2 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="min-w-[72px] text-center font-semibold">Trang {safeCurrentPage}/{totalPages}</span>
              <button
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="h-9 rounded-lg border border-slate-200 px-3 font-bold hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Trước
              </button>
              <button
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="h-9 rounded-lg border border-slate-200 px-3 font-bold hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsManager;
