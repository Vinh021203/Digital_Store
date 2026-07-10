'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    ChevronRight,
    Eye,
    Flame,
    Home,
    Loader2,
    Search,
    Sparkles,
    Tag,
} from 'lucide-react';
import { collectBlogTaxonomy, fetchPublishedPosts, type DbBlogPost } from '@/lib/blog';

const ALL_CATEGORY = 'Tất cả';

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

const getReadTime = (post: DbBlogPost) => {
    const text = (post.content || post.excerpt || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = text ? text.split(' ').length : 220;
    return Math.max(1, Math.ceil(words / 220));
};

const BlogImage = ({ post, priority = false }: { post: DbBlogPost; priority?: boolean }) => (
    <div className="relative aspect-video overflow-hidden bg-slate-100">
        {post.cover_image ? (
            <Image
                src={post.cover_image}
                alt={post.title}
                fill
                priority={priority}
                sizes={priority ? '(min-width: 1024px) 58vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
        ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 to-slate-100">
                <BookOpen size={34} className="text-slate-300" />
            </div>
        )}
    </div>
);

export default function BlogPage() {
    const [posts, setPosts] = useState<DbBlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);

    const loadPosts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchPublishedPosts();
            setPosts(data);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    const categories = useMemo(() => [ALL_CATEGORY, ...collectBlogTaxonomy(posts, false).categories], [posts]);

    const filteredPosts = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return posts.filter(post => {
            const haystack = `${post.title} ${post.excerpt || ''} ${(post.tags || []).join(' ')}`.toLowerCase();
            const matchSearch = !normalizedSearch || haystack.includes(normalizedSearch);
            const matchCategory = activeCategory === ALL_CATEGORY || post.category === activeCategory;
            return matchSearch && matchCategory;
        });
    }, [posts, searchTerm, activeCategory]);

    const featuredPost = filteredPosts[0] || posts[0];
    const secondaryPosts = filteredPosts.filter(post => post.id !== featuredPost?.id).slice(0, 3);
    const highlightedPostIds = new Set(
        [featuredPost?.id, ...secondaryPosts.map(post => post.id)].filter((id): id is number => Boolean(id))
    );
    const latestPosts = filteredPosts.filter(post => !highlightedPostIds.has(post.id)).slice(0, 9);
    const popularPosts = useMemo(() => [...posts].sort((a, b) => b.views_count - a.views_count).slice(0, 4), [posts]);

    return (
        <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <section className="relative overflow-hidden bg-slate-950 text-white">
                <div className="absolute inset-0">
                    <Image
                        src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600"
                        alt="Không gian viết blog và thiết kế website"
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover opacity-[0.18]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/88 to-slate-950" />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
                    <nav className="mb-8 flex items-center gap-2 text-sm text-slate-300">
                        <Link href="/" className="inline-flex items-center gap-1 transition-colors hover:text-white">
                            <Home size={14} />
                            Trang chủ
                        </Link>
                        <ChevronRight size={14} />
                        <span className="font-bold text-white">Tin tức</span>
                    </nav>

                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
                        <div className="max-w-3xl">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-orange-300 backdrop-blur">
                                <Sparkles size={14} />
                                Web Giá Rẻ - Portfolio
                            </span>
                            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                                Tin tức, kiến thức website và landing page
                            </h1>
                            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                                Cập nhật kinh nghiệm chọn giao diện, tối ưu nội dung, UI/UX và triển khai dự án web theo hướng demo, portfolio và tư vấn thực tế.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-300">
                                Tìm bài viết
                            </label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Tìm theo chủ đề, từ khóa, tag..."
                                    value={searchTerm}
                                    onChange={event => setSearchTerm(event.target.value)}
                                    className="w-full rounded-xl border border-white/15 bg-white px-12 py-3.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-500/15"
                                />
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-300">
                                <div className="rounded-xl bg-white/10 p-3">
                                    <p className="text-lg font-black text-white">{posts.length}</p>
                                    Bài viết
                                </div>
                                <div className="rounded-xl bg-white/10 p-3">
                                    <p className="text-lg font-black text-white">{Math.max(0, categories.length - 1)}</p>
                                    Chủ đề
                                </div>
                                <div className="rounded-xl bg-white/10 p-3">
                                    <p className="text-lg font-black text-white">{popularPosts[0]?.views_count.toLocaleString('vi-VN') || 0}</p>
                                    Lượt xem
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-4 sm:px-6 lg:px-8">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition-all ${activeCategory === category
                                ? 'bg-slate-950 text-white shadow-lg shadow-slate-900/10'
                                : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </section>

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
                {loading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-sm">
                        <BookOpen size={50} className="mx-auto mb-4 text-slate-200" />
                        <h2 className="text-xl font-black text-slate-950">Không tìm thấy bài viết</h2>
                        <p className="mt-2 text-slate-500">Thử đổi từ khóa hoặc chọn danh mục khác.</p>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
                        <div className="min-w-0 space-y-10">
                            {featuredPost && (
                                <section>
                                    <div className="mb-5 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-orange-500">Nổi bật</p>
                                            <h2 className="mt-1 text-2xl font-black text-slate-950">Bài viết mới đáng đọc</h2>
                                        </div>
                                        <Link href="/products" className="hidden items-center gap-2 text-sm font-black text-slate-600 hover:text-orange-600 sm:inline-flex">
                                            Xem mẫu demo
                                            <ArrowRight size={16} />
                                        </Link>
                                    </div>

                                    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
                                        <Link href={`/blog/${featuredPost.slug}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                                            <BlogImage post={featuredPost} priority />
                                            <div className="p-6">
                                                <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400">
                                                    {featuredPost.category && (
                                                        <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-600">{featuredPost.category}</span>
                                                    )}
                                                    <span className="inline-flex items-center gap-1"><CalendarDays size={14} /> {formatDate(featuredPost.published_at || featuredPost.created_at)}</span>
                                                    <span className="inline-flex items-center gap-1"><Eye size={14} /> {featuredPost.views_count.toLocaleString('vi-VN')}</span>
                                                </div>
                                                <h3 className="text-2xl font-black leading-tight text-slate-950 transition-colors group-hover:text-orange-600">
                                                    {featuredPost.title}
                                                </h3>
                                                {featuredPost.excerpt && (
                                                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{featuredPost.excerpt}</p>
                                                )}
                                                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-orange-600">
                                                    Đọc bài viết <ArrowRight size={16} />
                                                </span>
                                            </div>
                                        </Link>

                                        <div className="grid gap-4 lg:h-full lg:grid-rows-3">
                                            {secondaryPosts.map(post => (
                                                <Link key={post.id} href={`/blog/${post.slug}`} className="group grid min-h-[150px] grid-cols-[138px_minmax(0,1fr)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg sm:grid-cols-[160px_minmax(0,1fr)] lg:h-full lg:min-h-0">
                                                    <div className="relative h-full overflow-hidden bg-slate-100">
                                                        {post.cover_image ? (
                                                            <Image src={post.cover_image} alt={post.title} fill sizes="(min-width: 1024px) 160px, 138px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center">
                                                                <BookOpen size={26} className="text-slate-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex min-w-0 flex-col justify-center p-4">
                                                        {post.category && <p className="mb-1 truncate text-[10px] font-black uppercase tracking-wide text-orange-500">{post.category}</p>}
                                                        <h3 className="line-clamp-3 text-base font-black leading-snug text-slate-950 group-hover:text-orange-600">{post.title}</h3>
                                                        <p className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400">
                                                            <span>{getReadTime(post)} phút đọc</span>
                                                            <span className="inline-flex items-center gap-1"><Eye size={12} /> {post.views_count}</span>
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}

                            <section>
                                <div className="mb-5 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-orange-500">Tất cả bài viết</p>
                                        <h2 className="mt-1 text-2xl font-black text-slate-950">Kiến thức triển khai web</h2>
                                    </div>
                                    <span className="text-sm font-bold text-slate-400">{filteredPosts.length} bài</span>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                    {latestPosts.map(post => (
                                        <Link key={post.id} href={`/blog/${post.slug}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl">
                                            <BlogImage post={post} />
                                            <div className="p-5">
                                                <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold text-slate-400">
                                                    <span className="truncate text-orange-600">{post.category || 'Tin tức'}</span>
                                                    <span className="inline-flex items-center gap-1"><Eye size={13} /> {post.views_count}</span>
                                                </div>
                                                <h3 className="line-clamp-2 min-h-[54px] text-lg font-black leading-snug text-slate-950 group-hover:text-orange-600">
                                                    {post.title}
                                                </h3>
                                                {post.excerpt && (
                                                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{post.excerpt}</p>
                                                )}
                                                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-slate-400">
                                                    <span>{formatDate(post.published_at || post.created_at)}</span>
                                                    <span>{getReadTime(post)} phút đọc</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
                                    <Flame size={18} className="text-orange-500" />
                                    Đọc nhiều
                                </h2>
                                <div className="mt-5 space-y-4">
                                    {popularPosts.map((post, index) => (
                                        <Link key={post.id} href={`/blog/${post.slug}`} className="group flex gap-3 rounded-xl p-2 transition hover:bg-orange-50">
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-xs font-black text-white">
                                                {index + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <h3 className="line-clamp-2 text-sm font-black leading-5 text-slate-900 group-hover:text-orange-600">{post.title}</h3>
                                                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-400">
                                                    <Eye size={12} />
                                                    {post.views_count.toLocaleString('vi-VN')} lượt xem
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
                                    <Tag size={18} className="text-orange-500" />
                                    Chủ đề
                                </h2>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {categories.slice(1).map(category => (
                                        <button
                                            key={category}
                                            onClick={() => setActiveCategory(category)}
                                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm">
                                <Sparkles size={20} className="text-orange-500" />
                                <h2 className="mt-3 text-lg font-black text-slate-950">Cần chọn mẫu demo?</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Xem thư viện portfolio hoặc gửi yêu cầu để được tư vấn hướng giao diện phù hợp.
                                </p>
                                <Link href="/products" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-black text-white transition hover:bg-orange-700">
                                    Xem mẫu demo
                                    <ArrowRight size={16} />
                                </Link>
                            </section>
                        </aside>
                    </div>
                )}
            </div>
        </main>
    );
}
