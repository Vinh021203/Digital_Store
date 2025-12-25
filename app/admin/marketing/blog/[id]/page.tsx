'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileText,
    ArrowLeft,
    Edit3,
    Trash2,
    Loader2,
    Eye,
    EyeOff,
    Calendar,
    Tag,
    User,
    ExternalLink,
} from 'lucide-react';
import { getPostById, deletePost, togglePublish, type DbBlogPost } from '@/lib/blog';
import { useToast } from '@/context/ToastContext';
import SafeHTML from '@/components/ui/SafeHTML';

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const toast = useToast();

    const [post, setPost] = useState<DbBlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPost = async () => {
            try {
                const data = await getPostById(Number(id));
                setPost(data);
            } catch (error) {
                console.error('Error loading post:', error);
                toast.error('Không thể tải bài viết');
            } finally {
                setLoading(false);
            }
        };
        loadPost();
    }, [id, toast]);

    const handleDelete = async () => {
        if (!post) return;
        if (!confirm(`Bạn có chắc muốn xóa bài "${post.title}"?`)) return;

        try {
            await deletePost(post.id);
            toast.success('Đã xóa bài viết');
            router.push('/admin/marketing/blog');
        } catch (error: any) {
            toast.error(error.message || 'Không thể xóa');
        }
    };

    const handleToggle = async () => {
        if (!post) return;
        try {
            await togglePublish(post.id, !post.is_published);
            setPost(prev => prev ? { ...prev, is_published: !prev.is_published } : null);
            toast.success(`Đã ${!post.is_published ? 'xuất bản' : 'chuyển về nháp'}`);
        } catch (error) {
            toast.error('Không thể cập nhật');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="text-center py-20">
                <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500">Không tìm thấy bài viết</p>
                <button
                    onClick={() => router.push('/admin/marketing/blog')}
                    className="mt-4 text-indigo-600 font-bold"
                >
                    ← Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/admin/marketing/blog')}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <FileText size={24} className="text-indigo-600" />
                            Chi tiết bài viết
                        </h2>
                        <p className="text-sm text-slate-500">ID: {post.id}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleToggle}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${post.is_published
                            ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}
                    >
                        {post.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                        {post.is_published ? 'Ẩn bài' : 'Xuất bản'}
                    </button>
                    <button
                        onClick={() => router.push(`/admin/marketing/blog/${post.id}/edit`)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700"
                    >
                        <Edit3 size={16} /> Chỉnh sửa
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100"
                    >
                        <Trash2 size={16} /> Xóa
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Cover */}
                    {post.cover_image && (
                        <div className="rounded-2xl overflow-hidden">
                            <img src={post.cover_image} alt={post.title} className="w-full h-64 object-cover" />
                        </div>
                    )}

                    {/* Title & Content */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${post.is_published ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                            }`}>
                            {post.is_published ? 'Đã xuất bản' : 'Bản nháp'}
                        </span>

                        <h1 className="text-2xl font-bold text-slate-900 mb-4">{post.title}</h1>

                        {post.excerpt && (
                            <p className="text-slate-500 mb-6 italic border-l-4 border-indigo-200 pl-4">
                                {post.excerpt}
                            </p>
                        )}

                        <SafeHTML
                            html={post.content || ''}
                            className="prose max-w-none"
                            fallback="<p class='text-slate-400'>Không có nội dung</p>"
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Info */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                        <h3 className="font-bold text-slate-900 border-b pb-3">Thông tin</h3>

                        <div className="flex items-center gap-3 text-sm">
                            <Calendar size={16} className="text-slate-400" />
                            <span className="text-slate-600">
                                Tạo: {new Date(post.created_at).toLocaleDateString('vi-VN')}
                            </span>
                        </div>

                        {post.published_at && (
                            <div className="flex items-center gap-3 text-sm">
                                <Eye size={16} className="text-green-500" />
                                <span className="text-slate-600">
                                    Xuất bản: {new Date(post.published_at).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center gap-3 text-sm">
                            <Eye size={16} className="text-slate-400" />
                            <span className="text-slate-600">{post.views_count.toLocaleString()} lượt xem</span>
                        </div>

                        {post.category && (
                            <div className="flex items-center gap-3 text-sm">
                                <Tag size={16} className="text-slate-400" />
                                <span className="text-slate-600">{post.category}</span>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                            <h3 className="font-bold text-slate-900 border-b pb-3">Thẻ</h3>
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Link */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                        <h3 className="font-bold text-slate-900 border-b pb-3">Đường dẫn</h3>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                            <code className="flex-1 text-xs text-slate-600 truncate">/blog/{post.slug}</code>
                            <a
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                className="p-2 hover:bg-slate-200 rounded text-indigo-600"
                            >
                                <ExternalLink size={16} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
