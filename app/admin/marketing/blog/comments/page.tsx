'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    MessageSquare, Search, Trash2, Check, X, ExternalLink,
    User, RefreshCw, Loader2, Heart, AlertCircle,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { fetchAllComments, deleteComment, toggleCommentApproval, type DbBlogComment } from '@/lib/blog-comments';
import ConfirmModal from '@/components/ui/ConfirmModal';

// Extended type with post info
interface CommentWithPost extends DbBlogComment {
    post?: { id: number; title: string; slug: string };
}

// Helper: format relative time
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 30) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
}

export default function AdminCommentsPage() {
    const { addToast } = useToast();
    const [comments, setComments] = useState<CommentWithPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Confirm modal state
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        loading: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        loading: false,
    });

    const loadComments = useCallback(async () => {
        setLoading(true);
        try {
            const filters: { isApproved?: boolean } = {};
            if (statusFilter === 'approved') filters.isApproved = true;
            if (statusFilter === 'pending') filters.isApproved = false;

            const data = await fetchAllComments(filters);
            setComments(data as CommentWithPost[]);
        } catch (error) {
            console.error('Error loading comments:', error);
            addToast('Không thể tải bình luận', 'error');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, addToast]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    // Filter by search
    const filteredComments = comments.filter(c => {
        const searchLower = searchQuery.toLowerCase();
        return (
            c.content.toLowerCase().includes(searchLower) ||
            (c.guest_name || '').toLowerCase().includes(searchLower) ||
            (c.user?.name || '').toLowerCase().includes(searchLower) ||
            (c.post?.title || '').toLowerCase().includes(searchLower)
        );
    });

    // Stats
    const totalComments = comments.length;
    const approvedCount = comments.filter(c => c.is_approved).length;
    const pendingCount = comments.filter(c => !c.is_approved).length;

    // Handlers
    const handleToggleApproval = async (id: number) => {
        const success = await toggleCommentApproval(id);
        if (success) {
            addToast('Đã cập nhật trạng thái!', 'success');
            loadComments();
        } else {
            addToast('Không thể cập nhật', 'error');
        }
    };

    const handleDelete = (id: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Xóa bình luận',
            message: 'Bạn có chắc muốn xóa bình luận này?',
            loading: false,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                const success = await deleteComment(id);
                if (success) {
                    addToast('Đã xóa bình luận!', 'success');
                    loadComments();
                } else {
                    addToast('Không thể xóa', 'error');
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
            },
        });
    };

    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return;

        setConfirmModal({
            isOpen: true,
            title: 'Xóa nhiều bình luận',
            message: `Bạn có chắc muốn xóa ${selectedIds.size} bình luận đã chọn?`,
            loading: false,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                let deleted = 0;
                for (const id of selectedIds) {
                    const success = await deleteComment(id);
                    if (success) deleted++;
                }
                addToast(`Đã xóa ${deleted} bình luận!`, 'success');
                setSelectedIds(new Set());
                loadComments();
                setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
            },
        });
    };

    const handleSelectAll = () => {
        if (selectedIds.size === filteredComments.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredComments.map(c => c.id)));
        }
    };

    const getDisplayName = (comment: CommentWithPost): string => {
        if (comment.user?.name) return comment.user.name;
        if (comment.guest_name) return comment.guest_name;
        return 'Ẩn danh';
    };

    return (
        <div className="space-y-6">
            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText="Xóa"
                cancelText="Hủy"
                type="danger"
                loading={confirmModal.loading}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Quản lý Bình luận</h1>
                    <p className="text-slate-500">Duyệt, xóa và quản lý bình luận trên blog</p>
                </div>
                <button
                    onClick={loadComments}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-medium"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Làm mới
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={18} className="text-slate-600" />
                        <span className="text-sm text-slate-500">Tổng bình luận</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{totalComments}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Check size={18} className="text-green-600" />
                        <span className="text-sm text-green-700">Đã duyệt</span>
                    </div>
                    <p className="text-2xl font-black text-green-700">{approvedCount}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={18} className="text-amber-600" />
                        <span className="text-sm text-amber-700">Chờ duyệt</span>
                    </div>
                    <p className="text-2xl font-black text-amber-700">{pendingCount}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-100">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Tìm theo nội dung, tên, bài viết..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="pending">Chờ duyệt</option>
                </select>

                {selectedIds.size > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium"
                    >
                        <Trash2 size={16} />
                        Xóa ({selectedIds.size})
                    </button>
                )}
            </div>

            {/* Comments Table */}
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                    </div>
                ) : filteredComments.length === 0 ? (
                    <div className="text-center py-20">
                        <MessageSquare size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-500">Không có bình luận nào</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.size === filteredComments.length && filteredComments.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-slate-300"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Người bình luận</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Nội dung</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Bài viết</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Thời gian</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredComments.map(comment => (
                                <tr key={comment.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(comment.id)}
                                            onChange={() => {
                                                const newSet = new Set(selectedIds);
                                                if (newSet.has(comment.id)) {
                                                    newSet.delete(comment.id);
                                                } else {
                                                    newSet.add(comment.id);
                                                }
                                                setSelectedIds(newSet);
                                            }}
                                            className="rounded border-slate-300"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {comment.user?.avatar ? (
                                                <Image
                                                    src={comment.user.avatar}
                                                    alt={getDisplayName(comment)}
                                                    width={32}
                                                    height={32}
                                                    className="rounded-full"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
                                                    <User size={14} className="text-white" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-slate-900 text-sm">{getDisplayName(comment)}</p>
                                                {comment.user && (
                                                    <span className="text-xs text-orange-600">Thành viên</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-slate-600 line-clamp-2 max-w-xs">{comment.content}</p>
                                        {comment.likes_count > 0 && (
                                            <span className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                                <Heart size={10} fill="currentColor" /> {comment.likes_count}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {comment.post && (
                                            <Link
                                                href={`/blog/${comment.post.slug}`}
                                                target="_blank"
                                                className="text-sm text-orange-600 hover:underline line-clamp-1 max-w-[150px] flex items-center gap-1"
                                            >
                                                {comment.post.title}
                                                <ExternalLink size={12} />
                                            </Link>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${comment.is_approved
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-amber-100 text-amber-700'
                                                }`}
                                        >
                                            {comment.is_approved ? <Check size={12} /> : <AlertCircle size={12} />}
                                            {comment.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500">
                                        {formatRelativeTime(comment.created_at)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleToggleApproval(comment.id)}
                                                className={`p-2 rounded-lg transition-colors ${comment.is_approved
                                                    ? 'text-amber-600 hover:bg-amber-50'
                                                    : 'text-green-600 hover:bg-green-50'
                                                    }`}
                                                title={comment.is_approved ? 'Bỏ duyệt' : 'Duyệt'}
                                            >
                                                {comment.is_approved ? <X size={16} /> : <Check size={16} />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                title="Xóa"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Info */}
            <p className="text-sm text-slate-400 text-center">
                Hiển thị {filteredComments.length} / {totalComments} bình luận
            </p>
        </div>
    );
}
