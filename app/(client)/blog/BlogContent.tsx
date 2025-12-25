'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    BookOpen, Clock, ArrowRight, Search, Eye,
    Home, ChevronRight, Sparkles, Flame, Loader2,
} from 'lucide-react';
import { fetchPublishedPosts, type DbBlogPost } from '@/lib/blog';
import { BLOG_CATEGORIES } from '@/lib/blog';

export default function BlogPage() {
    const [posts, setPosts] = useState<DbBlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tất cả');

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

    const featuredPosts = useMemo(() => {
        return [...posts].sort((a, b) => b.views_count - a.views_count).slice(0, 2);
    }, [posts]);

    const categories = useMemo(() => {
        return ['Tất cả', ...BLOG_CATEGORIES.map(c => c.name)];
    }, []);

    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            const matchSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchCategory = activeCategory === 'Tất cả' || post.category === activeCategory;
            return matchSearch && matchCategory;
        });
    }, [posts, searchTerm, activeCategory]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white">
            {/* Hero */}
            <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200')] opacity-10 bg-cover bg-center" />
                <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                        <Link href="/" className="hover:text-white flex items-center gap-1"><Home size={14} /> Trang chủ</Link>
                        <ChevronRight size={14} />
                        <span className="text-white">Blog</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4">Kiến Thức & Xu Hướng <span className="text-orange-400">Công Nghệ</span></h1>
                    <div className="relative max-w-xl mt-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài viết..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-600" /></div>
                ) : (
                    <>
                        {/* Categories */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold ${activeCategory === cat ? 'bg-orange-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Posts */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPosts.map(post => (
                                <Link key={post.id} href={`/blog/${post.slug}`} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl">
                                    <div className="relative aspect-video overflow-hidden">
                                        {post.cover_image ? (
                                            <Image src={post.cover_image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                                <BookOpen size={32} className="text-slate-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-orange-600 line-clamp-2">{post.title}</h3>
                                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{post.excerpt}</p>
                                        <div className="flex items-center justify-between text-sm text-slate-400">
                                            <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                                            <span className="flex items-center gap-1"><Eye size={14} /> {post.views_count}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {filteredPosts.length === 0 && (
                            <div className="text-center py-16">
                                <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                                <h3 className="text-lg font-bold text-slate-900">Không tìm thấy bài viết</h3>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
