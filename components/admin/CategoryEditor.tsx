'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Save,
    Upload,
    ArrowLeft,
    FolderTree,
    Loader2,
    Eye,
    EyeOff,
    Trash2,
    Image as ImageIcon,
    Link as LinkIcon,
    Hash,
    AlignLeft,
    Layers,
} from 'lucide-react';
import {
    getCategoryById,
    createCategory,
    updateCategory,
    fetchCategories,
    type DbCategory,
    type CategoryPayload,
} from '@/lib/categories';
import { useToast } from '@/context/ToastContext';

interface CategoryEditorProps {
    mode: 'create' | 'edit';
    categoryId?: string;
}

const CategoryEditor: React.FC<CategoryEditorProps> = ({ mode, categoryId }) => {
    const router = useRouter();
    const toast = useToast();
    const isEditMode = mode === 'edit';

    // Form states
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('');
    const [parentId, setParentId] = useState<number | null>(null);
    const [sortOrder, setSortOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);

    // UI states
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [categories, setCategories] = useState<DbCategory[]>([]);
    const [originalCategory, setOriginalCategory] = useState<DbCategory | null>(null);

    // Load category data if editing
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Load all categories for parent dropdown
                const cats = await fetchCategories();
                setCategories(cats.filter(c => c.id !== Number(categoryId))); // Exclude self

                // Load category if editing
                if (isEditMode && categoryId) {
                    const cat = await getCategoryById(Number(categoryId));
                    if (cat) {
                        setOriginalCategory(cat);
                        setName(cat.name);
                        setSlug(cat.slug);
                        setDescription(cat.description || '');
                        setIcon(cat.icon || '');
                        setParentId(cat.parent_id);
                        setSortOrder(cat.sort_order);
                        setIsActive(cat.is_active);
                    } else {
                        toast.error('Không tìm thấy danh mục');
                        router.push('/admin/products/categories');
                    }
                }
            } catch (error) {
                console.error('Load error:', error);
                toast.error('Không thể tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isEditMode, categoryId, router, toast]);

    // Generate slug from name
    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    };

    const handleNameChange = (value: string) => {
        setName(value);
        // Auto-generate slug if creating new or slug hasn't been manually edited
        if (!isEditMode || slug === generateSlug(originalCategory?.name || '')) {
            setSlug(generateSlug(value));
        }
    };

    // Handle image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload/category-icon', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setIcon(data.url);
            toast.success('Tải ảnh thành công!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Không thể tải ảnh lên');
        } finally {
            setUploadingImage(false);
        }
    };

    // Save category
    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Vui lòng nhập tên danh mục');
            return;
        }

        setSaving(true);
        try {
            const payload: CategoryPayload = {
                name: name.trim(),
                slug: slug.trim() || undefined,
                description: description.trim() || null,
                icon: icon || null,
                parent_id: parentId,
                sort_order: sortOrder,
                is_active: isActive,
            };

            if (isEditMode && categoryId) {
                await updateCategory(Number(categoryId), payload);
                toast.success('Cập nhật danh mục thành công!');
            } else {
                await createCategory(payload);
                toast.success('Tạo danh mục thành công!');
            }

            router.push('/admin/products/categories');
        } catch (error: any) {
            console.error('Save error:', error);
            toast.error(error.message || 'Không thể lưu danh mục');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/admin/products/categories')}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <FolderTree size={24} className="text-indigo-600" />
                            {isEditMode ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
                        </h2>
                        <p className="text-sm text-slate-500">
                            {isEditMode
                                ? `Đang chỉnh sửa: ${originalCategory?.name || ''}`
                                : 'Điền thông tin để tạo danh mục mới'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push('/admin/products/categories')}
                        className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !name.trim()}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        {isEditMode ? 'Cập Nhật' : 'Tạo Danh Mục'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <AlignLeft size={18} className="text-indigo-600" />
                                Thông Tin Cơ Bản
                            </h3>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Tên Danh Mục <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => handleNameChange(e.target.value)}
                                    placeholder="VD: Themes & UI Kits"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    <span className="flex items-center gap-1.5">
                                        <Hash size={14} />
                                        Slug (URL)
                                    </span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-400">/category/</span>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                        placeholder="themes-ui-kits"
                                        className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-1.5">
                                    Tự động tạo từ tên. Chỉ dùng chữ thường, số và dấu gạch ngang.
                                </p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Mô Tả
                                </label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Mô tả ngắn về danh mục này..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all"
                                />
                            </div>

                            {/* Parent Category */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    <span className="flex items-center gap-1.5">
                                        <Layers size={14} />
                                        Danh Mục Cha
                                    </span>
                                </label>
                                <select
                                    value={parentId || ''}
                                    onChange={e => setParentId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition-all"
                                >
                                    <option value="">Không có (Danh mục gốc)</option>
                                    {categories.filter(c => !c.parent_id).map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-400 mt-1.5">
                                    Chọn danh mục cha nếu đây là danh mục con.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Settings */}
                <div className="space-y-6">
                    {/* Image Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <ImageIcon size={18} className="text-indigo-600" />
                                Ảnh Đại Diện
                            </h3>
                        </div>

                        <div className="p-6">
                            {icon ? (
                                <div className="relative aspect-video rounded-xl overflow-hidden group mb-4">
                                    <img
                                        src={icon}
                                        alt="Category"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setIcon('')}
                                            className="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors"
                                        >
                                            Xóa ảnh
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="aspect-video border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-all mb-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={uploadingImage}
                                    />
                                    <div className="text-center">
                                        {uploadingImage ? (
                                            <Loader2 size={32} className="mx-auto text-indigo-600 animate-spin mb-2" />
                                        ) : (
                                            <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                                        )}
                                        <span className="text-sm text-slate-500 block">
                                            {uploadingImage ? 'Đang tải...' : 'Click để tải ảnh'}
                                        </span>
                                        <span className="text-xs text-slate-400">PNG, JPG (tối đa 5MB)</span>
                                    </div>
                                </label>
                            )}

                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                    Hoặc nhập URL ảnh
                                </label>
                                <div className="flex items-center gap-2">
                                    <LinkIcon size={16} className="text-slate-400" />
                                    <input
                                        type="text"
                                        value={icon}
                                        onChange={e => setIcon(e.target.value)}
                                        placeholder="https://..."
                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Settings Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-semibold text-slate-900">Cài Đặt</h3>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Sort Order */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Thứ Tự Sắp Xếp
                                </label>
                                <input
                                    type="number"
                                    value={sortOrder}
                                    onChange={e => setSortOrder(Number(e.target.value))}
                                    min={0}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <p className="text-xs text-slate-400 mt-1.5">
                                    Số nhỏ hơn sẽ hiển thị trước.
                                </p>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    {isActive ? (
                                        <Eye size={20} className="text-emerald-600" />
                                    ) : (
                                        <EyeOff size={20} className="text-slate-400" />
                                    )}
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">
                                            {isActive ? 'Đang hiển thị' : 'Đang ẩn'}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {isActive ? 'Danh mục hiện trên website' : 'Danh mục bị ẩn'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsActive(!isActive)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-slate-300'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isActive ? 'left-7' : 'left-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Delete Button (Edit Mode Only) */}
                    {isEditMode && (
                        <button
                            onClick={() => {
                                if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
                                    // TODO: Implement delete
                                    router.push('/admin/products/categories');
                                }
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-rose-200 text-rose-600 rounded-xl text-sm font-semibold hover:bg-rose-50 hover:border-rose-300 transition-colors"
                        >
                            <Trash2 size={18} />
                            Xóa Danh Mục
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryEditor;
