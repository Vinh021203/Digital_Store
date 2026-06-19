'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    Save, Upload, Plus, X, Link as LinkIcon, Code, Layers, Tag,
    Zap, Image as ImageIcon, Loader2, ArrowLeft, File, Home,
    ChevronRight, Sparkles, Package, DollarSign, Info
} from 'lucide-react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useToast } from '@/context/ToastContext';
import { fetchCategories, type DbCategory } from '@/lib/categories';
import { getSellerByUserId, type DbSeller } from '@/lib/sellers';
import { createProduct, type ProductPayload } from '@/lib/products';
import { uploadNewVersion } from '@/lib/productFiles';

type ProductFormat = 'Theme' | 'Template' | 'Landing' | 'MiniApp' | 'Bundle';

interface SellerProduct {
    name: string;
    price: number;
    originalPrice: number;
    description: string;
    category: string;
    format: ProductFormat;
    image: string;
    gallery: string[];
    demoUrl: string;
    fileFormat: string;
    compatibility: string;
    version: string;
    tags: string[];
    features: string[];
    techStack: string[];
}

export default function NewProductPage() {
    const router = useRouter();
    const { user } = useSupabaseAuth();
    const { addToast } = useToast();

    const [seller, setSeller] = useState<DbSeller | null>(null);
    const [categories, setCategories] = useState<DbCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);
    const [uploadingProductFile, setUploadingProductFile] = useState(false);

    const coverInputRef = React.useRef<HTMLInputElement>(null);
    const galleryInputRef = React.useRef<HTMLInputElement>(null);
    const productFileInputRef = React.useRef<HTMLInputElement>(null);

    const [productFile, setProductFile] = useState<{
        url: string;
        size: number;
        name: string;
    } | null>(null);

    const [product, setProduct] = useState<SellerProduct>({
        name: '',
        price: 0,
        originalPrice: 0,
        description: '',
        category: '',
        format: 'Theme',
        image: '',
        gallery: [],
        demoUrl: '',
        fileFormat: '',
        compatibility: '',
        version: '1.0.0',
        tags: [],
        features: [],
        techStack: [],
    });

    const [newTag, setNewTag] = useState('');
    const [newFeature, setNewFeature] = useState('');
    const [newTech, setNewTech] = useState('');

    // Load data
    const loadData = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const [cats, sellerData] = await Promise.all([
                fetchCategories(),
                getSellerByUserId(user.id)
            ]);
            setCategories(cats);
            setSeller(sellerData);

            if (!sellerData) {
                addToast('Bạn cần đăng ký seller để thêm sản phẩm', 'error');
                router.push('/profile/marketplace');
            }
        } catch (error) {
            console.error('Load error:', error);
            addToast('Không thể tải dữ liệu', 'error');
        } finally {
            setLoading(false);
        }
    }, [user?.id, router, addToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Handle cover image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload/product-image', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setProduct(prev => ({ ...prev, image: data.url }));
            addToast('Tải ảnh bìa thành công!', 'success');
        } catch (error) {
            console.error('Upload error:', error);
            addToast('Không thể tải ảnh lên', 'error');
        } finally {
            setUploadingImage(false);
            if (coverInputRef.current) coverInputRef.current.value = '';
        }
    };

    // Handle gallery images upload
    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploadingGallery(true);
        try {
            const formData = new FormData();
            Array.from(files).forEach(file => {
                formData.append('files', file);
            });

            const res = await fetch('/api/upload/product-gallery', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setProduct(prev => ({ ...prev, gallery: [...prev.gallery, ...data.urls] }));
            addToast(`Đã tải ${data.urls.length} ảnh thành công!`, 'success');
        } catch (error) {
            console.error('Gallery upload error:', error);
            addToast('Không thể tải ảnh lên', 'error');
        } finally {
            setUploadingGallery(false);
            if (galleryInputRef.current) galleryInputRef.current.value = '';
        }
    };

    // Handle product file upload
    const handleProductFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedExtensions = ['.zip', '.rar', '.7z', '.pdf', '.tar', '.gz'];
        const hasValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

        if (!hasValidExtension) {
            addToast('Chỉ hỗ trợ file: ZIP, RAR, 7Z, PDF', 'error');
            return;
        }

        if (file.size > 500 * 1024 * 1024) {
            addToast('File quá lớn! Tối đa 500MB', 'error');
            return;
        }

        setUploadingProductFile(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload/product-file', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setProductFile({
                url: data.url,
                size: file.size,
                name: file.name,
            });
            addToast(`Đã upload: ${file.name}`, 'success');
        } catch (error: any) {
            console.error('Product file upload error:', error);
            addToast(error.message || 'Không thể tải file lên', 'error');
        } finally {
            setUploadingProductFile(false);
            if (productFileInputRef.current) productFileInputRef.current.value = '';
        }
    };

    // Save product
    const handleSave = async () => {
        if (!seller) {
            addToast('Bạn cần đăng ký seller để thêm sản phẩm', 'error');
            return;
        }
        if (!product.name.trim()) {
            addToast('Vui lòng nhập tên sản phẩm', 'error');
            return;
        }
        if (!product.price || product.price <= 0) {
            addToast('Vui lòng nhập giá hợp lệ', 'error');
            return;
        }
        if (!product.image) {
            addToast('Vui lòng thêm ảnh sản phẩm', 'error');
            return;
        }
        if (!productFile) {
            addToast('Vui lòng upload file sản phẩm', 'error');
            return;
        }

        setSaving(true);
        try {
            const payload: ProductPayload = {
                name: product.name.trim(),
                description: product.description || null,
                price: product.price,
                original_price: product.originalPrice || null,
                image: product.image,
                images: product.gallery,
                format: product.format,
                category_id: product.category ? Number(product.category) : null,
                author: seller.store_name,
                is_new: true,
                is_featured: false,
                status: 'pending',
                demo_url: product.demoUrl || null,
                file_format: product.fileFormat || null,
                compatibility: product.compatibility || null,
                tags: product.tags,
                features: product.features,
                tech_stack: product.techStack,
                seller_id: seller.id,
            };

            const newProduct = await createProduct(payload);

            if (productFile && newProduct?.id) {
                try {
                    await uploadNewVersion({
                        product_id: newProduct.id,
                        version: product.version || '1.0.0',
                        file_url: productFile.url,
                        file_size: productFile.size,
                        changelog: 'Initial release',
                        is_current: true,
                    });
                } catch (fileError) {
                    console.error('Error creating product file:', fileError);
                }
            }

            addToast('Đã gửi sản phẩm để duyệt!', 'success');
            router.push('/profile/marketplace');
        } catch (error: any) {
            console.error('Save error:', error);
            addToast(error.message || 'Không thể lưu sản phẩm', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Tag handlers
    const handleAddTag = () => {
        if (newTag.trim() && !product.tags.includes(newTag.trim())) {
            setProduct({ ...product, tags: [...product.tags, newTag.trim()] });
            setNewTag('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setProduct({ ...product, tags: product.tags.filter(t => t !== tag) });
    };

    // Feature handlers
    const handleAddFeature = () => {
        if (newFeature.trim() && !product.features.includes(newFeature.trim())) {
            setProduct({ ...product, features: [...product.features, newFeature.trim()] });
            setNewFeature('');
        }
    };

    const handleRemoveFeature = (feature: string) => {
        setProduct({ ...product, features: product.features.filter(f => f !== feature) });
    };

    // Tech handlers
    const handleAddTech = () => {
        if (newTech.trim() && !product.techStack.includes(newTech.trim())) {
            setProduct({ ...product, techStack: [...product.techStack, newTech.trim()] });
            setNewTech('');
        }
    };

    const handleRemoveTech = (tech: string) => {
        setProduct({ ...product, techStack: product.techStack.filter(t => t !== tech) });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Đang tải...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Dark Premium Header */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
                </div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                        <Link href="/" className="hover:text-white transition-colors"><Home size={14} /></Link>
                        <ChevronRight size={14} />
                        <Link href="/profile" className="hover:text-white transition-colors">Profile</Link>
                        <ChevronRight size={14} />
                        <Link href="/profile/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
                        <ChevronRight size={14} />
                        <span className="text-white font-medium">Thêm sản phẩm</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <Package size={28} className="text-white" />
                            </div>
                            <div>
                                <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-bold mb-2 inline-block">
                                    <Sparkles size={10} className="inline mr-1" /> New Product
                                </span>
                                <h1 className="text-2xl md:text-3xl font-black">Thêm sản phẩm mới</h1>
                                <p className="text-slate-400 text-sm">Điền đầy đủ thông tin sản phẩm</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link href="/profile/marketplace" className="flex items-center gap-2 bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-white/20 transition-all">
                                <ArrowLeft size={16} />
                                Hủy
                            </Link>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Gửi duyệt
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-bold text-blue-900">Lưu ý khi thêm sản phẩm</p>
                    <p className="text-sm text-blue-700 mt-1">
                        Sản phẩm của bạn sẽ được đội ngũ Shop Web rẻ xét duyệt trong vòng 24-48h. Đảm bảo điền đầy đủ thông tin và upload file sản phẩm chất lượng.
                    </p>
                </div>
            </div>

            {/* Two Column Layout - Equal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Title & Price */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                            <Package size={20} className="text-emerald-600" />
                            Thông tin cơ bản
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Tên sản phẩm <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={product.name}
                                    onChange={e => setProduct({ ...product, name: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                    placeholder="Nhập tên sản phẩm..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Giá bán (₫) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            value={product.price || ''}
                                            onChange={e => setProduct({ ...product, price: Number(e.target.value) })}
                                            className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                            placeholder="299000"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Giá gốc (₫)</label>
                                    <input
                                        type="number"
                                        value={product.originalPrice || ''}
                                        onChange={e => setProduct({ ...product, originalPrice: Number(e.target.value) })}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                        placeholder="499000"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Danh mục</label>
                                    <select
                                        value={product.category}
                                        onChange={e => setProduct({ ...product, category: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Loại sản phẩm</label>
                                    <select
                                        value={product.format}
                                        onChange={e => setProduct({ ...product, format: e.target.value as ProductFormat })}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                    >
                                        <option value="Theme">Theme</option>
                                        <option value="Template">Template</option>
                                        <option value="Landing">Landing Page</option>
                                        <option value="MiniApp">Mini App</option>
                                        <option value="Bundle">Bundle</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả chi tiết</label>
                        <textarea
                            rows={4}
                            value={product.description}
                            onChange={e => setProduct({ ...product, description: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl p-4 outline-none resize-y text-sm focus:ring-2 focus:ring-emerald-500"
                            placeholder="Viết mô tả hấp dẫn cho sản phẩm..."
                        />
                    </div>

                    {/* Technical Info */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                            <Code size={20} className="text-orange-600" />
                            Thông tin kỹ thuật
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Demo URL</label>
                                <input
                                    type="url"
                                    value={product.demoUrl}
                                    onChange={e => setProduct({ ...product, demoUrl: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="https://demo.example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">File Format</label>
                                <input
                                    type="text"
                                    value={product.fileFormat}
                                    onChange={e => setProduct({ ...product, fileFormat: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="React, Vue, Figma..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Compatibility</label>
                                <input
                                    type="text"
                                    value={product.compatibility}
                                    onChange={e => setProduct({ ...product, compatibility: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="React 18+, Node 16+..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Version</label>
                                <input
                                    type="text"
                                    value={product.version}
                                    onChange={e => setProduct({ ...product, version: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="1.0.0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product File Upload */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg text-slate-900 mb-3 flex items-center gap-2">
                            <File size={20} className="text-green-600" />
                            File sản phẩm <span className="text-red-500">*</span>
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Upload file (ZIP, RAR, 7Z, PDF) - Version {product.version || '1.0.0'}
                        </p>

                        <input
                            ref={productFileInputRef}
                            type="file"
                            accept=".zip,.rar,.7z,.pdf,.tar,.gz"
                            onChange={handleProductFileUpload}
                            className="hidden"
                        />

                        {productFile ? (
                            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <File size={20} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-green-800 text-sm">{productFile.name}</p>
                                        <p className="text-xs text-green-600">{(productFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setProductFile(null)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => productFileInputRef.current?.click()}
                                disabled={uploadingProductFile}
                                className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 hover:border-emerald-400 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {uploadingProductFile ? (
                                    <Loader2 size={32} className="animate-spin text-emerald-600 mx-auto" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <Upload size={32} className="text-slate-400" />
                                        <p className="text-slate-700 font-bold text-sm">Click để chọn file</p>
                                        <p className="text-xs text-slate-500">ZIP, RAR, 7Z, PDF • Tối đa 500MB</p>
                                    </div>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Cover Image */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-sm text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                            <ImageIcon size={16} className="text-emerald-600" />
                            Ảnh bìa <span className="text-red-500">*</span>
                        </h3>

                        <input ref={coverInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

                        {product.image ? (
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group">
                                <Image src={product.image} alt="Cover" fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button type="button" onClick={() => coverInputRef.current?.click()} className="px-4 py-2 bg-white text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-100">
                                        Đổi ảnh
                                    </button>
                                    <button type="button" onClick={() => setProduct({ ...product, image: '' })} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => coverInputRef.current?.click()}
                                disabled={uploadingImage}
                                className="w-full aspect-video border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50 hover:border-emerald-400 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {uploadingImage ? <Loader2 size={32} className="animate-spin text-emerald-600" /> : (
                                    <>
                                        <Upload size={32} className="text-slate-400" />
                                        <p className="text-slate-700 font-bold text-sm">Tải ảnh bìa</p>
                                        <p className="text-xs text-slate-500">PNG, JPG • Max 5MB</p>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Gallery */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-sm text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                            <ImageIcon size={16} className="text-purple-600" />
                            Thư viện ảnh
                        </h3>

                        <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />

                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {product.gallery.map((img, idx) => (
                                <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group">
                                    <Image src={img} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setProduct({ ...product, gallery: product.gallery.filter((_, i) => i !== idx) })}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            disabled={uploadingGallery}
                            className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 font-medium text-sm hover:bg-slate-50 hover:border-purple-400 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {uploadingGallery ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            Thêm ảnh
                        </button>
                    </div>

                    {/* Tags */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg text-slate-900 mb-3 flex items-center gap-2">
                            <Tag size={18} className="text-purple-600" />
                            Tags
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {product.tags.map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold">
                                    {tag}
                                    <button type="button" onClick={() => handleRemoveTag(tag)} className="text-purple-400 hover:text-purple-700"><X size={12} /></button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={e => setNewTag(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Thêm tag..."
                            />
                            <button type="button" onClick={handleAddTag} className="px-3 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg text-slate-900 mb-3 flex items-center gap-2">
                            <Zap size={18} className="text-amber-600" />
                            Tính năng
                        </h3>
                        <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                            {product.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                                    <span className="text-xs text-amber-800">{feature}</span>
                                    <button type="button" onClick={() => handleRemoveFeature(feature)} className="text-amber-400 hover:text-amber-700"><X size={14} /></button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newFeature}
                                onChange={e => setNewFeature(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                                placeholder="Thêm tính năng..."
                            />
                            <button type="button" onClick={handleAddFeature} className="px-3 py-2 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg text-slate-900 mb-3 flex items-center gap-2">
                            <Layers size={18} className="text-blue-600" />
                            Tech Stack
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {product.techStack.map((tech, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                                    {tech}
                                    <button type="button" onClick={() => handleRemoveTech(tech)} className="text-blue-400 hover:text-blue-700"><X size={12} /></button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTech}
                                onChange={e => setNewTech(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="React, Vue..."
                            />
                            <button type="button" onClick={handleAddTech} className="px-3 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Submit Card */}
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-6 rounded-2xl text-white">
                        <h3 className="font-bold text-lg mb-2">Sẵn sàng gửi duyệt?</h3>
                        <p className="text-emerald-100 text-sm mb-4">
                            Đảm bảo bạn đã điền đầy đủ thông tin và upload file sản phẩm.
                        </p>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-3 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Gửi sản phẩm để duyệt
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
