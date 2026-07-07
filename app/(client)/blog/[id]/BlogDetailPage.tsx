'use client';

import React, { useState, useEffect, use, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft,
    Bookmark,
    BookOpen,
    Calendar,
    Check,
    ChevronRight,
    Clock,
    Eye,
    Facebook,
    Heart,
    Home,
    Linkedin,
    Link2,
    Loader2,
    Mail,
    MessageCircle,
    Share2,
    Sparkles,
    Star,
    Tag,
    Twitter,
    User,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { getPostBySlug, fetchPublishedPosts, type DbBlogPost } from '@/lib/blog';
import { fetchActiveProducts } from '@/lib/products';
import type { Product } from '@/types';
import CommentsSection from '@/components/blog/CommentsSection';
import SafeHTML from '@/components/ui/SafeHTML';

const stripHtml = (html?: string | null) => (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const getReadingTime = (content?: string | null) => {
    const words = stripHtml(content).split(' ').filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 220));
};

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: slug } = use(params);
    const { addToast } = useToast();

    const [post, setPost] = useState<DbBlogPost | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<DbBlogPost[]>([]);
    const [demoProducts, setDemoProducts] = useState<Product[]>([]);
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

                const [allPosts, products] = await Promise.all([
                    fetchPublishedPosts({ category: data?.category || undefined, limit: 4 }),
                    fetchActiveProducts({ is_featured: true, limit: 5 }),
                ]);

                setRelatedPosts(allPosts.filter(p => p.id !== data?.id).slice(0, 3));

                if (products.length >= 4) {
                    setDemoProducts(products.slice(0, 5));
                } else {
                    const fallbackProducts = await fetchActiveProducts({ limit: 5 });
                    setDemoProducts(fallbackProducts.slice(0, 5));
                }
            } catch (error) {
                console.error('Error loading post:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [slug]);

    const readingTime = useMemo(() => getReadingTime(post?.content), [post?.content]);
    const plainExcerpt = post?.excerpt || stripHtml(post?.content).slice(0, 180);

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        addToast('Đã sao chép link bài viết', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = (platform: string) => {
        if (!post) return;

        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(post.title);
        const shareUrls: Record<string, string> = {
            facebook: `https://facebook.com/sharer/sharer.php?u=${url}`,
            twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
            linkedin: `https://linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`,
        };

        window.open(shareUrls[platform], '_blank', 'width=640,height=460');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-white px-5 py-4 shadow-sm">
                    <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
                    <span className="text-sm font-bold text-slate-700">Đang tải bài viết...</span>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
                <BookOpen size={52} className="mb-4 text-slate-300" />
                <h2 className="mb-2 text-2xl font-black text-slate-950">Không tìm thấy bài viết</h2>
                <p className="mb-6 max-w-md text-slate-500">Bài viết này không tồn tại, chưa được xuất bản hoặc đã bị xóa.</p>
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition-colors hover:bg-orange-700"
                >
                    <ArrowLeft size={18} />
                    Quay lại Blog
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <section className="relative overflow-hidden bg-slate-950 text-white">
                <div className="absolute inset-0">
                    {post.cover_image ? (
                        <Image
                            src={post.cover_image}
                            alt={post.title}
                            fill
                            priority
                            className="object-cover opacity-35"
                            sizes="100vw"
                        />
                    ) : (
                        <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,#fb923c,transparent_35%),linear-gradient(135deg,#0f172a,#111827)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/70 to-slate-950" />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                    <nav className="mb-10 flex min-w-0 items-center gap-2 text-sm text-slate-300">
                        <Link href="/" className="inline-flex items-center gap-1 transition-colors hover:text-white">
                            <Home size={14} />
                            Trang chủ
                        </Link>
                        <ChevronRight size={14} />
                        <Link href="/blog" className="transition-colors hover:text-white">Blog</Link>
                        <ChevronRight size={14} />
                        <span className="truncate text-white/80">{post.title}</span>
                    </nav>

                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
                        <div className="max-w-4xl">
                            <div className="mb-5 flex flex-wrap items-center gap-3">
                                {post.category && (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-xs font-black uppercase tracking-wide text-white">
                                        <Sparkles size={14} />
                                        {post.category}
                                    </span>
                                )}
                                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white/90 backdrop-blur">
                                    Blog Web Giá Rẻ - Portfolio
                                </span>
                            </div>

                            <h1 className="max-w-4xl text-3xl font-black leading-tight text-white sm:text-4xl lg:text-6xl">
                                {post.title}
                            </h1>

                            {plainExcerpt && (
                                <p className="mt-6 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
                                    {plainExcerpt}
                                </p>
                            )}

                            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                                <div className="flex items-center gap-3">
                                    {post.author?.avatar ? (
                                        <Image
                                            src={post.author.avatar}
                                            alt={post.author.name}
                                            width={44}
                                            height={44}
                                            className="rounded-full border-2 border-white/80 object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                                            <User size={18} />
                                        </span>
                                    )}
                                    <div>
                                        <p className="font-bold text-white">{post.author?.name || 'Web Giá Rẻ'}</p>
                                        <p className="text-xs text-slate-400">Nội dung tham khảo</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1.5">
                                    <Calendar size={16} />
                                    {formatDate(post.published_at || post.created_at)}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock size={16} />
                                    {readingTime} phút đọc
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Eye size={16} />
                                    {post.views_count.toLocaleString('vi-VN')} lượt xem
                                </span>
                            </div>
                        </div>

                        <aside className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                            <p className="text-xs font-black uppercase tracking-widest text-orange-300">Gợi ý triển khai</p>
                            <h2 className="mt-2 text-xl font-black text-white">Cần biến ý tưởng trong bài thành giao diện demo?</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                Gửi nhu cầu để mình tư vấn hướng giao diện, landing page hoặc portfolio web phù hợp.
                            </p>
                            <Link
                                href={`/contact?subject=${encodeURIComponent(post.title)}`}
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition-colors hover:bg-orange-600"
                            >
                                <MessageCircle size={18} />
                                Nhận tư vấn
                            </Link>
                        </aside>
                    </div>
                </div>
            </section>

            <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[72px_minmax(0,1fr)_320px] lg:px-8 lg:py-14">
                <aside className="hidden lg:block">
                    <div className="sticky top-24 flex flex-col items-center gap-3">
                        <button
                            onClick={() => setLiked(!liked)}
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm transition-all ${liked ? 'border-red-100 bg-red-50 text-red-500' : 'border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:text-red-500'}`}
                            aria-label="Thích bài viết"
                        >
                            <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
                        </button>
                        <button
                            onClick={() => setSaved(!saved)}
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm transition-all ${saved ? 'border-orange-100 bg-orange-50 text-orange-600' : 'border-slate-200 bg-white text-slate-500 hover:border-orange-200 hover:text-orange-600'}`}
                            aria-label="Lưu bài viết"
                        >
                            <Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />
                        </button>
                        <button
                            onClick={handleCopyLink}
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm transition-all ${copied ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:text-emerald-600'}`}
                            aria-label="Sao chép link"
                        >
                            {copied ? <Check size={20} /> : <Link2 size={20} />}
                        </button>
                    </div>
                </aside>

                <article className="min-w-0">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
                        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 lg:hidden">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setLiked(!liked)}
                                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${liked ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}
                                >
                                    <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                                    Thích
                                </button>
                                <button
                                    onClick={() => setSaved(!saved)}
                                    className={`rounded-full p-2.5 ${saved ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-600'}`}
                                    aria-label="Lưu bài viết"
                                >
                                    <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
                                </button>
                            </div>
                            <button
                                onClick={handleCopyLink}
                                className={`rounded-full p-2.5 ${copied ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}
                                aria-label="Sao chép link"
                            >
                                {copied ? <Check size={18} /> : <Link2 size={18} />}
                            </button>
                        </div>

                        {post.excerpt && (
                            <div className="mb-8 rounded-2xl border-l-4 border-orange-500 bg-orange-50 p-5 text-base font-medium leading-8 text-slate-700 sm:text-lg">
                                {post.excerpt}
                            </div>
                        )}

                        <SafeHTML
                            html={post.content || ''}
                            className="blog-rich-content prose prose-lg max-w-none prose-slate prose-headings:scroll-mt-24 prose-headings:font-black prose-headings:text-slate-950 prose-p:leading-8 prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:border prose-img:border-slate-100 prose-blockquote:rounded-r-2xl prose-blockquote:border-l-orange-500 prose-blockquote:bg-orange-50 prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:not-italic prose-pre:rounded-2xl prose-pre:bg-slate-950 prose-pre:text-slate-100"
                            fallback="<p>Không có nội dung.</p>"
                            allowInlineStyles={false}
                        />

                        {post.tags.length > 0 && (
                            <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-8">
                                <Tag size={17} className="text-slate-400" />
                                {post.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-orange-500">Chia sẻ bài viết</p>
                                <h2 className="mt-1 text-xl font-black text-slate-950">Gửi cho người đang cần nội dung này</h2>
                            </div>
                            <div className="flex gap-2">
                                {[
                                    { icon: Facebook, color: 'bg-blue-600 hover:bg-blue-700', platform: 'facebook', label: 'Facebook' },
                                    { icon: Twitter, color: 'bg-sky-500 hover:bg-sky-600', platform: 'twitter', label: 'Twitter' },
                                    { icon: Linkedin, color: 'bg-blue-700 hover:bg-blue-800', platform: 'linkedin', label: 'LinkedIn' },
                                ].map(social => (
                                    <button
                                        key={social.platform}
                                        onClick={() => handleShare(social.platform)}
                                        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-white transition-colors ${social.color}`}
                                        aria-label={`Chia sẻ lên ${social.label}`}
                                    >
                                        <social.icon size={18} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    <div className="mt-8">
                        <CommentsSection postId={post.id} />
                    </div>
                </article>

                <style jsx global>{`
                    .blog-rich-content :where(section, div):not(:has(img)):not(:has(table)) {
                        max-width: 100%;
                    }

                    .blog-rich-content > :where(div, section) {
                        margin-top: 1.25rem;
                        margin-bottom: 1.25rem;
                    }

                    .blog-rich-content :where(h1, h2, h3, h4) + :where(p, div, section, ul, ol) {
                        margin-top: 0.75rem;
                    }

                    .blog-rich-content :where(p, li, div) {
                        word-break: break-word;
                    }

                    .blog-rich-content :where(pre) {
                        overflow-x: auto;
                    }

                    .blog-rich-content :where(code):not(pre code) {
                        border-radius: 0.5rem;
                        background: #fff7ed;
                        padding: 0.15rem 0.35rem;
                        color: #c2410c;
                        font-weight: 700;
                    }

                    .blog-rich-content :where(img) {
                        display: block;
                        margin-left: auto;
                        margin-right: auto;
                    }
                `}</style>

                <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
                            <BookOpen size={18} className="text-orange-500" />
                            Thông tin bài viết
                        </h2>
                        <div className="mt-5 space-y-4 text-sm">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500">Danh mục</span>
                                <span className="text-right font-bold text-slate-800">{post.category || 'Kiến thức'}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500">Thời lượng</span>
                                <span className="font-bold text-slate-800">{readingTime} phút đọc</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500">Lượt xem</span>
                                <span className="font-bold text-slate-800">{post.views_count.toLocaleString('vi-VN')}</span>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm">
                        <Share2 size={20} className="text-orange-500" />
                        <h2 className="mt-3 text-lg font-black text-slate-950">Muốn xem demo phù hợp?</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Xem thư viện portfolio hoặc gửi yêu cầu tư vấn để chọn hướng giao diện phù hợp ngân sách.
                        </p>
                        <div className="mt-5 grid gap-2">
                            <Link
                                href="/products"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-slate-800"
                            >
                                Xem mẫu demo
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm font-black text-orange-600 transition-colors hover:bg-orange-50"
                            >
                                <Mail size={17} />
                                Gửi tư vấn
                            </Link>
                        </div>
                    </section>

                    {relatedPosts.length > 0 && (
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h2 className="text-lg font-black text-slate-950">Bài viết liên quan</h2>
                                <Link href="/blog" className="text-xs font-black text-orange-600 hover:text-orange-700">
                                    Xem thêm
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {relatedPosts.map(related => (
                                    <Link
                                        key={related.id}
                                        href={`/blog/${related.slug}`}
                                        className="group grid grid-cols-[84px_minmax(0,1fr)] gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-2 transition-all hover:border-orange-100 hover:bg-orange-50/50"
                                    >
                                        <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
                                            {related.cover_image ? (
                                                <Image
                                                    src={related.cover_image}
                                                    alt={related.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                    sizes="84px"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <BookOpen size={22} className="text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 py-1">
                                            {related.category && (
                                                <p className="mb-1 truncate text-[10px] font-black uppercase tracking-wide text-orange-600">
                                                    {related.category}
                                                </p>
                                            )}
                                            <h3 className="line-clamp-2 text-sm font-black leading-5 text-slate-950 group-hover:text-orange-600">
                                                {related.title}
                                            </h3>
                                            <p className="mt-2 flex items-center gap-1 text-xs font-bold text-slate-400">
                                                <Eye size={12} />
                                                {related.views_count.toLocaleString('vi-VN')}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </aside>
            </main>

            {demoProducts.length > 0 && (
                <section className="border-t border-slate-200 bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="mb-6 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-orange-500">Mẫu demo gợi ý</p>
                                <h2 className="mt-1 text-2xl font-black text-slate-950">Giao diện có thể phù hợp với nội dung này</h2>
                            </div>
                            <Link href="/products" className="hidden items-center gap-2 text-sm font-black text-slate-600 hover:text-orange-600 sm:inline-flex">
                                Xem thư viện demo
                                <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                            {demoProducts.map(product => (
                                <Link
                                    key={product.id}
                                    href={`/product/${(product as any).slug || product.id}`}
                                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
                                >
                                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                                        {product.image ? (
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-slate-100">
                                                <BookOpen size={32} className="text-slate-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="mb-2 flex items-center gap-1 text-xs font-black text-amber-500">
                                            <Star size={13} fill="currentColor" />
                                            {Number(product.rating || 5).toFixed(1)}
                                            <span className="font-bold text-slate-400">({product.reviews || 0} đánh giá)</span>
                                        </div>
                                        <h3 className="line-clamp-2 min-h-[42px] text-base font-black leading-snug text-slate-950 transition-colors group-hover:text-orange-600">
                                            {product.name}
                                        </h3>
                                        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-orange-50 px-3 py-2 text-orange-600 transition-colors group-hover:bg-orange-600 group-hover:text-white">
                                            <span className="text-sm font-black">Liên hệ tư vấn</span>
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/70 text-current">
                                                <ChevronRight size={17} />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
