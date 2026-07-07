'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Heart, Loader2, MessageCircle, User, Trash2, Reply, Send, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { fetchComments, createComment, likeComment, deleteComment, type DbBlogComment } from '@/lib/blog-comments';

interface CommentsSectionProps {
    postId: number;
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
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffSecs < 60) return 'vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffWeeks < 4) return `${diffWeeks} tuần trước`;
    if (diffMonths < 12) return `${diffMonths} tháng trước`;
    return date.toLocaleDateString('vi-VN');
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
    const { addToast } = useToast();
    const { user, profile } = useSupabaseAuth();
    const isAdmin = profile?.role === 'admin';

    const [comments, setComments] = useState<DbBlogComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [likedComments, setLikedComments] = useState<Set<number>>(new Set());

    // Form state
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [content, setContent] = useState('');

    // Reply state
    const [replyingTo, setReplyingTo] = useState<DbBlogComment | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [replyGuestName, setReplyGuestName] = useState('');

    const loadComments = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchComments(postId);
            setComments(data);
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            addToast('Vui lòng nhập nội dung bình luận', 'error');
            return;
        }

        if (!user && !guestName.trim()) {
            addToast('Vui lòng nhập tên của bạn', 'error');
            return;
        }

        setSubmitting(true);
        try {
            await createComment({
                post_id: postId,
                user_id: user?.id || null,
                guest_name: user ? null : guestName.trim(),
                guest_email: user ? null : guestEmail.trim() || null,
                content: content.trim(),
            });

            addToast('Đã gửi bình luận thành công!', 'success');
            setContent('');
            setGuestName('');
            setGuestEmail('');
            loadComments();
        } catch (error: any) {
            console.error('Submit error:', error);
            addToast(error.message || 'Không thể gửi bình luận', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle reply submit
    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyingTo) return;

        if (!replyContent.trim()) {
            addToast('Vui lòng nhập nội dung trả lời', 'error');
            return;
        }

        if (!user && !replyGuestName.trim()) {
            addToast('Vui lòng nhập tên của bạn', 'error');
            return;
        }

        setSubmitting(true);
        try {
            await createComment({
                post_id: postId,
                user_id: user?.id || null,
                guest_name: user ? null : replyGuestName.trim(),
                content: replyContent.trim(),
                parent_id: replyingTo.id,
            });

            addToast('Đã gửi trả lời thành công!', 'success');
            setReplyContent('');
            setReplyGuestName('');
            setReplyingTo(null);
            loadComments();
        } catch (error: any) {
            console.error('Reply error:', error);
            addToast(error.message || 'Không thể gửi trả lời', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle delete (admin only)
    const handleDelete = async (commentId: number) => {
        if (!isAdmin) return;

        if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;

        try {
            const success = await deleteComment(commentId);
            if (success) {
                addToast('Đã xóa bình luận', 'success');
                loadComments();
            } else {
                addToast('Không thể xóa bình luận', 'error');
            }
        } catch (error) {
            addToast('Lỗi khi xóa bình luận', 'error');
        }
    };

    const handleLike = async (commentId: number) => {
        if (likedComments.has(commentId)) {
            addToast('Bạn đã thích bình luận này rồi', 'info');
            return;
        }

        const success = await likeComment(commentId);
        if (success) {
            setLikedComments(prev => new Set(prev).add(commentId));
            setComments(prev => prev.map(c =>
                c.id === commentId ? { ...c, likes_count: c.likes_count + 1 } : c
            ));
        }
    };

    const getDisplayName = (comment: DbBlogComment): string => {
        if (comment.user?.name) return comment.user.name;
        if (comment.guest_name) return comment.guest_name;
        return 'Ẩn danh';
    };

    const getAvatar = (comment: DbBlogComment): string | null => {
        if (comment.user?.avatar) return comment.user.avatar;
        return null;
    };

    // Render a single comment
    const renderComment = (comment: DbBlogComment, isReply: boolean = false) => (
        <div
            key={comment.id}
            className={`flex gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-orange-100 transition-colors ${isReply ? 'ml-8 mt-3 border-l-2 border-l-orange-200' : ''}`}
        >
            {/* Avatar */}
            {getAvatar(comment) ? (
                <Image
                    src={getAvatar(comment)!}
                    alt={getDisplayName(comment)}
                    width={isReply ? 36 : 48}
                    height={isReply ? 36 : 48}
                    className="rounded-full flex-shrink-0"
                />
            ) : (
                <div className={`${isReply ? 'w-9 h-9' : 'w-12 h-12'} rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center flex-shrink-0`}>
                    <User size={isReply ? 16 : 20} className="text-white" />
                </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-slate-900">{getDisplayName(comment)}</span>
                    {comment.user && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">Thành viên</span>
                    )}
                    <span className="text-xs text-slate-400">{formatRelativeTime(comment.created_at)}</span>

                    {/* Admin delete button */}
                    {isAdmin && (
                        <button
                            onClick={() => handleDelete(comment.id)}
                            className="ml-auto p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Xóa bình luận (Admin)"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>

                <p className="text-slate-600 text-sm whitespace-pre-wrap break-words">{comment.content}</p>

                <div className="flex items-center gap-4 mt-2">
                    <button
                        onClick={() => handleLike(comment.id)}
                        className={`flex items-center gap-1 text-xs transition-colors ${likedComments.has(comment.id)
                                ? 'text-red-500'
                                : 'text-slate-400 hover:text-red-500'
                            }`}
                    >
                        <Heart size={14} fill={likedComments.has(comment.id) ? 'currentColor' : 'none'} />
                        {comment.likes_count}
                    </button>

                    {/* Reply button - only for top-level comments */}
                    {!isReply && (
                        <button
                            onClick={() => setReplyingTo(replyingTo?.id === comment.id ? null : comment)}
                            className={`flex items-center gap-1 text-xs transition-colors ${replyingTo?.id === comment.id
                                    ? 'text-orange-500'
                                    : 'text-slate-400 hover:text-orange-500'
                                }`}
                        >
                            <Reply size={14} /> Trả lời
                        </button>
                    )}
                </div>

                {/* Reply form */}
                {replyingTo?.id === comment.id && (
                    <form onSubmit={handleReplySubmit} className="mt-4 p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-sm text-slate-600">
                            <Reply size={14} />
                            Trả lời <span className="font-bold">{getDisplayName(comment)}</span>
                            <button
                                type="button"
                                onClick={() => setReplyingTo(null)}
                                className="ml-auto p-1 hover:bg-slate-200 rounded"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {!user && (
                            <input
                                type="text"
                                value={replyGuestName}
                                onChange={e => setReplyGuestName(e.target.value)}
                                placeholder="Tên của bạn *"
                                required
                                className="w-full px-3 py-2 mb-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            />
                        )}

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={replyContent}
                                onChange={e => setReplyContent(e.target.value)}
                                placeholder="Viết trả lời..."
                                required
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-60 flex items-center gap-1"
                            >
                                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );

    return (
        <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <MessageCircle className="text-orange-500" />
                Bình luận ({comments.length})
                {isAdmin && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full ml-2">Admin</span>
                )}
            </h2>

            {/* Comment Form */}
            <div className="mb-8 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/70 via-white to-slate-50 p-5 shadow-sm sm:p-6">
                <h3 className="font-bold text-slate-900 mb-4">
                    {user ? `Bình luận với tên ${profile?.name || user.email}` : 'Để lại bình luận của bạn'}
                </h3>
                <form onSubmit={handleSubmit}>
                    {/* Guest fields - only show if not logged in */}
                    {!user && (
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <input
                                type="text"
                                value={guestName}
                                onChange={e => setGuestName(e.target.value)}
                                placeholder="Tên của bạn *"
                                required
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white shadow-sm"
                            />
                            <input
                                type="email"
                                value={guestEmail}
                                onChange={e => setGuestEmail(e.target.value)}
                                placeholder="Email (không công khai)"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white shadow-sm"
                            />
                        </div>
                    )}
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Viết bình luận của bạn..."
                        rows={4}
                        required
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none bg-white mb-4 shadow-sm"
                    />
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                            {user ? '✓ Đã đăng nhập' : 'Hoặc đăng nhập để bình luận nhanh hơn'}
                        </p>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200 disabled:opacity-60 flex items-center gap-2"
                        >
                            {submitting && <Loader2 size={16} className="animate-spin" />}
                            Gửi bình luận
                        </button>
                    </div>
                </form>
            </div>

            {/* Comments List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                    <MessageCircle size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500">Chưa có bình luận nào</p>
                    <p className="text-sm text-slate-400">Hãy là người đầu tiên bình luận!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map(comment => (
                        <div key={comment.id}>
                            {renderComment(comment, false)}

                            {/* Render replies */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="space-y-3">
                                    {comment.replies.map(reply => renderComment(reply, true))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
