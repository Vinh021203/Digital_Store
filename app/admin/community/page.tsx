'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    MessageCircle, Search, Trash2, Pin, PinOff, ExternalLink,
    User, RefreshCw, Loader2, Heart, Star, MessageSquare
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { createClient } from '@/lib/supabase/client';
import ConfirmModal from '@/components/ui/ConfirmModal';
import type { DbCommunityPost, DbCommunityComment } from '@/lib/community';

// Extended type with more info
interface CommunityPostAdmin extends DbCommunityPost {
    author?: { id: string; name: string; avatar: string; email: string; role: string } | null;
}

interface CommunityCommentAdmin extends DbCommunityComment {
    post?: { id: number; title: string } | null;
}

// Helper: format relative time
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
}

export default function AdminCommunityPage() {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');

    // Posts state
    const [posts, setPosts] = useState<CommunityPostAdmin[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [pinnedFilter, setPinnedFilter] = useState<'all' | 'pinned' | 'unpinned'>('all');
    const [selectedPostIds, setSelectedPostIds] = useState<Set<number>>(new Set());

    // Comments state
    const [comments, setComments] = useState<CommunityCommentAdmin[]>([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [commentSearch, setCommentSearch] = useState('');
    const [selectedCommentIds, setSelectedCommentIds] = useState<Set<number>>(new Set());

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

    const loadPosts = useCallback(async () => {
        setLoadingPosts(true);
        try {
            const supabase = createClient();
            if (!supabase) return;

            let query = supabase
                .from('community_posts')
                .select(`*, author:author_id (id, name, avatar, email, role)`)
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false });

            if (pinnedFilter === 'pinned') {
                query = query.eq('is_pinned', true);
            } else if (pinnedFilter === 'unpinned') {
                query = query.eq('is_pinned', false);
            }

            const { data, error } = await query;
            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error('Error loading posts:', error);
            addToast('Không thể tải bài viết', 'error');
        } finally {
            setLoadingPosts(false);
        }
    }, [pinnedFilter, addToast]);

    const loadComments = useCallback(async () => {
        setLoadingComments(true);
        try {
            const supabase = createClient();
            if (!supabase) return;

            const { data, error } = await supabase
                .from('community_comments')
                .select(`*, author:author_id (id, name, avatar), post:post_id (id, title)`)
                .order('created_at', { ascending: false })
                .limit(200);

            if (error) throw error;
            setComments(data || []);
        } catch (error) {
            console.error('Error loading comments:', error);
            addToast('Không thể tải bình luận', 'error');
        } finally {
            setLoadingComments(false);
        }
    }, [addToast]);

    useEffect(() => {
        if (activeTab === 'posts') {
            loadPosts();
        } else {
            loadComments();
        }
    }, [activeTab, loadPosts, loadComments]);

    // Filter posts
    const filteredPosts = posts.filter(p => {
        const matchSearch =
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.author?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchSearch;
    });

    // Filter comments
    const filteredComments = comments.filter(c => {
        return c.content.toLowerCase().includes(commentSearch.toLowerCase()) ||
            (c.author?.name || '').toLowerCase().includes(commentSearch.toLowerCase()) ||
            (c.post?.title || '').toLowerCase().includes(commentSearch.toLowerCase());
    });

    // Stats
    const totalPosts = posts.length;
    const pinnedCount = posts.filter(p => p.is_pinned).length;
    const totalLikes = posts.reduce((acc, p) => acc + p.likes_count, 0);
    const totalComments = posts.reduce((acc, p) => acc + p.comments_count, 0);

    // Post handlers
    const handleTogglePin = async (id: number, currentlyPinned: boolean) => {
        try {
            const supabase = createClient();
            if (!supabase) return;

            const { error } = await supabase
                .from('community_posts')
                .update({ is_pinned: !currentlyPinned })
                .eq('id', id);

            if (error) throw error;
            addToast(currentlyPinned ? 'Đã bỏ ghim bài viết' : 'Đã ghim bài viết', 'success');
            loadPosts();
        } catch (error) {
            addToast('Không thể cập nhật', 'error');
        }
    };

    const handleDeletePost = (id: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Xóa bài viết',
            message: 'Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn tác.',
            loading: false,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                try {
                    const supabase = createClient();
                    if (!supabase) return;

                    const { error } = await supabase.from('community_posts').delete().eq('id', id);
                    if (error) throw error;

                    addToast('Đã xóa bài viết', 'success');
                    loadPosts();
                } catch (error) {
                    addToast('Không thể xóa', 'error');
                } finally {
                    setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
                }
            },
        });
    };

    const handleBulkDeletePosts = () => {
        if (selectedPostIds.size === 0) return;

        setConfirmModal({
            isOpen: true,
            title: 'Xóa nhiều bài viết',
            message: `Bạn có chắc muốn xóa ${selectedPostIds.size} bài viết đã chọn? Hành động này không thể hoàn tác.`,
            loading: false,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                try {
                    const supabase = createClient();
                    if (!supabase) return;

                    const { error } = await supabase
                        .from('community_posts')
                        .delete()
                        .in('id', Array.from(selectedPostIds));

                    if (error) throw error;
                    addToast(`Đã xóa ${selectedPostIds.size} bài viết`, 'success');
                    setSelectedPostIds(new Set());
                    loadPosts();
                } catch (error) {
                    addToast('Không thể xóa', 'error');
                } finally {
                    setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
                }
            },
        });
    };

    // Comment handlers
    const handleDeleteComment = (id: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Xóa bình luận',
            message: 'Bạn có chắc muốn xóa bình luận này?',
            loading: false,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                try {
                    const supabase = createClient();
                    if (!supabase) return;

                    const { error } = await supabase.from('community_comments').delete().eq('id', id);
                    if (error) throw error;

                    addToast('Đã xóa bình luận', 'success');
                    loadComments();
                } catch (error) {
                    addToast('Không thể xóa', 'error');
                } finally {
                    setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
                }
            },
        });
    };

    const handleBulkDeleteComments = () => {
        if (selectedCommentIds.size === 0) return;

        setConfirmModal({
            isOpen: true,
            title: 'Xóa nhiều bình luận',
            message: `Bạn có chắc muốn xóa ${selectedCommentIds.size} bình luận đã chọn?`,
            loading: false,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                try {
                    const supabase = createClient();
                    if (!supabase) return;

                    const { error } = await supabase
                        .from('community_comments')
                        .delete()
                        .in('id', Array.from(selectedCommentIds));

                    if (error) throw error;
                    addToast(`Đã xóa ${selectedCommentIds.size} bình luận`, 'success');
                    setSelectedCommentIds(new Set());
                    loadComments();
                } catch (error) {
                    addToast('Không thể xóa', 'error');
                } finally {
                    setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
                }
            },
        });
    };

    const handleSelectAllPosts = () => {
        if (selectedPostIds.size === filteredPosts.length) {
            setSelectedPostIds(new Set());
        } else {
            setSelectedPostIds(new Set(filteredPosts.map(p => p.id)));
        }
    };

    const handleSelectAllComments = () => {
        if (selectedCommentIds.size === filteredComments.length) {
            setSelectedCommentIds(new Set());
        } else {
            setSelectedCommentIds(new Set(filteredComments.map(c => c.id)));
        }
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
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Quản lý Cộng đồng</h1>
                    <p className="text-slate-500">Quản lý bài viết, bình luận và nội dung cộng đồng</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href="/community"
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl font-medium hover:bg-purple-100"
                    >
                        <ExternalLink size={16} /> Xem trang
                    </Link>
                    <button
                        onClick={() => activeTab === 'posts' ? loadPosts() : loadComments()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-medium"
                    >
                        <RefreshCw size={16} className={(loadingPosts || loadingComments) ? 'animate-spin' : ''} />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 p-5 text-white shadow-lg shadow-blue-200/60">
                    <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
                    <div className="relative flex h-full items-center justify-between gap-3">
                        <div><p className="text-xs font-black uppercase tracking-wide text-white/85">Tổng bài viết</p><p className="mt-2 text-4xl font-black leading-none">{totalPosts}</p><p className="mt-3 text-sm font-medium text-white/75">Nội dung cộng đồng</p></div>
                        <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><MessageCircle size={28} strokeWidth={2.2} /></div>
                    </div>
                </div>
                <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-5 text-white shadow-lg shadow-amber-200/60">
                    <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
                    <div className="relative flex h-full items-center justify-between gap-3">
                        <div><p className="text-xs font-black uppercase tracking-wide text-white/85">Bài viết đã ghim</p><p className="mt-2 text-4xl font-black leading-none">{pinnedCount}</p><p className="mt-3 text-sm font-medium text-white/75">Nội dung nổi bật</p></div>
                        <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><Star size={28} strokeWidth={2.2} /></div>
                    </div>
                </div>
                <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 to-pink-500 p-5 text-white shadow-lg shadow-rose-200/60">
                    <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
                    <div className="relative flex h-full items-center justify-between gap-3">
                        <div><p className="text-xs font-black uppercase tracking-wide text-white/85">Tổng lượt thích</p><p className="mt-2 text-4xl font-black leading-none">{totalLikes}</p><p className="mt-3 text-sm font-medium text-white/75">Tương tác yêu thích</p></div>
                        <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><Heart size={28} strokeWidth={2.2} /></div>
                    </div>
                </div>
                <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 p-5 text-white shadow-lg shadow-purple-200/60">
                    <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
                    <div className="relative flex h-full items-center justify-between gap-3">
                        <div><p className="text-xs font-black uppercase tracking-wide text-white/85">Tổng bình luận</p><p className="mt-2 text-4xl font-black leading-none">{totalComments}</p><p className="mt-3 text-sm font-medium text-white/75">Thảo luận cộng đồng</p></div>
                        <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><MessageSquare size={28} strokeWidth={2.2} /></div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex w-fit rounded-xl bg-slate-100 p-1 shadow-inner">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`rounded-lg px-5 py-2.5 text-sm font-bold transition-all ${activeTab === 'posts'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <MessageCircle size={16} className="inline mr-2" />
                    Bài viết ({posts.length})
                </button>
                <button
                    onClick={() => setActiveTab('comments')}
                    className={`rounded-lg px-5 py-2.5 text-sm font-bold transition-all ${activeTab === 'comments'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <MessageSquare size={16} className="inline mr-2" />
                    Bình luận ({comments.length})
                </button>
            </div>

            {/* Posts Tab */}
            {activeTab === 'posts' && (
                <>
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-gradient-to-r from-purple-50/60 to-blue-50/40 p-4 shadow-sm">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Tìm theo tiêu đề, nội dung, tác giả..."
                                className="w-full rounded-xl border border-white bg-white py-2.5 pl-10 pr-4 shadow-sm outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <select
                            value={pinnedFilter}
                            onChange={e => setPinnedFilter(e.target.value as typeof pinnedFilter)}
                            className="rounded-xl border border-white bg-white px-4 py-2.5 font-semibold shadow-sm outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">Tất cả</option>
                            <option value="pinned">Đã ghim</option>
                            <option value="unpinned">Chưa ghim</option>
                        </select>
                        {selectedPostIds.size > 0 && (
                            <button
                                onClick={handleBulkDeletePosts}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium"
                            >
                                <Trash2 size={16} />
                                Xóa ({selectedPostIds.size})
                            </button>
                        )}
                    </div>

                    {/* Posts Table */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
                        {loadingPosts ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div className="text-center py-20">
                                <MessageCircle size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-500">Không có bài viết nào</p>
                            </div>
                        ) : (
                            <table className="w-full min-w-[900px]">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedPostIds.size === filteredPosts.length && filteredPosts.length > 0}
                                                onChange={handleSelectAllPosts}
                                                className="rounded border-slate-300"
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Bài viết</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Tác giả</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Tương tác</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Ngày tạo</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredPosts.map(post => (
                                        <tr key={post.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPostIds.has(post.id)}
                                                    onChange={() => {
                                                        const newSet = new Set(selectedPostIds);
                                                        if (newSet.has(post.id)) {
                                                            newSet.delete(post.id);
                                                        } else {
                                                            newSet.add(post.id);
                                                        }
                                                        setSelectedPostIds(newSet);
                                                    }}
                                                    className="rounded border-slate-300"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-start gap-3">
                                                    {post.is_pinned && (
                                                        <span className="p-1 bg-amber-100 text-amber-600 rounded">
                                                            <Pin size={12} />
                                                        </span>
                                                    )}
                                                    <div className="max-w-xs">
                                                        <p className="font-bold text-slate-900 line-clamp-1">{post.title}</p>
                                                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{post.content}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {post.author?.avatar ? (
                                                        <Image src={post.author.avatar} alt="" width={32} height={32} className="rounded-full" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-orange-400 flex items-center justify-center">
                                                            <User size={14} className="text-white" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{post.author?.name || 'Ẩn danh'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="flex items-center gap-1 text-rose-500">
                                                        <Heart size={14} /> {post.likes_count}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-blue-500">
                                                        <MessageSquare size={14} /> {post.comments_count}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-500">{formatRelativeTime(post.created_at)}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleTogglePin(post.id, post.is_pinned)}
                                                        className={`p-2 rounded-lg transition-colors ${post.is_pinned
                                                            ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                                                            : 'text-slate-400 hover:bg-slate-100'
                                                            }`}
                                                        title={post.is_pinned ? 'Bỏ ghim' : 'Ghim'}
                                                    >
                                                        {post.is_pinned ? <PinOff size={16} /> : <Pin size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePost(post.id)}
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
                </>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
                <>
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-gradient-to-r from-purple-50/60 to-blue-50/40 p-4 shadow-sm">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={commentSearch}
                                onChange={e => setCommentSearch(e.target.value)}
                                placeholder="Tìm theo nội dung, tác giả, bài viết..."
                                className="w-full rounded-xl border border-white bg-white py-2.5 pl-10 pr-4 shadow-sm outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        {selectedCommentIds.size > 0 && (
                            <button
                                onClick={handleBulkDeleteComments}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium"
                            >
                                <Trash2 size={16} />
                                Xóa ({selectedCommentIds.size})
                            </button>
                        )}
                    </div>

                    {/* Comments Table */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
                        {loadingComments ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                            </div>
                        ) : filteredComments.length === 0 ? (
                            <div className="text-center py-20">
                                <MessageSquare size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-500">Không có bình luận nào</p>
                            </div>
                        ) : (
                            <table className="w-full min-w-[850px]">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedCommentIds.size === filteredComments.length && filteredComments.length > 0}
                                                onChange={handleSelectAllComments}
                                                className="rounded border-slate-300"
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Nội dung</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Tác giả</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Bài viết</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Ngày tạo</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredComments.map(comment => (
                                        <tr key={comment.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCommentIds.has(comment.id)}
                                                    onChange={() => {
                                                        const newSet = new Set(selectedCommentIds);
                                                        if (newSet.has(comment.id)) {
                                                            newSet.delete(comment.id);
                                                        } else {
                                                            newSet.add(comment.id);
                                                        }
                                                        setSelectedCommentIds(newSet);
                                                    }}
                                                    className="rounded border-slate-300"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-slate-700 max-w-md line-clamp-2">{comment.content}</p>
                                                {comment.parent_id && (
                                                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full mt-1 inline-block">Trả lời</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {comment.author?.avatar ? (
                                                        <Image src={comment.author.avatar} alt="" width={28} height={28} className="rounded-full" />
                                                    ) : (
                                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-orange-400 flex items-center justify-center">
                                                            <User size={12} className="text-white" />
                                                        </div>
                                                    )}
                                                    <span className="text-sm font-medium text-slate-900">{comment.author?.name || 'Ẩn danh'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-slate-600 line-clamp-1 max-w-[150px]">
                                                    {comment.post?.title || `Post #${comment.post_id}`}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-500">{formatRelativeTime(comment.created_at)}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
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
                </>
            )}

            {/* Info */}
            <p className="text-sm text-slate-400 text-center">
                {activeTab === 'posts'
                    ? `Hiển thị ${filteredPosts.length} / ${totalPosts} bài viết`
                    : `Hiển thị ${filteredComments.length} / ${comments.length} bình luận`
                }
            </p>
        </div>
    );
}
