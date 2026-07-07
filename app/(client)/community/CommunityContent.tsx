'use client';

import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import {
    MessageCircle, Search, Filter, User, Home,
    Flame, Sparkles, Heart, MessageSquare, Share2, Bookmark, MoreHorizontal,
    Award, Star, Zap, Coffee, Users, ChevronRight, PenTool, Loader2, ClipboardList
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
    togglePostLike,
    hasUserLikedPost,
    fetchPostComments,
    createCommunityComment,
    type DbCommunityPost,
    type DbCommunityComment
} from '@/lib/community';

const TRENDING_TAGS = ['ReactJS', 'Kinh Doanh', 'Review', 'Hỏi Đáp', 'Tuyển Dụng', 'Chia Sẻ'];

const FloatingIcon = memo(({ icon: Icon, delay, className }: { icon: any; delay: number; className: string }) => (
    <div
        className={`absolute animate-float opacity-20 ${className}`}
        style={{ animationDelay: `${delay}s` }}
    >
        <Icon size={24} />
    </div>
));
FloatingIcon.displayName = 'FloatingIcon';

export default function CommunityPage() {
    const { user, profile } = useSupabaseAuth();
    const { addToast } = useToast();
    const router = useRouter();

    const [posts, setPosts] = useState<DbCommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTag, setActiveTag] = useState('all');
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

    const loadPosts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchCommunityPosts({
                tag: activeTag !== 'all' ? activeTag : undefined,
                searchTerm: searchTerm || undefined,
            });
            setPosts(data);

            // Check likes
            if (user?.id) {
                const likeChecks = await Promise.all(
                    data.map(post => hasUserLikedPost(post.id, user.id))
                );
                const likedSet = new Set<number>();
                data.forEach((post, idx) => {
                    if (likeChecks[idx]) likedSet.add(post.id);
                });
                setLikedPosts(likedSet);
            }
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id, activeTag, searchTerm]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    const handleCreatePostClick = useCallback(() => {
        if (!user) {
            addToast('Vui lòng đăng nhập để đăng bài viết', 'warning');
            router.push('/login');
            return;
        }
        setIsPostModalOpen(true);
    }, [user, addToast, router]);

    const handleNewPost = useCallback(async (newPostData: any) => {
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
            loadPosts(); // Reload to get fresh data with ID
        } catch (error) {
            console.error('Error creating post:', error);
            addToast('Có lỗi xảy ra khi đăng bài', 'error');
        }
    }, [user?.id, addToast, loadPosts]);

    const handleLike = useCallback(async (postId: number) => {
        if (!user) {
            addToast('Vui lòng đăng nhập để thích bài viết', 'warning');
            return;
        }

        try {
            const result = await togglePostLike(postId, user.id);
            setPosts(prev => prev.map(p =>
                p.id === postId ? { ...p, likes_count: result.count } : p
            ));

            setLikedPosts((prev: Set<number>) => {
                const newSet = new Set(prev);
                if (result.liked) newSet.add(postId);
                else newSet.delete(postId);
                return newSet;
            });
        } catch (error) {
            console.error('Error liking post:', error);
        }
    }, [user, addToast]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-white to-orange-50/30">
            {/* Animated Hero Header */}
            <header className="relative bg-gradient-to-r from-purple-600 via-violet-600 to-orange-500 text-white overflow-hidden">
                {/* Floating Icons */}
                <FloatingIcon icon={MessageCircle} delay={0} className="top-10 left-[10%] text-white" />
                <FloatingIcon icon={Heart} delay={0.5} className="top-20 left-[25%] text-pink-300" />
                <FloatingIcon icon={Star} delay={1} className="top-8 left-[40%] text-yellow-300" />
                <FloatingIcon icon={Zap} delay={1.5} className="top-16 right-[30%] text-amber-300" />
                <FloatingIcon icon={Coffee} delay={2} className="top-12 right-[15%] text-orange-300" />
                <FloatingIcon icon={Users} delay={0.3} className="bottom-20 left-[20%] text-white" />
                <FloatingIcon icon={Sparkles} delay={0.8} className="bottom-16 right-[25%] text-yellow-200" />

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    {/* Home Button */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-sm font-bold mb-6 transition-all hover:scale-105"
                    >
                        <Home size={16} /> Về Trang Chủ
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="max-w-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-white/20 rounded-2xl animate-pulse-slow">
                                    <MessageCircle size={28} />
                                </div>
                                <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">
                                    🔥 {posts.length}+ thảo luận
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                                Cộng Đồng
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300"> Web Giá Rẻ - Portfolio</span>
                            </h1>
                            <p className="text-lg text-purple-100">
                                Nơi chia sẻ kiến thức, kết nối và học hỏi cùng cộng đồng developer & designer
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { icon: Users, value: '5.2K', label: 'Thành viên' },
                                { icon: MessageSquare, value: '12K', label: 'Thảo luận' },
                                { icon: Award, value: '890', label: 'Chuyên gia' },
                            ].map((stat, idx) => (
                                <div key={idx} className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all hover:scale-105 cursor-default">
                                    <stat.icon className="mx-auto mb-2 animate-bounce-slow" size={24} style={{ animationDelay: `${idx * 0.2}s` }} />
                                    <p className="text-2xl font-black">{stat.value}</p>
                                    <p className="text-xs text-purple-200">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Search & Create */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <div className="relative flex-1 max-w-xl">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" />
                            <input
                                type="search"
                                placeholder="Tìm kiếm thảo luận, chủ đề, người dùng..."
                                className="w-full bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-purple-200 focus:ring-2 focus:ring-white/50 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleCreatePostClick}
                            className="flex items-center justify-center gap-2 bg-white text-purple-700 px-6 py-4 rounded-2xl font-bold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 group"
                        >
                            <PenTool size={18} className="group-hover:rotate-12 transition-transform" />
                            Tạo bài viết mới
                        </button>
                    </div>
                </div>

                {/* Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 fill-white">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,156.63,69.08,321.39,56.44Z"></path>
                    </svg>
                </div>
            </header>

            {/* Tags Carousel */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-100 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
                        <span className="flex items-center gap-1 text-sm font-bold text-slate-400 flex-shrink-0">
                            <Filter size={14} /> Lọc:
                        </span>
                        <button
                            onClick={() => setActiveTag('all')}
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTag === 'all'
                                ? 'bg-slate-900 text-white shadow-lg'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            🌟 Tất cả
                        </button>
                        {TRENDING_TAGS.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setActiveTag(tag)}
                                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTag === tag
                                    ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-lg'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar */}
                    <aside className="hidden lg:block space-y-6 sticky top-24 h-fit">
                        {/* Promo Card */}
                        <div className="bg-gradient-to-br from-purple-600 via-violet-600 to-orange-500 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full animate-pulse" />
                            <Flame className="mb-3 animate-bounce-slow" size={28} />
                            <h3 className="font-black text-xl mb-2">Đua Top Tháng 12 🏆</h3>
                            <p className="text-purple-100 text-sm mb-4">
                                Chia sẻ kiến thức để nhận Voucher 500k!
                            </p>
                            <Link
                                href="#bai-viet-cong-dong"
                                className="block w-full text-center bg-white text-purple-600 font-bold py-3 rounded-xl hover:bg-purple-50 transition-colors"
                            >
                                Xem Bảng Xếp Hạng
                            </Link>
                        </div>

                        {/* Quick Links */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Zap className="text-amber-500" size={16} /> Truy cập nhanh
                            </h3>
                            <div className="space-y-2">
                                {[
                                    { icon: Heart, label: 'Bài viết đã lưu', color: 'text-rose-500', href: '/profile/community' },
                                    { icon: Users, label: 'Đang theo dõi', color: 'text-blue-500', href: '/community' },
                                    { icon: Award, label: 'Thành tích', color: 'text-amber-500', href: '/profile' },
                                    { icon: Star, label: 'Đánh dấu', color: 'text-purple-500', href: '/profile/community' },
                                ].map((item, idx) => (
                                    <Link
                                        key={idx}
                                        href={item.href}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                                    >
                                        <item.icon className={`${item.color} group-hover:scale-110 transition-transform`} size={18} />
                                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                        <ChevronRight size={14} className="ml-auto text-slate-300 group-hover:text-slate-500" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Main Feed */}
                    <div id="bai-viet-cong-dong" className="lg:col-span-2 space-y-6 scroll-mt-24">
                        {/* Quick Post Box */}
                        {user && (
                            <div
                                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 cursor-pointer hover:shadow-lg hover:border-purple-200 transition-all group"
                                onClick={handleCreatePostClick}
                            >
                                <div className="flex gap-4 items-center">
                                    <div className="relative w-12 h-12">
                                        <Image
                                            src={profile?.avatar || '/favicon.png'}
                                            alt={profile?.name || user.email || 'User'}
                                            fill
                                            className="rounded-full border-2 border-purple-200 object-cover group-hover:border-purple-400 transition-colors"
                                        />
                                    </div>
                                    <div className="flex-1 bg-slate-100 rounded-full px-5 py-3.5 text-slate-500 text-sm group-hover:bg-purple-50 group-hover:text-purple-600 transition-all">
                                        <span className="font-medium">{profile?.name || user.email} ơi, bạn muốn chia sẻ gì hôm nay?</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Posts */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
                                <p className="text-slate-500">Đang tải thảo luận...</p>
                            </div>
                        ) : posts.length > 0 ? (
                            posts.map((post, idx) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    delay={idx * 0.1}
                                    isLiked={likedPosts.has(post.id)}
                                    onLike={() => handleLike(post.id)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                                <MessageCircle size={48} className="mx-auto text-slate-200 mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Không có bài viết</h3>
                                <p className="text-sm text-slate-500">Thử tìm kiếm với từ khóa khác</p>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <aside className="hidden lg:block space-y-6 sticky top-24 h-fit">
                        {/* Top Contributors */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Award className="text-amber-500" size={16} /> Top Contributors
                            </h3>
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Image
                                                    src={`https://i.pravatar.cc/100?img=${i + 30}`}
                                                    alt={`User ${i}`}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-full ring-2 ring-transparent group-hover:ring-purple-300 transition-all"
                                                />
                                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white ${i === 1 ? 'bg-amber-400' : i === 2 ? 'bg-slate-400' : i === 3 ? 'bg-orange-400' : 'bg-slate-300'
                                                    }`}>
                                                    {i}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">User {i}</p>
                                                <p className="text-xs text-slate-500">{6 - i}.{i}k tương tác</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-400">Gợi ý</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Guidelines */}
                        <div className="bg-gradient-to-br from-slate-50 to-purple-50 rounded-2xl p-5 border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">
                                <ClipboardList className="text-orange-500" size={16} />
                                Quy tắc cộng đồng
                            </h3>
                            <ul className="text-xs text-slate-600 space-y-2">
                                <li>• Tôn trọng ý kiến của mọi người</li>
                                <li>• Không spam hoặc quảng cáo</li>
                                <li>• Chia sẻ kiến thức có giá trị</li>
                                <li>• Báo cáo nội dung vi phạm</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>

            <CreatePostModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                onPost={handleNewPost}
            />

            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    );
}

const PostCard = memo(({ post, delay, isLiked, onLike }: {
    post: DbCommunityPost;
    delay: number;
    isLiked: boolean;
    onLike: () => void;
}) => {
    const { user, profile } = useSupabaseAuth();
    const [saved, setSaved] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState<DbCommunityComment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);

    // Reply state
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');

    const handleSharePost = async () => {
        const url = `${window.location.origin}/community`;
        try {
            if (navigator.share) {
                await navigator.share({ title: post.title, text: post.content.slice(0, 120), url });
            } else {
                await navigator.clipboard.writeText(url);
            }
        } catch {
            // Người dùng đóng hộp thoại chia sẻ.
        }
    };

    // Fetch comments when opened
    useEffect(() => {
        if (showComments && comments.length === 0) {
            setLoadingComments(true);
            fetchPostComments(post.id)
                .then(data => setComments(data))
                .catch(err => console.error(err))
                .finally(() => setLoadingComments(false));
        }
    }, [showComments, post.id]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !user) return;

        const newCommentPayload = {
            post_id: post.id,
            author_id: user.id,
            content: commentText.trim()
        };

        try {
            const newComment = await createCommunityComment(newCommentPayload);
            if (newComment) {
                const commentWithAuthor: DbCommunityComment = {
                    ...newComment,
                    author: {
                        id: user.id,
                        name: profile?.name || user.email || 'Me',
                        avatar: profile?.avatar || ''
                    },
                    replies: []
                };
                setComments(prev => [...prev, commentWithAuthor]);
                setCommentText('');
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };

    const handleReplySubmit = async (e: React.FormEvent, parentId: number) => {
        e.preventDefault();
        if (!replyText.trim() || !user) return;

        const newReplyPayload = {
            post_id: post.id,
            author_id: user.id,
            content: replyText.trim(),
            parent_id: parentId
        };

        try {
            const newReply = await createCommunityComment(newReplyPayload);
            if (newReply) {
                const replyWithAuthor: DbCommunityComment = {
                    ...newReply,
                    author: {
                        id: user.id,
                        name: profile?.name || user.email || 'Me',
                        avatar: profile?.avatar || ''
                    }
                };

                // Update local state to include reply
                setComments(prev => prev.map(c => {
                    if (c.id === parentId) {
                        return {
                            ...c,
                            replies: [...(c.replies || []), replyWithAuthor]
                        };
                    }
                    return c;
                }));

                setReplyText('');
                setReplyingTo(null);
            }
        } catch (error) {
            console.error('Error submitting reply:', error);
        }
    };

    return (
        <article
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:border-purple-200 transition-all duration-300"
            style={{ animationDelay: `${delay}s` }}
        >
            <div className="p-5">
                {/* Author */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11">
                            <Image
                                src={post.author?.avatar || '/favicon.png'}
                                alt={post.author?.name || 'User'}
                                fill
                                className="rounded-full ring-2 ring-purple-100 object-cover"
                            />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-sm">{post.author?.name || 'Ẩn danh'}</p>
                            <p className="text-xs text-slate-500">
                                {new Date(post.created_at).toLocaleDateString('vi-VN', {
                                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <h3 className="font-bold text-slate-900 text-lg mb-2 hover:text-purple-600 transition-colors cursor-pointer">
                    {post.title}
                </h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-3 whitespace-pre-line">{post.content}</p>

                {/* Image */}
                {post.image && (
                    <div className="mb-4 rounded-xl overflow-hidden relative h-64 bg-slate-50">
                        <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags && post.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-full">
                            #{tag}
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onLike}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${isLiked ? 'bg-rose-100 text-rose-600' : 'hover:bg-slate-100 text-slate-500'
                                }`}
                        >
                            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'animate-ping-once' : ''} />
                            {post.likes_count}
                        </button>
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${showComments ? 'bg-purple-100 text-purple-600' : 'hover:bg-slate-100 text-slate-500'}`}
                        >
                            <MessageSquare size={16} /> {post.comments_count}
                        </button>
                        <button onClick={handleSharePost} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium hover:bg-slate-100 text-slate-500 transition-all" aria-label="Chia sẻ bài viết">
                            <Share2 size={16} />
                        </button>
                    </div>
                    <button
                        onClick={() => setSaved(!saved)}
                        className={`p-2 rounded-full transition-all ${saved ? 'bg-amber-100 text-amber-600' : 'hover:bg-slate-100 text-slate-400'
                            }`}
                    >
                        <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
                    </button>
                </div>

                {/* Comment Section */}
                {showComments && (
                    <div className="mt-4 pt-4 border-t border-slate-100 animate-slide-down">
                        {/* Comments List */}
                        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {loadingComments ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="animate-spin text-purple-500" size={20} />
                                </div>
                            ) : comments.length > 0 ? (
                                comments.map(comment => (
                                    <div key={comment.id} className="space-y-3">
                                        <div className="flex gap-3">
                                            <div className="relative w-8 h-8 flex-shrink-0">
                                                <Image
                                                    src={comment.author?.avatar || '/favicon.png'}
                                                    alt={comment.author?.name || 'User'}
                                                    fill
                                                    className="rounded-full object-cover border border-slate-100"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="bg-slate-50 rounded-2xl px-4 py-2 border border-slate-100 inline-block min-w-[200px]">
                                                    <div className="flex items-center justify-between mb-1 gap-2">
                                                        <span className="text-xs font-bold text-slate-900">{comment.author?.name || 'Ẩn danh'}</span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {new Date(comment.created_at).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.content}</p>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 ml-2">
                                                    <button
                                                        className="text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors"
                                                        onClick={() => {
                                                            setReplyingTo(replyingTo === comment.id ? null : comment.id);
                                                            setReplyText('');
                                                        }}
                                                    >
                                                        Phản hồi
                                                    </button>
                                                </div>

                                                {/* Reply Form */}
                                                {replyingTo === comment.id && (
                                                    <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mt-3 flex gap-2 animate-slide-down">
                                                        <div className="relative w-6 h-6 flex-shrink-0 mt-1">
                                                            <Image
                                                                src={profile?.avatar || '/favicon.png'}
                                                                alt="Me"
                                                                fill
                                                                className="rounded-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <textarea
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                placeholder={`Trả lời ${comment.author?.name}...`}
                                                                className="w-full bg-slate-50 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none border border-slate-100"
                                                                rows={1}
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                                        e.preventDefault();
                                                                        handleReplySubmit(e, comment.id);
                                                                    }
                                                                }}
                                                            />
                                                            <div className="flex justify-end mt-1">
                                                                <button
                                                                    type="submit"
                                                                    disabled={!replyText.trim()}
                                                                    className="bg-purple-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                                                >
                                                                    Gửi phản hồi
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                )}
                                            </div>
                                        </div>

                                        {/* Render Replies */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="pl-11 space-y-3">
                                                {comment.replies.map(reply => (
                                                    <div key={reply.id} className="flex gap-3">
                                                        <div className="relative w-6 h-6 flex-shrink-0">
                                                            <Image
                                                                src={reply.author?.avatar || '/favicon.png'}
                                                                alt={reply.author?.name || 'User'}
                                                                fill
                                                                className="rounded-full object-cover border border-slate-100"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="bg-slate-50 rounded-2xl px-3 py-2 border border-slate-100 inline-block min-w-[150px]">
                                                                <div className="flex items-center justify-between mb-1 gap-2">
                                                                    <span className="text-xs font-bold text-slate-900">{reply.author?.name || 'Ẩn danh'}</span>
                                                                    <span className="text-[10px] text-slate-400">
                                                                        {new Date(reply.created_at).toLocaleDateString('vi-VN')}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{reply.content}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-sm text-slate-400 py-2">Chưa có bình luận nào.</p>
                            )}
                        </div>

                        {/* Comment Input (Main) */}
                        <form onSubmit={handleCommentSubmit} className="flex gap-3">
                            <div className="relative w-8 h-8 flex-shrink-0 hidden sm:block">
                                <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden relative">
                                    {profile?.avatar ? (
                                        <Image
                                            src={profile.avatar}
                                            alt={profile.name || 'User'}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <User size={20} className="m-auto mt-1.5 text-slate-400" />
                                    )}
                                </div>
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Viết bình luận của bạn..."
                                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none border border-slate-100"
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleCommentSubmit(e);
                                        }
                                    }}
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-[10px] text-slate-400">Nhấn Enter để gửi</span>
                                    <button
                                        type="submit"
                                        disabled={!commentText.trim()}
                                        className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Gửi
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </article>
    );
});
PostCard.displayName = 'PostCard';
