'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Upload,
  Plus,
  X,
  Link as LinkIcon,
  Code,
  Layers,
  Tag,
  Globe,
  Zap,
  Image as ImageIcon,
  GripVertical,
  Trash2,
  Loader2,
  ArrowLeft,
  History,
  File,
} from 'lucide-react';
import ProductVersionManager from '@/components/admin/ProductVersionManager';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { getCurrentVersion, updateVersion, uploadNewVersion } from '@/lib/productFiles';
import {
  getProductById,
  createProduct,
  updateProduct,
  type DbProduct,
  type ProductPayload,
  type ProductTechnologyVariant,
} from '@/lib/products';
import { fetchCategories, type DbCategory } from '@/lib/categories';
import { fetchProductTypes, type DbProductType } from '@/lib/productTypes';
import { useToast } from '@/context/ToastContext';
import { createActivityLog } from '@/lib/activityLogs';
import { getTechnologyIconUrl } from '@/lib/technologyIcons';

interface ProductEditorProps {
  mode: 'create' | 'edit';
  productId?: string;
}

interface EditorProduct {
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  category: string;
  format: string;
  productTypeId: number | null;
  image: string;
  gallery: string[];
  author: string;
  isActive: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  isNew: boolean;
  // Digital Product Specific
  demoUrl: string;
  fileFormat: string;
  compatibility: string;
  version: string;
  tags: string[];
  features: string[];
  techStack: string[];
  technologyVariants: ProductTechnologyVariant[];
  // Affiliate
  commissionRate: number;
}

const ProductEditor: React.FC<ProductEditorProps> = ({ mode, productId }) => {
  const router = useRouter();
  const toast = useToast();
  const isEditMode = mode === 'edit';

  // Data states
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [productTypes, setProductTypes] = useState<DbProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingProductFile, setUploadingProductFile] = useState(false);
  const coverInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);
  const productFileInputRef = React.useRef<HTMLInputElement>(null);

  // Product file state (for new products)
  const [productFile, setProductFile] = useState<{
    url: string;
    size: number;
    name: string;
  } | null>(null);
  const [currentProductFileId, setCurrentProductFileId] = useState<number | null>(null);
  const [savedVersion, setSavedVersion] = useState('');

  const [product, setProduct] = useState<EditorProduct>({
    name: '',
    price: 0,
    originalPrice: 0,
    description: '',
    category: '',
    format: 'Theme',
    productTypeId: null,
    image: '',
    gallery: [],
    author: 'Shop Web rẻ',
    isActive: true,
    isFeatured: false,
    isBestseller: false,
    isNew: true,
    demoUrl: '',
    fileFormat: '',
    compatibility: '',
    version: '1.0.0',
    tags: [],
    features: [],
    techStack: [],
    technologyVariants: [],
    commissionRate: 10,
  });

  const [newTag, setNewTag] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newTech, setNewTech] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, types] = await Promise.all([fetchCategories(), fetchProductTypes(true)]);
      setCategories(cats);
      setProductTypes(types);

      if (!isEditMode) {
        const firstType = types[0];
        setProduct(prev => ({
          ...prev,
          category: prev.category || (cats[0] ? String(cats[0].id) : ''),
          productTypeId: firstType && firstType.id > 0 ? firstType.id : null,
          format: firstType?.name || prev.format,
        }));
      }

      if (isEditMode && productId) {
        const found = await getProductById(Number(productId));
        if (found) {
          const currentFile = await getCurrentVersion(found.id);
          setCurrentProductFileId(currentFile?.id ?? null);
          setSavedVersion(currentFile?.version ?? '');
          setProduct({
            name: found.name,
            price: Number(found.price),
            originalPrice: Number(found.original_price) || 0,
            description: found.description || '',
            category: String(found.category_id || ''),
            format: found.format,
            productTypeId: found.product_type_id || types.find(type => type.name === found.format && type.id > 0)?.id || null,
            image: found.image,
            gallery: found.images || [],
            author: found.author,
            isActive: found.status === 'active',
            isFeatured: found.is_featured,
            isBestseller: found.is_bestseller,
            isNew: found.is_new,
            demoUrl: found.demo_url || '',
            fileFormat: found.file_format || '',
            compatibility: found.compatibility || '',
            version: currentFile?.version || '',
            tags: found.tags || [],
            features: found.features || [],
            techStack: found.tech_stack || [],
            technologyVariants: found.technology_variants || [],
            commissionRate: Number((found as any).commission_rate) || 10,
          });
        } else {
          toast.error('Không tìm thấy sản phẩm');
          router.push('/admin/products');
        }
      }
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [isEditMode, productId, router, toast]);

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
      toast.success('Tải ảnh bìa thành công!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Không thể tải ảnh lên');
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
      toast.success(`Đã tải ${data.urls.length} ảnh thành công!`);
    } catch (error) {
      console.error('Gallery upload error:', error);
      toast.error('Không thể tải ảnh lên');
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
      toast.error('Chỉ hỗ trợ file: ZIP, RAR, 7Z, PDF');
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      toast.error('File quá lớn! Tối đa 500MB');
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
      toast.success(`Đã upload: ${file.name}`);
    } catch (error: any) {
      console.error('Product file upload error:', error);
      toast.error(error.message || 'Không thể tải file lên');
    } finally {
      setUploadingProductFile(false);
      if (productFileInputRef.current) productFileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!product.name.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm');
      return;
    }
    if (!product.price || product.price <= 0) {
      toast.error('Vui lòng nhập giá hợp lệ');
      return;
    }
    if (!product.image) {
      toast.error('Vui lòng thêm ảnh sản phẩm');
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
        product_type_id: product.productTypeId,
        category_id: product.category ? Number(product.category) : null,
        author: product.author || 'Shop Web rẻ',
        is_new: product.isNew,
        is_featured: product.isFeatured,
        is_bestseller: product.isBestseller,
        status: product.isActive ? 'active' : 'draft',
        demo_url: product.demoUrl || null,
        file_format: product.fileFormat || null,
        compatibility: product.compatibility || null,
        tags: product.tags,
        features: product.features,
        tech_stack: product.techStack,
        technology_variants: product.technologyVariants,
        commission_rate: product.commissionRate,
      };

      if (isEditMode && productId) {
        await updateProduct(Number(productId), payload);
        await createActivityLog({ action: 'Update', entity: 'product', entity_id: productId, entity_name: product.name, details: `Cập nhật sản phẩm: ${product.name}`, severity: 'info' });
        if (
          currentProductFileId &&
          product.version.trim() &&
          product.version.trim() !== savedVersion
        ) {
          const versionUpdated = await updateVersion(currentProductFileId, {
            version: product.version.trim(),
          });
          if (!versionUpdated) {
            throw new Error('Product saved, but the file version could not be updated');
          }
        }
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        const newProduct = await createProduct(payload);
        if (newProduct?.id) {
          await createActivityLog({ action: 'Create', entity: 'product', entity_id: String(newProduct.id), entity_name: product.name, details: `Tạo sản phẩm mới: ${product.name}`, severity: 'success' });
        }

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
            // Don't fail the whole operation, product is already created
          }
        }

        toast.success('Tạo sản phẩm thành công!');
      }

      const revalidateResponse = await fetch('/api/admin/revalidate-storefront', {
        method: 'POST',
      });
      if (!revalidateResponse.ok) {
        console.warn('Product saved, but storefront cache could not be refreshed');
      }

      router.push('/admin/products');
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Không thể lưu sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-orange-600" />
      </div>
    );
  }

  const handleAddTag = () => {
    if (newTag.trim() && !product.tags.includes(newTag.trim())) {
      setProduct({ ...product, tags: [...product.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setProduct({ ...product, tags: product.tags.filter(t => t !== tag) });
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !product.features.includes(newFeature.trim())) {
      setProduct({ ...product, features: [...product.features, newFeature.trim()] });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setProduct({ ...product, features: product.features.filter(f => f !== feature) });
  };

  const handleAddTech = () => {
    if (newTech.trim() && !product.techStack.includes(newTech.trim())) {
      setProduct({ ...product, techStack: [...product.techStack, newTech.trim()] });
      setNewTech('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setProduct({ ...product, techStack: product.techStack.filter(t => t !== tech) });
  };

  const handleAddTechnologyVariant = () => {
    setProduct({
      ...product,
      technologyVariants: [
        ...product.technologyVariants,
        { technology: '', status: 'coming_soon', demo_url: '', cta_label: '' },
      ],
    });
  };

  const updateTechnologyVariant = (index: number, updates: Partial<ProductTechnologyVariant>) => {
    setProduct({
      ...product,
      technologyVariants: product.technologyVariants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...updates } : variant
      ),
    });
  };

  const removeTechnologyVariant = (index: number) => {
    setProduct({
      ...product,
      technologyVariants: product.technologyVariants.filter((_, variantIndex) => variantIndex !== index),
    });
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-1">
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="cursor-pointer hover:text-orange-600 font-medium"
            >
              Sản phẩm
            </button>
            <span>/</span>
            <span>{isEditMode ? 'Chỉnh sửa' : 'Thêm mới'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {isEditMode
              ? product.name || 'Chỉnh sửa sản phẩm'
              : 'Thêm Sản Phẩm Mới'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Điền đầy đủ thông tin để sản phẩm hiển thị đẹp trên storefront.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 sm:px-6 py-2 bg-orange-600 text-white text-sm font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200 flex items-center gap-2"
          >
            <Save size={18} /> Lưu Sản Phẩm
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1.2fr] gap-6 lg:gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Title & Slug */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Tên sản phẩm
              </label>
              <input
                type="text"
                value={product.name}
                onChange={e => setProduct({ ...product, name: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none font-medium text-sm"
                placeholder="Nhập tên sản phẩm (Theme, Template, Landing Page...)"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Đường dẫn (Slug)
              </label>
              <div className="flex flex-col sm:flex-row bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <span className="px-4 py-2.5 text-slate-500 text-xs sm:text-sm border-b sm:border-b-0 sm:border-r border-slate-200">
                  https://webgiare.id.vn/product/
                </span>
                <input
                  type="text"
                  className="flex-1 px-4 py-2.5 bg-transparent outline-none text-sm text-slate-600"
                  placeholder="tu-dong-tao-slug"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Mô tả chi tiết
            </label>
            <RichTextEditor
              value={product.description}
              onChange={(html) => setProduct({ ...product, description: html })}
              placeholder="Viết mô tả hấp dẫn cho sản phẩm..."
              minHeight={250}
            />
          </div>

          {/* Technical Info */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Code size={20} className="text-orange-600" />
              Thông Tin Kỹ Thuật
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  Demo URL
                </label>
                <div className="flex items-center gap-2">
                  <LinkIcon size={16} className="text-slate-400" />
                  <input
                    type="url"
                    value={product.demoUrl}
                    onChange={e => setProduct({ ...product, demoUrl: e.target.value })}
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://demo.example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  File Format
                </label>
                <input
                  type="text"
                  value={product.fileFormat}
                  onChange={e => setProduct({ ...product, fileFormat: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="React, Vue, Figma, HTML..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  Compatibility
                </label>
                <input
                  type="text"
                  value={product.compatibility}
                  onChange={e => setProduct({ ...product, compatibility: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="React 18+, Node 16+..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  Version
                </label>
                <input
                  type="text"
                  value={product.version}
                  onChange={e => setProduct({ ...product, version: e.target.value })}
                  disabled={isEditMode && !currentProductFileId}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  placeholder={isEditMode && !currentProductFileId ? 'Chưa có file sản phẩm' : '1.0.0'}
                />
                {isEditMode && !currentProductFileId && (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Phiên bản được quản lý theo file sản phẩm trong lịch sử phiên bản.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Product File Upload - Only in Create mode */}
          {!isEditMode && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-4 flex items-center gap-2">
                <File size={20} className="text-green-600" />
                File Sản Phẩm
              </h3>
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
                  className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 hover:border-green-400 transition-all cursor-pointer disabled:opacity-50"
                >
                  {uploadingProductFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 size={40} className="animate-spin text-green-600" />
                      <span className="text-slate-600 font-medium">Đang upload...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload size={40} className="text-slate-400" />
                      <div>
                        <p className="text-slate-700 font-bold">Click để chọn file</p>
                        <p className="text-sm text-slate-500 mt-1">
                          ZIP, RAR, 7Z, PDF • Tối đa 500MB
                        </p>
                      </div>
                    </div>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Tags */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Tag size={20} className="text-purple-600" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {product.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-purple-400 hover:text-purple-700"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddTag()}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Thêm tag mới..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Zap size={20} className="text-amber-600" />
              Tính Năng
            </h3>
            <div className="space-y-2 mb-3">
              {product.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
                >
                  <span className="text-sm text-amber-800">{feature}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(feature)}
                    className="text-amber-400 hover:text-amber-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={e => setNewFeature(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddFeature()}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Thêm tính năng mới..."
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Layers size={20} className="text-blue-600" />
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {product.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(tech)}
                    className="text-blue-400 hover:text-blue-700"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTech}
                onChange={e => setNewTech(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddTech()}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="React, Vue, TypeScript..."
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Technology variants - shown here on mobile; desktop version lives in the right column */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 lg:hidden">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                  <Globe size={20} className="text-orange-600" />
                  Phiên bản công nghệ
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Gom HTML, React, Next.js hoặc Nuxt.js trong cùng một sản phẩm.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddTechnologyVariant}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-700"
              >
                <Plus size={15} /> Thêm phiên bản
              </button>
            </div>

            {product.technologyVariants.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                Chưa có phiên bản riêng. Bạn có thể tiếp tục dùng Tech Stack ở trên.
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                {product.technologyVariants.map((variant, index) => (
                  <div key={`${index}-${variant.technology}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
                      <div className="relative">
                        <input
                          value={variant.technology}
                          onChange={e => updateTechnologyVariant(index, { technology: e.target.value })}
                          placeholder="HTML, React, Next.js, Canva..."
                          className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                        />
                        <div className="pointer-events-none absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center">
                          {getTechnologyIconUrl(variant.technology) ? (
                            <img src={getTechnologyIconUrl(variant.technology) || ''} alt="" className="h-5 w-5 object-contain" />
                          ) : (
                            <Code size={17} className="text-slate-400" />
                          )}
                        </div>
                      </div>
                      <select
                        value={variant.status}
                        onChange={e => updateTechnologyVariant(index, { status: e.target.value as ProductTechnologyVariant['status'] })}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      >
                        <option value="available">Có sẵn</option>
                        <option value="custom_request">Theo yêu cầu</option>
                        <option value="coming_soon">Sắp có</option>
                        <option value="unavailable">Chưa hỗ trợ</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeTechnologyVariant(index)}
                        className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-red-500 hover:bg-red-50"
                        aria-label="Xóa phiên bản"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <input
                        type="url"
                        value={variant.demo_url || ''}
                        onChange={e => updateTechnologyVariant(index, { demo_url: e.target.value })}
                        placeholder="Live Demo URL (nếu có)"
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      />
                      <input
                        value={variant.cta_label || ''}
                        onChange={e => updateTechnologyVariant(index, { cta_label: e.target.value })}
                        placeholder="CTA, ví dụ: Yêu cầu phiên bản Next.js"
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="hidden lg:block bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Globe size={20} className="text-orange-600" />
                  Phiên bản công nghệ
                </h3>
                <p className="text-xs text-slate-500 mt-1">Các phiên bản của cùng một theme.</p>
              </div>
              <button type="button" onClick={handleAddTechnologyVariant} className="inline-flex items-center gap-1 px-3 py-2 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-700">
                <Plus size={15} /> Thêm
              </button>
            </div>
            {product.technologyVariants.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-3 text-sm text-slate-500">
                Chưa có phiên bản riêng.
              </div>
            ) : (
              <div className="space-y-3">
                {product.technologyVariants.map((variant, index) => (
                  <div key={`side-${index}-${variant.technology}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="relative min-w-0 flex-1">
                        <input value={variant.technology} onChange={e => updateTechnologyVariant(index, { technology: e.target.value })} placeholder="HTML, Next.js, Canva..." className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-orange-500" />
                        <div className="pointer-events-none absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center">
                          {getTechnologyIconUrl(variant.technology) ? <img src={getTechnologyIconUrl(variant.technology) || ''} alt="" className="h-5 w-5 object-contain" /> : <Code size={17} className="text-slate-400" />}
                        </div>
                      </div>
                      <button type="button" onClick={() => removeTechnologyVariant(index)} className="text-red-500 hover:text-red-700" aria-label="Xóa phiên bản"><Trash2 size={16} /></button>
                    </div>
                    <select value={variant.status} onChange={e => updateTechnologyVariant(index, { status: e.target.value as ProductTechnologyVariant['status'] })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="available">Có sẵn</option>
                      <option value="custom_request">Theo yêu cầu</option>
                      <option value="coming_soon">Sắp có</option>
                      <option value="unavailable">Chưa hỗ trợ</option>
                    </select>
                    <input type="url" value={variant.demo_url || ''} onChange={e => updateTechnologyVariant(index, { demo_url: e.target.value })} placeholder="Live Demo URL (nếu có)" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-orange-500" />
                    <input value={variant.cta_label || ''} onChange={e => updateTechnologyVariant(index, { cta_label: e.target.value })} placeholder="CTA tùy chỉnh" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Status */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-xs text-slate-900 mb-4 uppercase tracking-wider">
              Trạng thái
            </h3>
            <div className="space-y-3 text-sm">
              <label className="flex items-center justify-between p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                <span className="font-medium text-slate-700">Đang bán</span>
                <div
                  onClick={() =>
                    setProduct({ ...product, isActive: !product.isActive })
                  }
                  className={`w-10 h-5 ${product.isActive ? 'bg-orange-500' : 'bg-slate-300'
                    } rounded-full relative cursor-pointer transition-colors`}
                >
                  <div
                    className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${product.isActive ? 'right-1' : 'left-1'
                      }`}
                  />
                </div>
              </label>
              <label className="flex items-center justify-between p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                <span className="font-medium text-slate-700">
                  Sản phẩm nổi bật
                </span>
                <div
                  onClick={() =>
                    setProduct({
                      ...product,
                      isFeatured: !product.isFeatured,
                    })
                  }
                  className={`w-10 h-5 ${product.isFeatured ? 'bg-orange-500' : 'bg-slate-300'
                    } rounded-full relative cursor-pointer transition-colors`}
                >
                  <div
                    className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${product.isFeatured ? 'right-1' : 'left-1'
                      }`}
                  />
                </div>
              </label>
              <label className="flex items-center justify-between p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                <span className="font-medium text-slate-700">
                  Sản phẩm bán chạy
                </span>
                <div
                  onClick={() =>
                    setProduct({
                      ...product,
                      isBestseller: !product.isBestseller,
                    })
                  }
                  className={`w-10 h-5 ${product.isBestseller ? 'bg-rose-500' : 'bg-slate-300'
                    } rounded-full relative cursor-pointer transition-colors`}
                >
                  <div
                    className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${product.isBestseller ? 'right-1' : 'left-1'
                      }`}
                  />
                </div>
              </label>
              <label className="flex items-center justify-between p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                <span className="font-medium text-slate-700">
                  Sản phẩm mới
                </span>
                <div
                  onClick={() =>
                    setProduct({
                      ...product,
                      isNew: !product.isNew,
                    })
                  }
                  className={`w-10 h-5 ${product.isNew ? 'bg-emerald-500' : 'bg-slate-300'
                    } rounded-full relative cursor-pointer transition-colors`}
                >
                  <div
                    className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${product.isNew ? 'right-1' : 'left-1'
                      }`}
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Category & Format */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-xs text-slate-900 mb-4 uppercase tracking-wider">
              Phân loại
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  Loại sản phẩm
                </label>
                <select
                  value={product.productTypeId ?? product.format}
                  onChange={e => {
                    const selected = productTypes.find(type => String(type.id) === e.target.value);
                    setProduct({ ...product, productTypeId: selected && selected.id > 0 ? selected.id : null, format: selected?.name || e.target.value });
                  }}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="" disabled>Chọn loại sản phẩm</option>
                  {productTypes.map(type => <option key={type.id} value={type.id > 0 ? type.id : type.name}>{type.label}</option>)}
                </select>
                <button type="button" onClick={() => router.push('/admin/products/types')} className="mt-2 text-xs font-bold text-indigo-600 hover:underline">Quản lý loại sản phẩm</button>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  Danh mục
                </label>
                <select
                  value={product.category}
                  onChange={e =>
                    setProduct({ ...product, category: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="" disabled>Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  Tác giả / Nhà sản xuất
                </label>
                <input
                  type="text"
                  value={product.author}
                  onChange={e =>
                    setProduct({ ...product, author: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nhập tên tác giả..."
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-xs text-slate-900 mb-4 uppercase tracking-wider">
              Giá bán
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  Giá niêm yết
                </label>
                <input
                  type="number"
                  min={0}
                  value={product.originalPrice}
                  onChange={e =>
                    setProduct({
                      ...product,
                      originalPrice: Number(e.target.value),
                    })
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  Giá khuyến mãi
                </label>
                <input
                  type="number"
                  min={0}
                  value={product.price}
                  onChange={e =>
                    setProduct({ ...product, price: Number(e.target.value) })
                  }
                  className="w-full border border-orange-200 bg-orange-50 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 font-bold text-orange-700"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Affiliate Commission */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-xs text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
              🤝 Hoa Hồng Affiliate
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  Tỷ lệ hoa hồng (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={product.commissionRate}
                    onChange={e =>
                      setProduct({
                        ...product,
                        commissionRate: Math.min(50, Math.max(0, Number(e.target.value))),
                      })
                    }
                    className="w-24 border border-purple-200 bg-purple-50 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500 font-bold text-purple-700"
                    placeholder="10"
                  />
                  <span className="text-slate-500 font-medium">%</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Affiliate sẽ nhận được {product.commissionRate}% ({(product.price * product.commissionRate / 100).toLocaleString('vi-VN')}₫) cho mỗi đơn hàng thành công.
                </p>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-xs text-slate-900 mb-4 uppercase tracking-wider">
              Ảnh Bìa
            </h3>
            {/* Hidden file input */}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {product.image ? (
              <div className="relative rounded-xl overflow-hidden group border border-slate-200">
                <img src={product.image} alt="Preview" className="w-full" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-xs sm:text-sm hover:bg-slate-100"
                  >
                    Thay đổi ảnh
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer group disabled:opacity-50"
              >
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
                  {uploadingImage ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                </div>
                <p className="text-sm font-bold text-slate-600">
                  {uploadingImage ? 'Đang tải lên...' : 'Tải ảnh bìa sản phẩm'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PNG, JPG tối đa 5MB
                </p>
              </button>
            )}
          </div>

          {/* Gallery */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon size={16} className="text-violet-600" />
                Thư Viện Ảnh
              </h3>
              <span className="text-xs text-slate-500">{product.gallery.length} ảnh</span>
            </div>

            {/* Gallery Grid */}
            {product.gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {product.gallery.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200 cursor-grab"
                  >
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setProduct({
                          ...product,
                          gallery: product.gallery.filter((_, i) => i !== idx)
                        })}
                        className="p-2 bg-white rounded-lg text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="absolute top-1 left-1 p-1 bg-white/80 rounded text-slate-500 opacity-0 group-hover:opacity-100">
                      <GripVertical size={12} />
                    </div>
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-xs rounded">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Image */}
            <div className="space-y-3">
              {/* Hidden gallery file input */}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="hidden"
              />
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newGalleryUrl}
                  onChange={e => setNewGalleryUrl(e.target.value)}
                  placeholder="Nhập URL ảnh..."
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newGalleryUrl.trim()) {
                      setProduct({ ...product, gallery: [...product.gallery, newGalleryUrl.trim()] });
                      setNewGalleryUrl('');
                    }
                  }}
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingGallery}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 hover:border-violet-300 transition-all cursor-pointer group disabled:opacity-50"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
                    {uploadingGallery ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-600">
                      {uploadingGallery ? 'Đang tải lên...' : 'Click để tải nhiều ảnh'}
                    </p>
                    <p className="text-xs text-slate-400">
                      PNG, JPG, WEBP • Chọn nhiều ảnh cùng lúc
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Version Management - Only show in Edit mode */}
          {isEditMode && productId && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <History size={20} className="text-orange-600" />
                Quản lý phiên bản file
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Upload các phiên bản file mới. Khách hàng đã mua sẽ tự động nhận thông báo.
              </p>
              <ProductVersionManager
                productId={parseInt(productId)}
                productName={product.name || 'Sản phẩm'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductEditor;
