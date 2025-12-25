'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Save, Upload, Plus, X, Link as LinkIcon, Code, Layers, Tag, Globe, Zap,
    Image as ImageIcon, Loader2, CheckCircle, ArrowLeft, Package, DollarSign, File, History
} from 'lucide-react';
import Image from 'next/image';
import { createProduct, updateProduct, getProductById, type ProductPayload } from '@/lib/products';
import { fetchCategories, type DbCategory } from '@/lib/categories';
import { useToast } from '@/context/ToastContext';
import { uploadImage } from '@/lib/imageUpload';
import { uploadNewVersion } from '@/lib/productFiles';
import ProductVersionManager from '@/components/seller/ProductVersionManager';

type ProductFormat = 'Theme' | 'Template' | 'Landing' | 'MiniApp' | 'Bundle' | 'Course' | 'Ebook';

interface SellerProductFormProps {
    sellerId: number;
    productId?: number; // If provided, edit mode
    onSuccess: () => void;
    onCancel: () => void;
}

interface ProductFormData {
    name: string;
    price: number;
    originalPrice: number;
    description: string;
    category: string;
    format: ProductFormat;
    image: string;
    gallery: string[];
    demoUrl: string;
    tags: string[];
    features: string[];
    techStack: string[];
    version: string;
}

const FORMATS: { value: ProductFormat; label: string; icon: string }[] = [
    { value: 'Template', label: 'Template', icon: '📄' },
    { value: 'Theme', label: 'Theme', icon: '🎨' },
    { value: 'Landing', label: 'Landing Page', icon: '🚀' },
    { value: 'MiniApp', label: 'Mini App', icon: '📱' },
    { value: 'Bundle', label: 'Bundle', icon: '📦' },
    { value: 'Course', label: 'Course', icon: '🎓' },
    { value: 'Ebook', label: 'Ebook', icon: '📚' },
];

export default function SellerProductForm({ sellerId, productId, onSuccess, onCancel }: SellerProductFormProps) {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(!!productId);
    const [uploadingProductFile, setUploadingProductFile] = useState(false);
    const [categories, setCategories] = useState<DbCategory[]>([]);
    const [newTag, setNewTag] = useState('');
    const [newFeature, setNewFeature] = useState('');
    const [newTech, setNewTech] = useState('');
    const productFileInputRef = useRef<HTMLInputElement>(null);

    // Product file state (for new products)
    const [productFile, setProductFile] = useState<{
        url: string;
        size: number;
        name: string;
    } | null>(null);

    const isEditMode = !!productId;

    const [product, setProduct] = useState<ProductFormData>({
        name: '',
        price: 0,
        originalPrice: 0,
        description: '',
        category: '',
        format: 'Template',
        image: '',
        gallery: [],
        demoUrl: '',
        tags: [],
        features: [],
        techStack: [],
        version: '1.0.0',
    });

    useEffect(() => {
        const loadCategories = async () => {
            const cats = await fetchCategories();
            setCategories(cats);
        };
        loadCategories();
    }, []);

    // Load existing product for edit mode
    useEffect(() => {
        const loadProduct = async () => {
            if (!productId) return;
            setLoadingProduct(true);
            try {
                const existingProduct = await getProductById(productId);
                if (existingProduct) {
                    setProduct({
                        name: existingProduct.name || '',
                        price: Number(existingProduct.price) || 0,
                        originalPrice: existingProduct.original_price ? Number(existingProduct.original_price) : 0,
                        description: existingProduct.description || '',
                        category: existingProduct.category_id ? String(existingProduct.category_id) : '',
                        format: (existingProduct.format as ProductFormat) || 'Template',
                        image: existingProduct.image || '',
                        gallery: existingProduct.images || [],
                        demoUrl: existingProduct.demo_url || '',
                        tags: existingProduct.tags || [],
                        features: existingProduct.features || [],
                        techStack: existingProduct.tech_stack || [],
                        version: '1.0.0',
                    });
                }
            } catch (error) {
                console.error('Error loading product:', error);
                addToast('Lỗi tải thông tin sản phẩm', 'error');
            } finally {
                setLoadingProduct(false);
            }
        };
        loadProduct();
    }, [productId, addToast]);

    // Handle image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadImage(file, 'products');
            if (url) {
                setProduct({ ...product, image: url });
                addToast('Đã upload ảnh thành công!', 'success');
            }
        } catch (error) {
            addToast('Lỗi upload ảnh', 'error');
        } finally {
            setUploading(false);
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

    // Handle save
    const handleSave = async () => {
        if (!product.name.trim()) {
            addToast('Vui lòng nhập tên sản phẩm', 'error');
            return;
        }
        if (product.price <= 0) {
            addToast('Vui lòng nhập giá bán hợp lệ', 'error');
            return;
        }
        if (!product.image) {
            addToast('Vui lòng upload ảnh sản phẩm', 'error');
            return;
        }

        setLoading(true);
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
                seller_id: sellerId,
                author: 'Seller',
                is_new: !isEditMode,
                is_featured: false,
                status: 'pending', // Both new and edited products go through approval
                demo_url: product.demoUrl || null,
                tags: product.tags,
                features: product.features,
                tech_stack: product.techStack,
            };

            if (isEditMode && productId) {
                await updateProduct(productId, payload);
                addToast('Sản phẩm đã được cập nhật!', 'success');
            } else {
                const newProduct = await createProduct(payload);

                // If product file was uploaded, create the first version
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

                addToast('Sản phẩm đã được gửi để xét duyệt!', 'success');
            }
            onSuccess();
        } catch (error: any) {
            console.error('Error saving product:', error);
            addToast(error.message || 'Có lỗi xảy ra', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Tag handlers
    const handleAddTag = () => {
        if (newTag.trim() && !product.tags.includes(newTag.trim())) {
            setProduct({ ...product, tags: [...product.tags, newTag.trim()] });
            setNewTag('');
        }
    };

    const handleAddFeature = () => {
        if (newFeature.trim() && !product.features.includes(newFeature.trim())) {
            setProduct({ ...product, features: [...product.features, newFeature.trim()] });
            setNewFeature('');
        }
    };

    const handleAddTech = () => {
        if (newTech.trim() && !product.techStack.includes(newTech.trim())) {
            setProduct({ ...product, techStack: [...product.techStack, newTech.trim()] });
            setNewTech('');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            <Package className="text-orange-600" size={24} /> Đăng Sản Phẩm Mới
                        </h1>
                        <p className="text-slate-500 text-sm">Điền thông tin sản phẩm của bạn</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-200 disabled:opacity-60"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Gửi Xét Duyệt
                </button>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Basic Info */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Layers size={18} className="text-blue-600" /> Thông Tin Cơ Bản
                        </h3>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tên sản phẩm *</label>
                            <input
                                type="text"
                                value={product.name}
                                onChange={e => setProduct({ ...product, name: e.target.value })}
                                placeholder="VD: Dashboard Pro React Template"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả sản phẩm</label>
                            <textarea
                                value={product.description}
                                onChange={e => setProduct({ ...product, description: e.target.value })}
                                placeholder="Mô tả chi tiết về sản phẩm của bạn..."
                                rows={4}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                            />
                        </div>

                        {/* Demo URL */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <Globe size={14} /> Link Demo
                            </label>
                            <input
                                type="url"
                                value={product.demoUrl}
                                onChange={e => setProduct({ ...product, demoUrl: e.target.value })}
                                placeholder="https://demo.example.com"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Features & Tech Stack */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Zap size={18} className="text-purple-600" /> Tính Năng & Tech Stack
                        </h3>

                        {/* Features */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tính năng nổi bật</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newFeature}
                                    onChange={e => setNewFeature(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                                    placeholder="VD: Responsive Design"
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <button onClick={handleAddFeature} className="px-3 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200">
                                    <Plus size={16} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {product.features.map((f, i) => (
                                    <span key={i} className="flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">
                                        {f}
                                        <button onClick={() => setProduct({ ...product, features: product.features.filter(x => x !== f) })}>
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Tech Stack */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <Code size={14} /> Tech Stack
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newTech}
                                    onChange={e => setNewTech(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                                    placeholder="VD: React, Tailwind CSS"
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <button onClick={handleAddTech} className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                                    <Plus size={16} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {product.techStack.map((t, i) => (
                                    <span key={i} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                                        {t}
                                        <button onClick={() => setProduct({ ...product, techStack: product.techStack.filter(x => x !== t) })}>
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <Tag size={14} /> Tags
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={e => setNewTag(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    placeholder="VD: dashboard, admin"
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <button onClick={handleAddTag} className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
                                    <Plus size={16} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {product.tags.map((t, i) => (
                                    <span key={i} className="flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
                                        #{t}
                                        <button onClick={() => setProduct({ ...product, tags: product.tags.filter(x => x !== t) })}>
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product File Upload */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                            <File size={18} className="text-green-600" />
                            {isEditMode ? 'Quản lý phiên bản' : 'File Sản Phẩm'}
                        </h3>

                        {isEditMode && productId ? (
                            <ProductVersionManager
                                productId={productId}
                                productName={product.name || 'Sản phẩm'}
                            />
                        ) : (
                            <>
                                <p className="text-sm text-slate-500 mb-4">
                                    Upload file sản phẩm (ZIP, RAR, 7Z, PDF). File này sẽ được gắn với version {product.version || '1.0.0'}
                                </p>

                                <input
                                    ref={productFileInputRef}
                                    type="file"
                                    accept=".zip,.rar,.7z,.pdf,.tar,.gz"
                                    onChange={handleProductFileUpload}
                                    className="hidden"
                                />

                                {/* Version field */}
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Version</label>
                                    <input
                                        type="text"
                                        value={product.version}
                                        onChange={e => setProduct({ ...product, version: e.target.value })}
                                        placeholder="1.0.0"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>

                                {productFile ? (
                                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                                <File size={24} className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-green-800">{productFile.name}</p>
                                                <p className="text-sm text-green-600">
                                                    {(productFile.size / (1024 * 1024)).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setProductFile(null)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => productFileInputRef.current?.click()}
                                        disabled={uploadingProductFile}
                                        className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 hover:border-green-400 transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        {uploadingProductFile ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 size={32} className="animate-spin text-green-600" />
                                                <span className="text-slate-600 font-medium">Đang upload...</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <Upload size={32} className="text-slate-400" />
                                                <div>
                                                    <p className="text-slate-700 font-bold">Click để chọn file</p>
                                                    <p className="text-sm text-slate-500">ZIP, RAR, 7Z, PDF • Tối đa 500MB</p>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Right Column - Pricing & Media */}
                <div className="space-y-5">
                    {/* Cover Image */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                            <ImageIcon size={18} className="text-green-600" /> Ảnh Sản Phẩm *
                        </h3>
                        <div className="relative">
                            {product.image ? (
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100">
                                    <Image src={product.image} alt="Cover" fill className="object-cover" />
                                    <button
                                        onClick={() => setProduct({ ...product, image: '' })}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label className="block border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-orange-300 transition-colors">
                                    {uploading ? (
                                        <Loader2 size={32} className="mx-auto text-orange-600 animate-spin" />
                                    ) : (
                                        <>
                                            <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                                            <p className="text-sm font-bold text-slate-600">Click để upload</p>
                                            <p className="text-xs text-slate-400">PNG, JPG tối đa 5MB</p>
                                        </>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                            <DollarSign size={18} className="text-emerald-600" /> Giá Bán
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Giá bán (VNĐ) *</label>
                                <input
                                    type="number"
                                    value={product.price || ''}
                                    onChange={e => setProduct({ ...product, price: Number(e.target.value) })}
                                    placeholder="VD: 599000"
                                    min={0}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Giá gốc (không bắt buộc)</label>
                                <input
                                    type="number"
                                    value={product.originalPrice || ''}
                                    onChange={e => setProduct({ ...product, originalPrice: Number(e.target.value) })}
                                    placeholder="VD: 899000"
                                    min={0}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-slate-500"
                                />
                                <p className="text-xs text-slate-400 mt-1">Giá gốc để hiển thị % giảm giá</p>
                            </div>
                        </div>
                    </div>

                    {/* Category & Format */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                            <Layers size={18} className="text-indigo-600" /> Phân Loại
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Danh mục</label>
                                <select
                                    value={product.category}
                                    onChange={e => setProduct({ ...product, category: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">Chọn danh mục</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Định dạng</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {FORMATS.map(fmt => (
                                        <button
                                            key={fmt.value}
                                            type="button"
                                            onClick={() => setProduct({ ...product, format: fmt.value })}
                                            className={`p-3 rounded-xl border text-sm font-bold transition-all ${product.format === fmt.value
                                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <span className="mr-1">{fmt.icon}</span> {fmt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                        <p className="font-bold mb-1 flex items-center gap-1">
                            <CheckCircle size={14} /> Lưu ý
                        </p>
                        <p>Sản phẩm sẽ được Admin xét duyệt trong 24-48 giờ trước khi hiển thị trên store.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
