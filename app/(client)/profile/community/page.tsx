'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    MessageCircle, Search, Home, Heart, MessageSquare, Share2,
    Bookmark, ChevronRight, PenTool, Loader2,
    Trash2, Eye, Clock, TrendingUp, Plus, Sparkles, ArrowLeft, Pin
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useToast } from '@/context/ToastContext';
import { CreatePostModal } from '@/components/community';
import {
    fetchCommunityPosts,
    createCommunityPost,
    deleteCommunityPost,
    type DbCommunityPost
} from '@/lib/community';

export default function ProfileCommunityPage() {
    const { user, profile, loading: authLoading } = useSupabaseAuth();
    const { addToast } = useToast();
    const router = useRouter();

    const [posts, setPosts] = useState<DbCommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const loadMyPosts = useCallback(async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            // Fetch all posts and filter by current user
            const allPosts = await fetchCommunityPosts({});
            const myPosts = allPosts.filter(p => p.author_id === user.id);
            setPosts(myPosts);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user) {
            loadMyPosts();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading, loadMyPosts]);

    const handleCreatePost = () => {
        if (!user) {
            addToast('Vui lòng đăng nhập', 'warning');
            router.push('/login');
            return;
        }
        setIsPostModalOpen(true);
    };

    const handleNewPost = async (newPostData: any) => {
        if (!user?.id) return;

        try {
            await createCommunityPost({
                author_id: user.id,
                title: newPostData.title,
                content: newPostData.content,
                tags: newPostData.tags,
                image: newPostData.image
            });
            addToast('Đăng bài thành công!', 'success');
            setIsPostModalOpen(false);
            loadMyPosts();
        } catch (error) {
            addToast('Có lỗi xảy ra', 'error');
        }
    };

    const handleDelete = async (postId: number) => {
        if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;

        setDeletingId(postId);
        try {
            await deleteCommunityPost(postId);
            addToast('Đã xóa bài viết', 'success');
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (error) {
            addToast('Không thể xóa bài viết', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const filteredPosts = posts.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats
    const stats = {
        total: posts.length,
        totalLikes: posts.reduce((sum, p) => sum + (p.likes_count || 0), 0),
        totalComments: posts.reduce((sum, p) => sum + (p.comments_count || 0), 0),
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Đang tải bài viết...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MessageCircle size={32} className="text-slate-300" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Vui lòng đăng nhập</h2>
                    <p className="text-slate-500 mb-4">Bạn cần đăng nhập để xem bài viết</p>
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
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />

                <div className="relative z-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                        <Link href="/" className="hover:text-white transition-colors"><Home size={14} /></Link>
                        <ChevronRight size={14} />
                        <Link href="/profile" className="hover:text-white transition-colors">Profile</Link>
                        <ChevronRight size={14} />
                        <span className="text-white font-medium">Bài viết của tôi</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <MessageCircle size={28} className="text-white" />
                            </div>
                            <div>
                                <span className="bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full text-xs font-bold mb-2 inline-block">
                                    <Sparkles size={10} className="inline mr-1" /> Community
                                </span>
                                <h1 className="text-2xl md:text-3xl font-black">Bài viết của tôi</h1>
                                <p className="text-slate-400 text-sm">{posts.length} bài viết đã đăng</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link href="/profile" className="flex items-center gap-2 bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-white/20 transition-all">
                                <ArrowLeft size={16} />
                                Quay lại
                            </Link>
                            <button
                                onClick={handleCreatePost}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                            >
                                <Plus size={18} />
                                Tạo bài viết
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                            <MessageCircle size={22} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                            <p className="text-xs text-slate-500 font-medium">Bài viết</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center">
                            <Heart size={22} className="text-rose-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-rose-600">{stats.totalLikes}</p>
                            <p className="text-xs text-slate-500 font-medium">Lượt thích</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                            <MessageSquare size={22} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-amber-600">{stats.totalComments}</p>
                            <p className="text-xs text-slate-500 font-medium">Bình luận</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            {posts.length > 0 && (
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                </div>
            )}

            {/* Posts List */}
            {filteredPosts.length > 0 ? (
                <div className="space-y-4">
                    {filteredPosts.map((post) => (
                        <article
                            key={post.id}
                            className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-blue-200 hover:shadow-xl transition-all"
                        >
                            <div className="p-5">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Image
                                                src={profile?.avatar || '/favicon.png'}
                                                alt={profile?.name || 'User'}
                                                width={44}
                                                height={44}
                                                className="rounded-full ring-2 ring-blue-100"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{profile?.name || 'Bạn'}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                                <Clock size={12} className="text-blue-400" />
                                                {new Date(post.created_at).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Link
                                            href="/community"
                                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Xem bài viết"
                                        >
                                            <Eye size={16} className="text-slate-400 hover:text-blue-500" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            disabled={deletingId === post.id}
                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                                            title="Xóa bài viết"
                                        >
                                            {deletingId === post.id ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={16} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <Link href="/community">
                                    <h3 className="font-bold text-lg text-slate-900 mb-2 hover:text-blue-600 transition-colors">
                                        {post.title}
                                    </h3>
                                </Link>
                                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{post.content}</p>

                                {/* Tags */}
                                {post.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {post.tags.slice(0, 4).map(tag => (
                                            <span key={tag} className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                        <Heart size={16} className="text-rose-400" />
                                        <span className="font-medium">{post.likes_count || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                        <MessageSquare size={16} className="text-blue-400" />
                                        <span className="font-medium">{post.comments_count || 0}</span>
                                    </div>
                                    {post.is_pinned && (
                                        <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                            <Pin size={12} /> Ghim
                                        </span>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MessageCircle size={32} className="text-slate-300" />
                    </div>
                    <h3 className="font-bold text-xl text-slate-900 mb-2">
                        {searchTerm ? 'Không tìm thấy bài viết' : 'Chưa có bài viết nào'}
                    </h3>
                    <p className="text-slate-500 mb-6">
                        {searchTerm ? 'Thử với từ khóa khác' : 'Hãy chia sẻ kiến thức với cộng đồng!'}
                    </p>
                    <button
                        onClick={handleCreatePost}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                    >
                        <PenTool size={18} />
                        Viết bài đầu tiên
                    </button>
                </div>
            )}

            {/* Link to Community */}
            <div className="p-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-xl mb-1">Khám phá cộng đồng</h3>
                        <p className="text-blue-100 text-sm">Xem bài viết từ các thành viên khác</p>
                    </div>
                    <Link
                        href="/community"
                        className="flex items-center justify-center gap-2 bg-white text-blue-600 px-5 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors"
                    >
                        <TrendingUp size={18} />
                        Xem tất cả
                    </Link>
                </div>
            </div>

            {/* Create Post Modal */}
            <CreatePostModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                onPost={handleNewPost}
            />
        </div>
    );
}
