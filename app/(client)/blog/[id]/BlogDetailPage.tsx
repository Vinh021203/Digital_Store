'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Clock, Calendar, Eye, Heart, Share2, Bookmark,
    ChevronLeft, Home, ChevronRight, Facebook, Twitter, Linkedin, Link2,
    Tag, Check, Loader2, BookOpen,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { getPostBySlug, fetchPublishedPosts, type DbBlogPost } from '@/lib/blog';
import CommentsSection from '@/components/blog/CommentsSection';
import SafeHTML from '@/components/ui/SafeHTML';

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Note: route is [id] but we use it as slug
    const { id: slug } = use(params);
    const { addToast } = useToast();

    const [post, setPost] = useState<DbBlogPost | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<DbBlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await getPostBySlug(slug);
                setPost(data);

                // Load related posts (same category)
                if (data?.category) {
                    const allPosts = await fetchPublishedPosts({ category: data.category, limit: 4 });
                    setRelatedPosts(allPosts.filter(p => p.id !== data.id).slice(0, 3));
                }
            } catch (error) {
                console.error('Error loading post:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [slug]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        addToast('Đã sao chép link bài viết', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = (platform: string) => {
        if (!post) return;
        const url = window.location.href;
        const title = post.title;
        let shareUrl = '';

        switch (platform) {
            case 'facebook':
                shareUrl = `https://facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                break;
            case 'linkedin':
                shareUrl = `https://linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`;
                break;
        }
        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <BookOpen size={48} className="text-slate-200 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy bài viết</h2>
                <p className="text-slate-500 mb-6">Bài viết này không tồn tại hoặc đã bị xóa.</p>
                <Link
                    href="/blog"
                    className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700"
                >
                    Quay lại Blog
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Image */}
            <div className="relative h-[50vh] md:h-[60vh] w-full">
                {post.cover_image ? (
                    <Image src={post.cover_image} alt={post.title} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Breadcrumb */}
                <div className="absolute top-6 left-0 right-0 max-w-4xl mx-auto px-4">
                    <div className="flex items-center gap-2 text-sm text-white/80">
                        <Link href="/" className="hover:text-white flex items-center gap-1">
                            <Home size={14} /> Trang chủ
                        </Link>
                        <ChevronRight size={14} />
                        <Link href="/blog" className="hover:text-white">Blog</Link>
                        <ChevronRight size={14} />
                        <span className="text-white truncate max-w-xs">{post.title.substring(0, 30)}...</span>
                    </div>
                </div>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                    <div className="max-w-4xl mx-auto">
                        {post.category && (
                            <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                                {post.category}
                            </span>
                        )}
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-white/80">
                            {post.author && (
                                <div className="flex items-center gap-2">
                                    {post.author.avatar && (
                                        <Image src={post.author.avatar} alt={post.author.name} width={40} height={40} className="rounded-full border-2 border-white" />
                                    )}
                                    <span className="font-medium">{post.author.name}</span>
                                </div>
                            )}
                            <span className="flex items-center gap-1">
                                <Calendar size={14} /> {new Date(post.created_at).toLocaleDateString('vi-VN')}
                            </span>
                            <span className="flex items-center gap-1">
                                <Eye size={14} /> {post.views_count.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                {/* Actions Bar */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setLiked(!liked)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${liked ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <Heart size={18} fill={liked ? 'currentColor' : 'none'} /> Thích
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSaved(!saved)}
                            className={`p-2.5 rounded-full transition-all ${saved ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            title="Lưu bài viết"
                        >
                            <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
                        </button>
                        <button
                            onClick={handleCopyLink}
                            className={`p-2.5 rounded-full transition-all ${copied ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            title="Sao chép link"
                        >
                            {copied ? <Check size={18} /> : <Link2 size={18} />}
                        </button>
                    </div>
                </div>

                {/* Excerpt */}
                {post.excerpt && (
                    <p className="text-xl text-slate-600 italic border-l-4 border-orange-300 pl-4 mb-8">
                        {post.excerpt}
                    </p>
                )}

                {/* Article Content - Sanitized */}
                <SafeHTML
                    html={post.content || ''}
                    className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-orange-500 prose-blockquote:bg-orange-50 prose-blockquote:py-2 prose-blockquote:not-italic prose-pre:bg-slate-900 prose-pre:text-slate-100"
                    fallback="<p>Không có nội dung</p>"
                />

                {/* Tags */}
                {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-slate-100">
                        <Tag size={16} className="text-slate-400" />
                        {post.tags.map(tag => (
                            <span
                                key={tag}
                                className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Share */}
                <div className="flex items-center gap-4 mt-8 p-6 bg-slate-50 rounded-2xl">
                    <span className="font-bold text-slate-700">Chia sẻ:</span>
                    <div className="flex gap-2">
                        {[
                            { icon: Facebook, color: 'bg-blue-600 hover:bg-blue-700', platform: 'facebook' },
                            { icon: Twitter, color: 'bg-sky-500 hover:bg-sky-600', platform: 'twitter' },
                            { icon: Linkedin, color: 'bg-blue-700 hover:bg-blue-800', platform: 'linkedin' },
                        ].map(social => (
                            <button
                                key={social.platform}
                                onClick={() => handleShare(social.platform)}
                                className={`p-2.5 ${social.color} text-white rounded-full transition-colors`}
                            >
                                <social.icon size={18} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comments Section */}
                <CommentsSection postId={post.id} />


                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <section className="mt-12">
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Bài Viết Liên Quan</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {relatedPosts.map(related => (
                                <Link
                                    key={related.id}
                                    href={`/blog/${related.slug}`}
                                    className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all"
                                >
                                    <div className="relative aspect-video overflow-hidden">
                                        {related.cover_image ? (
                                            <Image src={related.cover_image} alt={related.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200" />
                                        )}
                                    </div>
                                    <div className="p-4">
                                        {related.category && (
                                            <span className="text-xs font-bold text-orange-600">{related.category}</span>
                                        )}
                                        <h3 className="font-bold text-slate-900 mt-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
                                            {related.title}
                                        </h3>
                                        <span className="text-xs text-slate-400 flex items-center gap-1 mt-2">
                                            <Eye size={12} /> {related.views_count}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Back to Blog */}
                <div className="mt-12 text-center">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        <ChevronLeft size={18} /> Quay lại Blog
                    </Link>
                </div>
            </div>
        </div>
    );
}
