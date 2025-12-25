'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileText,
    ArrowLeft,
    Save,
    Loader2,
    Image as ImageIcon,
    Eye,
    X,
} from 'lucide-react';
import { getPostById, updatePost, type DbBlogPost } from '@/lib/blog';
import { useToast } from '@/context/ToastContext';
import { BLOG_CATEGORIES, BLOG_TAGS } from '@/lib/blog';
import SafeHTML from '@/components/ui/SafeHTML';

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const toast = useToast();

    const [post, setPost] = useState<DbBlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        cover_image: '',
        category: '',
        tags: [] as string[],
        is_published: false,
    });

    useEffect(() => {
        const loadPost = async () => {
            try {
                const data = await getPostById(Number(id));
                if (data) {
                    setPost(data);
                    setFormData({
                        title: data.title,
                        slug: data.slug,
                        excerpt: data.excerpt || '',
                        content: data.content || '',
                        cover_image: data.cover_image || '',
                        category: data.category || '',
                        tags: data.tags || [],
                        is_published: data.is_published,
                    });
                }
            } catch (error) {
                console.error('Error loading post:', error);
                toast.error('Không thể tải bài viết');
            } finally {
                setLoading(false);
            }
        };
        loadPost();
    }, [id, toast]);

    const handleTagToggle = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag],
        }));
    };

    const handleSubmit = async (publish: boolean) => {
        if (!post) return;
        if (!formData.title.trim()) {
            toast.error('Vui lòng nhập tiêu đề');
            return;
        }

        setSaving(true);
        try {
            await updatePost(post.id, {
                title: formData.title.trim(),
                slug: formData.slug,
                excerpt: formData.excerpt || undefined,
                content: formData.content || undefined,
                cover_image: formData.cover_image || undefined,
                category: formData.category || undefined,
                tags: formData.tags,
                is_published: publish,
            });

            toast.success(publish ? 'Đã xuất bản bài viết' : 'Đã lưu thay đổi');
            router.push(`/admin/marketing/blog/${post.id}`);
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error(error.message || 'Không thể cập nhật');
        } finally {
            setSaving(false);
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push(`/admin/marketing/blog/${post.id}`)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <FileText size={24} className="text-indigo-600" />
                            Chỉnh Sửa Bài Viết
                        </h2>
                        <p className="text-sm text-slate-500">ID: {post.id}</p>
                    </div>
                </div>
                <button
                    onClick={() => setPreview(!preview)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${preview ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
                        }`}
                >
                    <Eye size={16} /> {preview ? 'Đóng' : 'Xem trước'}
                </button>
            </div>

            {preview ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-8">
                    {formData.cover_image && (
                        <img src={formData.cover_image} alt="" className="w-full h-64 object-cover rounded-xl mb-6" />
                    )}
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">{formData.title}</h1>
                    <p className="text-slate-500 mb-6">{formData.excerpt}</p>
                    <SafeHTML
                        html={formData.content || ''}
                        className="prose max-w-none"
                        fallback="<p>Nội dung...</p>"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Tiêu đề <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Đường dẫn
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400">/blog/</span>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                        className="flex-1 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Mô tả ngắn
                                </label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={e => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                    rows={3}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Nội dung (HTML)
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                    rows={15}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                            <h3 className="font-bold text-slate-900 border-b pb-3">Hành động</h3>
                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={saving}
                                className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 flex justify-center items-center gap-2 disabled:opacity-60"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Lưu nháp
                            </button>
                            <button
                                onClick={() => handleSubmit(true)}
                                disabled={saving}
                                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 disabled:opacity-60"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Eye size={18} />}
                                Xuất bản
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                            <h3 className="font-bold text-slate-900 border-b pb-3">Ảnh bìa</h3>
                            {formData.cover_image ? (
                                <div className="relative">
                                    <img src={formData.cover_image} alt="" className="w-full h-32 object-cover rounded-xl" />
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, cover_image: '' }))}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400">
                                    <ImageIcon size={32} className="mx-auto mb-2" />
                                </div>
                            )}
                            <input
                                type="text"
                                value={formData.cover_image}
                                onChange={e => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
                                placeholder="URL ảnh bìa"
                                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                            <h3 className="font-bold text-slate-900 border-b pb-3">Danh mục</h3>
                            <select
                                value={formData.category}
                                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">Chọn danh mục</option>
                                {BLOG_CATEGORIES.map(cat => (
                                    <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                            <h3 className="font-bold text-slate-900 border-b pb-3">Thẻ</h3>
                            <div className="flex flex-wrap gap-2">
                                {BLOG_TAGS.slice(0, 12).map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => handleTagToggle(tag)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${formData.tags.includes(tag)
                                            ? 'bg-indigo-100 text-indigo-600'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
