'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  Search,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Calendar,
  User,
  Tag,
  ArrowLeft,
  BarChart3,
} from 'lucide-react';
import { collectBlogTaxonomy, fetchAllPosts, deletePost, togglePublish, type DbBlogPost } from '@/lib/blog';
import { useToast } from '@/context/ToastContext';

export default function BlogManager() {
  const router = useRouter();
  const toast = useToast();

  const [posts, setPosts] = useState<DbBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [filterCategory, setFilterCategory] = useState('');

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const categories = collectBlogTaxonomy(posts, false).categories;
  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'published' ? p.is_published : !p.is_published);
    const matchesCategory = !filterCategory || p.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.is_published).length,
    draft: posts.filter(p => !p.is_published).length,
    views: posts.reduce((sum, p) => sum + p.views_count, 0),
  };

  const handleDelete = async (post: DbBlogPost) => {
    if (!confirm(`Bạn có chắc muốn xóa bài "${post.title}"?`)) return;
    try {
      await deletePost(post.id);
      toast.success('Đã xóa bài viết');
      loadPosts();
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa');
    }
  };

  const handleTogglePublish = async (post: DbBlogPost) => {
    try {
      await togglePublish(post.id, !post.is_published);
      setPosts(prev => prev.map(p =>
        p.id === post.id ? { ...p, is_published: !p.is_published } : p
      ));
      toast.success(`Đã ${!post.is_published ? 'xuất bản' : 'chuyển về nháp'}`);
    } catch (error) {
      toast.error('Không thể cập nhật');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/marketing')}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText size={24} className="text-indigo-600" />
              Quản Lý Blog
            </h2>
            <p className="text-sm text-slate-500">
              Tạo và quản lý các bài viết cho website
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadPosts}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50"
          >
            <RefreshCw size={16} /> Làm mới
          </button>
          <button
            onClick={() => router.push('/admin/marketing/blog/new')}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200"
          >
            <Plus size={18} /> Tạo Bài Viết
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 p-5 text-white shadow-lg shadow-blue-200/60">
          <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
          <div className="relative flex h-full items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-white/85">Tổng bài viết</p>
              <p className="mt-2 text-4xl font-black leading-none">{stats.total}</p>
              <p className="mt-3 text-sm font-medium text-white/75">Tất cả nội dung Blog</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><FileText size={28} strokeWidth={2.2} /></div>
          </div>
        </div>
        <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 p-5 text-white shadow-lg shadow-emerald-200/60">
          <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
          <div className="relative flex h-full items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-white/85">Đã xuất bản</p>
              <p className="mt-2 text-4xl font-black leading-none">{stats.published}</p>
              <p className="mt-3 text-sm font-medium text-white/75">Đang hiển thị trên website</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><Eye size={28} strokeWidth={2.2} /></div>
          </div>
        </div>
        <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-5 text-white shadow-lg shadow-orange-200/60">
          <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
          <div className="relative flex h-full items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-white/85">Bản nháp</p>
              <p className="mt-2 text-4xl font-black leading-none">{stats.draft}</p>
              <p className="mt-3 text-sm font-medium text-white/75">Nội dung chưa xuất bản</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><Edit3 size={28} strokeWidth={2.2} /></div>
          </div>
        </div>
        <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 p-5 text-white shadow-lg shadow-purple-200/60">
          <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
          <div className="relative flex h-full items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-white/85">Lượt xem</p>
              <p className="mt-2 text-4xl font-black leading-none">{stats.views.toLocaleString()}</p>
              <p className="mt-3 text-sm font-medium text-white/75">Tổng lượt đọc bài viết</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><BarChart3 size={28} strokeWidth={2.2} /></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Bản nháp</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <FileText size={48} className="mx-auto mb-4 opacity-30" />
          <p>Chưa có bài viết nào</p>
          <button
            onClick={() => router.push('/admin/marketing/blog/new')}
            className="mt-4 text-indigo-600 font-bold"
          >
            Tạo bài đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden group hover:shadow-lg transition-all"
            >
              {/* Cover Image */}
              <div className="relative h-40 bg-slate-100">
                {post.cover_image ? (
                  <Image
                    src={post.cover_image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <FileText size={48} />
                  </div>
                )}
                {/* Status badge */}
                <span className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold ${post.is_published
                  ? 'bg-green-500 text-white'
                  : 'bg-orange-100 text-orange-600'
                  }`}>
                  {post.is_published ? 'Đã xuất bản' : 'Nháp'}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                  {post.excerpt || 'Không có mô tả'}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-4">
                  {post.category && (
                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                      <Tag size={12} /> {post.category}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye size={12} /> {post.views_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {new Date(post.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleTogglePublish(post)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-colors ${post.is_published
                      ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                  >
                    {post.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                    {post.is_published ? 'Ẩn' : 'Xuất bản'}
                  </button>
                  <button
                    onClick={() => router.push(`/admin/marketing/blog/${post.id}`)}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600"
                    title="Xem"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => router.push(`/admin/marketing/blog/${post.id}/edit`)}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600"
                    title="Sửa"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(post)}
                    className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
