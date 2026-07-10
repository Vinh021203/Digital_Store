'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileText,
    ArrowLeft,
    Save,
    Loader2,
    Image as ImageIcon,
    Eye,
    Upload,
    X,
} from 'lucide-react';
import { createPost } from '@/lib/blog';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useToast } from '@/context/ToastContext';
import SafeHTML from '@/components/ui/SafeHTML';
import RichTextEditor from '@/components/admin/RichTextEditor';
import BlogTaxonomyFields from '@/components/blog/BlogTaxonomyFields';

export default function NewBlogPage() {
    const router = useRouter();
    const { user } = useSupabaseAuth();
    const toast = useToast();
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [saving, setSaving] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
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

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    };

    const handleTitleChange = (title: string) => {
        setFormData(prev => ({
            ...prev,
            title,
            slug: prev.slug || generateSlug(title),
        }));
    };

    const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingCover(true);
        try {
            const uploadData = new FormData();
            uploadData.append('file', file);

            const response = await fetch('/api/upload/blog-cover', {
                method: 'POST',
                body: uploadData,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Không thể tải ảnh bìa');

            setFormData(prev => ({ ...prev, cover_image: data.url }));
            toast.success('Đã tải ảnh bìa lên Cloudinary');
        } catch (error: any) {
            console.error('Cover upload error:', error);
            toast.error(error.message || 'Không thể tải ảnh bìa');
        } finally {
            setUploadingCover(false);
            if (coverInputRef.current) coverInputRef.current.value = '';
        }
    };

    const handleSubmit = async (publish: boolean) => {
        if (!formData.title.trim()) {
            toast.error('Vui lòng nhập tiêu đề');
            return;
        }
        if (!user) {
            toast.error('Vui lòng đăng nhập');
            return;
        }

        setSaving(true);
        try {
            await createPost({
                title: formData.title.trim(),
                slug: formData.slug || generateSlug(formData.title),
                excerpt: formData.excerpt || undefined,
                content: formData.content || undefined,
                cover_image: formData.cover_image || undefined,
                author_id: user.id,
                category: formData.category || undefined,
                tags: formData.tags,
                is_published: publish,
            });

            toast.success(publish ? 'Đã xuất bản bài viết' : 'Đã lưu bản nháp');
            router.push('/admin/marketing/blog');
        } catch (error: any) {
            console.error('Create error:', error);
            toast.error(error.message || 'Không thể tạo bài viết');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/admin/marketing/blog')}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <FileText size={24} className="text-indigo-600" />
                            Tạo Bài Viết Mới
                        </h2>
                        <p className="text-sm text-slate-500">Viết và xuất bản bài blog</p>
                    </div>
                </div>
                <button
                    onClick={() => setPreview(!preview)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${preview ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
                        }`}
                >
                    <Eye size={16} /> {preview ? 'Đóng xem trước' : 'Xem trước'}
                </button>
            </div>

            {preview ? (
                /* Preview Mode */
                <div className="bg-white rounded-2xl border border-slate-100 p-8">
                    <button
                        onClick={() => setPreview(false)}
                        className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                    {formData.cover_image && (
                        <img src={formData.cover_image} alt="" className="w-full h-64 object-cover rounded-xl mb-6" />
                    )}
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">{formData.title || 'Tiêu đề bài viết'}</h1>
                    <p className="text-slate-500 mb-6">{formData.excerpt || 'Mô tả ngắn...'}</p>
                    <SafeHTML
                        html={formData.content || ''}
                        className="blog-rich-content max-w-none"
                        fallback="<p>Nội dung bài viết...</p>"
                    />
                </div>
            ) : (
                /* Edit Mode */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Tiêu đề <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => handleTitleChange(e.target.value)}
                                    placeholder="Nhập tiêu đề bài viết..."
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Đường dẫn (slug)
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400">/blog/</span>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                        placeholder="duong-dan-bai-viet"
                                        className="flex-1 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                                    />
                                </div>
                            </div>

                            {/* Excerpt */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Mô tả ngắn
                                </label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={e => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                    placeholder="Viết mô tả ngắn cho bài viết..."
                                    rows={3}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Nội dung
                                </label>
                                <RichTextEditor
                                    value={formData.content}
                                    onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                                    placeholder="Viết nội dung bài viết..."
                                    minHeight={350}
                                    uploadType="blog-cover"
                                    imageAlt={formData.title || 'Ảnh minh họa bài viết'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Actions */}
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

                        {/* Cover Image */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                            <h3 className="font-bold text-slate-900 border-b pb-3">Ảnh bìa</h3>
                            <input
                                ref={coverInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleCoverUpload}
                                className="hidden"
                            />
                            {formData.cover_image ? (
	                                <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
	                                    <img src={formData.cover_image} alt="" className="h-full w-full object-contain" />
	                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, cover_image: '' }))}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
	                                <div className="flex aspect-video flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-slate-400">
                                    <ImageIcon size={32} className="mx-auto mb-2" />
                                    <p className="text-sm">Nhập URL ảnh bìa</p>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => coverInputRef.current?.click()}
                                disabled={uploadingCover}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-600 transition hover:bg-orange-100 disabled:opacity-60"
                            >
                                {uploadingCover ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                {uploadingCover ? 'Đang tải lên...' : 'Tải ảnh lên Cloudinary'}
                            </button>
                            <input
                                type="text"
                                value={formData.cover_image}
                                onChange={e => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
                                placeholder="https://example.com/image.jpg"
                                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <BlogTaxonomyFields
                            category={formData.category}
                            tags={formData.tags}
                            onCategoryChange={category => setFormData(prev => ({ ...prev, category }))}
                            onTagsChange={tags => setFormData(prev => ({ ...prev, tags }))}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
