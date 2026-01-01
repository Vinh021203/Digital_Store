'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    Star, ShieldCheck, RotateCcw, Heart, Check, ExternalLink,
    ChevronRight, Copy, Clock, ShoppingCart, Download, Package,
    Share2, Play, FileCode, Layers, Monitor, Smartphone, Tag,
    MessageCircle, ThumbsUp, ChevronDown, AlertCircle, Plus, Loader2,
    Eye, Users, Calendar, Code, Palette, Zap, Award, Globe, X,
    ArrowRight
} from 'lucide-react';
import { getProductBySlug, getProductById, fetchActiveProducts } from '@/lib/products';
import ReviewsSection from '@/components/product/ReviewsSection';
import RelatedProducts from '@/components/product/RelatedProducts';
import { useCart } from '@/context/CartContext';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useToast } from '@/context/ToastContext';
import type { Product } from '@/types';

// FAQ data
const FAQ_DATA = [
    { q: 'Sản phẩm có được cập nhật miễn phí không?', a: 'Có, bạn sẽ nhận được tất cả các bản cập nhật miễn phí trong tương lai.' },
    { q: 'Tôi có thể sử dụng cho dự án thương mại không?', a: 'Có, license Regular cho phép sử dụng cho 1 dự án thương mại. License Extended cho không giới hạn dự án.' },
    { q: 'Có hỗ trợ kỹ thuật không?', a: 'Có, chúng tôi cung cấp hỗ trợ qua email trong 6 tháng kể từ ngày mua.' },
    { q: 'Làm thế nào để tải sản phẩm?', a: 'Sau khi thanh toán, bạn sẽ nhận được link download qua email và có thể tải từ trang Profile > Downloads.' },
];

// Demo Preview Modal Component
const DemoPreviewModal = ({ isOpen, onClose, demoUrl, productName }: {
    isOpen: boolean;
    onClose: () => void;
    demoUrl: string;
    productName: string;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-[90vw] h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                            <Play size={20} className="text-orange-600 fill-orange-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Preview</p>
                            <h3 className="font-bold text-slate-900 text-lg leading-none">{productName}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href={demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-slate-200"
                        >
                            <ExternalLink size={16} /> Mở tab mới
                        </a>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
                {/* iframe */}
                <div className="flex-1 bg-slate-100 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                    </div>
                    <iframe
                        src={demoUrl}
                        className="w-full h-full relative z-10"
                        title={`Demo ${productName}`}
                    />
                </div>
            </div>
        </div>
    );
};

// Image Lightbox Modal Component
const ImageLightbox = ({
    isOpen,
    onClose,
    images,
    currentIndex,
    onNavigate
}: {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    currentIndex: number;
    onNavigate: (index: number) => void;
}) => {
    if (!isOpen || images.length === 0) return null;

    const handlePrev = () => {
        onNavigate(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
    };

    const handleNext = () => {
        onNavigate(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
    };

    // Keyboard navigation
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
            style={{ top: 0, left: 0, right: 0, bottom: 0, marginTop: 0 }}
            onClick={onClose}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
                <X size={24} />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
                {currentIndex + 1} / {images.length}
            </div>

            {/* Navigation Buttons */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <ChevronRight size={24} className="rotate-180" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {/* Main Image - Contained Size */}
            <div
                className="absolute inset-0 flex items-center justify-center p-16"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={images[currentIndex]}
                    alt={`Image ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-xl backdrop-blur-md overflow-x-auto max-w-[90vw]">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); onNavigate(idx); }}
                            className={`relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all ${idx === currentIndex ? 'ring-2 ring-orange-500 opacity-100' : 'opacity-50 hover:opacity-80'
                                }`}
                        >
                            <Image src={img} alt="" fill className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { addToCart, addToWishlist, isInWishlist, addToCompare, isInCompare, compareList } = useCart();
    const { user } = useSupabaseAuth();
    const { addToast } = useToast();

    const [product, setProduct] = useState<any>(null);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [showDemoModal, setShowDemoModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);

    const productId = params.id as string;

    // Load product data
    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);
            try {
                // Try slug first, then ID
                let data = await getProductBySlug(productId);
                if (!data) {
                    const numId = parseInt(productId, 10);
                    if (!isNaN(numId)) {
                        data = await getProductById(numId);
                    }
                }
                setProduct(data);

                // Load related products
                if (data) {
                    const allProducts = await fetchActiveProducts();
                    const categoryName = typeof data.category === 'object' ? data.category?.name : data.category;
                    const related = allProducts
                        .filter((p: any) => {
                            const pCatName = typeof p.category === 'object' ? p.category?.name : p.category;
                            return p.id !== data.id && pCatName === categoryName;
                        })
                        .slice(0, 4);
                    setRelatedProducts(related);
                }
            } catch (error) {
                console.error('Error loading product:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [productId]);

    const handleAddToCart = useCallback(() => {
        if (product) {
            addToCart(product);
            addToast(`Đã thêm "${product.name}" vào giỏ hàng`, 'success');
        }
    }, [product, addToCart, addToast]);

    const handleToggleWishlist = useCallback(() => {
        if (product) {
            addToWishlist(product);
            addToast(
                isInWishlist(product.id) ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích',
                'success'
            );
        }
    }, [product, addToWishlist, isInWishlist, addToast]);

    const handleToggleCompare = useCallback(() => {
        if (product) {
            if (compareList.length >= 3 && !isInCompare(product.id)) {
                addToast('Chỉ có thể so sánh tối đa 3 sản phẩm', 'error');
                return;
            }
            addToCompare(product);
            addToast(
                isInCompare(product.id) ? 'Đã xóa khỏi so sánh' : 'Đã thêm vào so sánh',
                'success'
            );
        }
    }, [product, addToCompare, isInCompare, compareList, addToast]);

    const discountPercent = useMemo(() => {
        const origPrice = product?.originalPrice || product?.original_price;
        if (origPrice && origPrice > product.price) {
            return Math.round(((origPrice - product.price) / origPrice) * 100);
        }
        return 0;
    }, [product]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
                    <p className="text-slate-500 font-medium">Đang tải thông tin sản phẩm...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Package size={40} className="text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Sản phẩm không tồn tại</h2>
                <p className="text-slate-500 mb-8 max-w-md text-center">Sản phẩm này có thể đã bị xóa hoặc đường dẫn không chính xác. Vui lòng kiểm tra lại.</p>
                <Link href="/products" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg">
                    Khám phá cửa hàng
                </Link>
            </div>
        );
    }

    const isWishlisted = isInWishlist(product.id);
    const isComparing = isInCompare(product.id);

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Breadcrumb - Clean & Minimal */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-40 backdrop-blur-md bg-white/80 supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500 overflow-x-auto whitespace-nowrap no-scrollbar">
                        <Link href="/" className="hover:text-orange-600 transition-colors flex items-center gap-1"><HomeIcon size={14} /> Trang chủ</Link>
                        <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                        <Link href="/products" className="hover:text-orange-600 transition-colors">Digital Prod...</Link>
                        <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                        <span className="text-slate-900 font-semibold">{product.name}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
                    {/* LEFT COLUMN - Images (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Main Image */}
                        {(() => {
                            const allImages = [product.image, ...(product.images || [])].filter(Boolean);
                            const currentImage = allImages[selectedImageIndex] || product.image;

                            return (
                                <>
                                    <div
                                        className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm group cursor-zoom-in"
                                        onClick={() => setShowLightbox(true)}
                                    >
                                        <Image
                                            src={currentImage}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            priority
                                        />

                                        {/* Floating Badges */}
                                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                                            {product.isNew && (
                                                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-blue-600/20 backdrop-blur-md flex items-center gap-1.5 w-fit">
                                                    <Zap size={12} fill="currentColor" /> NEW ARRIVAL
                                                </span>
                                            )}
                                            {discountPercent > 0 && (
                                                <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-rose-600/20 backdrop-blur-md flex items-center gap-1.5 w-fit">
                                                    <Tag size={12} /> SALE -{discountPercent}%
                                                </span>
                                            )}
                                        </div>

                                        {/* Zoom Icon Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                                            <div className="bg-white/95 text-slate-900 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-2xl">
                                                <Eye size={20} className="text-orange-600" /> Xem ảnh lớn
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thumbnail Grid */}
                                    <div className="grid grid-cols-4 gap-3 md:gap-4">
                                        {allImages.slice(0, 4).map((img, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedImageIndex(i)}
                                                className={`relative aspect-video rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-[1.02] ${i === selectedImageIndex
                                                    ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-lg'
                                                    : 'border-slate-200 hover:border-slate-400'
                                                    }`}
                                            >
                                                <Image src={img} alt="" fill className="object-cover" />
                                                {i === 3 && allImages.length > 4 && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold">
                                                        +{allImages.length - 4}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>


                                    {/* Lightbox Modal */}
                                    <ImageLightbox
                                        isOpen={showLightbox}
                                        onClose={() => setShowLightbox(false)}
                                        images={allImages}
                                        currentIndex={selectedImageIndex}
                                        onNavigate={setSelectedImageIndex}
                                    />
                                </>
                            );
                        })()}

                        {/* Tech Specs / Highlights */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Award className="text-orange-600" size={20} /> Điểm nổi bật
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { icon: ShieldCheck, label: 'Bảo mật', val: 'Cao cấp' },
                                    { icon: FileCode, label: 'Code', val: 'Clean' },
                                    { icon: Layers, label: 'Design', val: 'Modern' },
                                    { icon: Smartphone, label: 'Respon.', val: '100%' },
                                ].map((item, i) => (
                                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                        <item.icon size={20} className="mx-auto text-slate-400 mb-2" />
                                        <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                                        <p className="font-bold text-slate-900 text-sm">{item.val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Info & Actions (5 cols) */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-24 space-y-8">
                            {/* Header Info */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold uppercase tracking-wider border border-orange-100">
                                        {typeof product.category === 'string' ? product.category : (product.category as any)?.name || 'Resource'}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                                        v{(product as any).version || '1.0.0'}
                                    </span>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                                    {product.name}
                                </h1>

                                <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                                    <div className="flex items-center gap-1">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={18} className={i < Math.floor(product.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                                            ))}
                                        </div>
                                        <span className="font-bold text-slate-900 ml-2">{product.rating || 4.8}</span>
                                        <span className="text-slate-400 text-sm ml-1">({product.reviews || 120} đánh giá)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                                        <Download size={16} />
                                        <span>{(product.students || product.downloads_count || 1200).toLocaleString()} đã bán</span>
                                    </div>
                                </div>
                            </div>

                            {/* Price Box */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <Zap size={120} />
                                </div>

                                <div className="flex items-end gap-3 mb-2">
                                    <span className="text-4xl font-black text-orange-600 tracking-tight">
                                        {product.price.toLocaleString('vi-VN')}₫
                                    </span>
                                    {(product.originalPrice || product.original_price) && (
                                        <span className="text-lg text-slate-400 line-through font-medium mb-1">
                                            {(product.originalPrice || product.original_price).toLocaleString('vi-VN')}₫
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 mb-6">Giá đã bao gồm VAT và trọn bộ quyền lợi.</p>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 group"
                                    >
                                        <ShoppingCart size={20} className="group-hover:animate-bounce" /> Thêm vào giỏ hàng
                                    </button>

                                    <div className="grid grid-cols-2 gap-3">
                                        {(product as any).demo_url && (
                                            <>
                                                <button
                                                    onClick={() => setShowDemoModal(true)}
                                                    className="px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Eye size={18} /> Xem Demo
                                                </button>
                                                <a
                                                    href={(product as any).demo_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-3 rounded-xl border border-orange-200 bg-orange-50 font-bold text-orange-600 hover:bg-orange-100 hover:border-orange-300 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <ExternalLink size={18} /> Mở Tab mới
                                                </a>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleToggleWishlist}
                                            className={`flex-1 h-12 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${isWishlisted
                                                ? 'border-rose-300 bg-rose-50 text-rose-600'
                                                : 'border-slate-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-500 text-slate-500'}`}
                                        >
                                            <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                                            <span className="text-sm">Yêu thích</span>
                                        </button>
                                        <button
                                            onClick={handleToggleCompare}
                                            className={`flex-1 h-12 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${isComparing
                                                ? 'border-blue-300 bg-blue-50 text-blue-600'
                                                : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500 text-slate-500'}`}
                                        >
                                            <ArrowRightLeftIcon size={20} />
                                            <span className="text-sm">So sánh</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Benefits List */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase text-slate-400">
                                    Quyền lợi ưu đãi
                                </h4>
                                <ul className="space-y-3">
                                    {[
                                        { text: 'Cam kết code sạch, tối ưu 100%', icon: Check },
                                        { text: 'Files nguồn đầy đủ (Figma, React, TS...)', icon: Layers },
                                        { text: 'Hỗ trợ kỹ thuật 6 tháng miễn phí', icon: MessageCircle },
                                        { text: 'Hoàn tiền trong 30 ngày nếu lỗi', icon: RotateCcw },
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                            <div className="mt-0.5 p-0.5 rounded-full bg-green-100 text-green-600">
                                                <item.icon size={12} strokeWidth={3} />
                                            </div>
                                            {item.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Tabs & Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm mb-12">
                            <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
                                {['overview', 'details', 'reviews', 'faq'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-8 py-5 font-bold text-sm uppercase tracking-wide whitespace-nowrap transition-colors border-b-2 ${activeTab === tab ? 'border-orange-600 text-orange-600 bg-orange-50/10' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                    >
                                        {tab === 'overview' ? 'Tổng quan' : tab === 'details' ? 'Chi tiết kỹ thuật' : tab === 'reviews' ? 'Đánh giá (120)' : 'Hỏi đáp'}
                                    </button>
                                ))}
                            </div>

                            <div className="p-8">
                                {activeTab === 'overview' && (
                                    <div className="prose max-w-none prose-slate prose-headings:font-black prose-a:text-orange-600">
                                        {/* Render description with preserved line breaks */}
                                        <div className="text-slate-600 leading-relaxed text-lg whitespace-pre-line">
                                            {product.description}
                                        </div>

                                        {/* Features and Tech Stack Section */}
                                        <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
                                            {/* Features */}
                                            {(product as any).features && (product as any).features.length > 0 && (
                                                <div className="bg-slate-50 p-6 rounded-2xl">
                                                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                        <Zap size={18} className="text-orange-600" />
                                                        Tính năng chính
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {(product as any).features.map((feature: string, i: number) => (
                                                            <li key={i} className="flex gap-2 text-slate-600 text-sm">
                                                                <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                                {feature}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Tech Stack */}
                                            {(product as any).techStack && (product as any).techStack.length > 0 && (
                                                <div className="bg-blue-50 p-6 rounded-2xl">
                                                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                        <Code size={18} className="text-blue-600" />
                                                        Tech Stack
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(product as any).techStack.map((tech: string, i: number) => (
                                                            <span key={i} className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-slate-700 border border-blue-100">
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Fallback image if no features/techStack */}
                                            {!(product as any).features?.length && !(product as any).techStack?.length && (
                                                <div className="relative h-full min-h-[200px] rounded-2xl overflow-hidden md:col-span-2">
                                                    <Image src={product.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015"} alt="Feature" fill className="object-cover" />
                                                </div>
                                            )}
                                        </div>

                                        {product.tags && (
                                            <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-slate-100">
                                                <span className="text-sm font-bold text-slate-400 mr-2">Tags:</span>
                                                {product.tags.map((tag: string, i: number) => (
                                                    <span key={i} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors cursor-pointer">#{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <ReviewsSection productId={product.id} />
                                )}

                                {activeTab === 'faq' && (
                                    <div className="space-y-4">
                                        {FAQ_DATA.map((faq, idx) => (
                                            <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden transition-all hover:border-slate-300">
                                                <button
                                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                                    className="w-full flex items-center justify-between p-5 text-left bg-white"
                                                >
                                                    <span className="font-bold text-slate-900 flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">Q</span>
                                                        {faq.q}
                                                    </span>
                                                    <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                                                </button>
                                                <div className={`grid transition-all duration-300 ${openFaq === idx ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                                    <div className="overflow-hidden">
                                                        <div className="p-5 pt-0 text-slate-600 text-sm leading-relaxed pl-[3.25rem]">
                                                            {faq.a}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'details' && (
                                    <div className="space-y-8">
                                        {/* Technical Specs */}
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                                                <Monitor size={20} className="text-orange-600" />
                                                Thông số kỹ thuật
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-slate-50 p-6 rounded-2xl">
                                                {[
                                                    { l: 'Phiên bản', v: (product as any).version || '1.0.0' },
                                                    { l: 'Ngày cập nhật', v: product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN') },
                                                    { l: 'File Format', v: (product as any).fileFormat || 'React, Next.js' },
                                                    { l: 'Compatibility', v: (product as any).compatibility || 'React 18+, Node 16+' },
                                                    { l: 'Hỗ trợ', v: '6 tháng miễn phí' },
                                                ].map((item, i) => (
                                                    <div key={i} className="flex justify-between py-3 border-b border-slate-200 last:border-0">
                                                        <span className="text-slate-500 text-sm font-medium">{item.l}</span>
                                                        <span className="text-slate-900 text-sm font-bold text-right max-w-[60%]">{item.v}</span>
                                                    </div>
                                                ))}

                                                {/* Demo URL - Clickable Link */}
                                                <div className="flex justify-between py-3 border-b border-slate-200 last:border-0 md:col-span-2">
                                                    <span className="text-slate-500 text-sm font-medium">Demo URL</span>
                                                    {(product as any).demo_url ? (
                                                        <a
                                                            href={(product as any).demo_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-orange-600 text-sm font-bold flex items-center gap-1.5 hover:text-orange-700 hover:underline transition-colors"
                                                        >
                                                            <ExternalLink size={14} />
                                                            Xem Demo Live
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-400 text-sm">Không có</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Features Section */}
                                        {(product as any).features && (product as any).features.length > 0 && (
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                                                    <Zap size={20} className="text-orange-600" />
                                                    Tính năng
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {(product as any).features.map((feature: string, i: number) => (
                                                        <div key={i} className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                                                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                                                <Check size={16} strokeWidth={3} />
                                                            </div>
                                                            <span className="text-slate-700 text-sm font-medium">{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Tech Stack Section */}
                                        {(product as any).techStack && (product as any).techStack.length > 0 && (
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                                                    <Code size={20} className="text-blue-600" />
                                                    Tech Stack
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {(product as any).techStack.map((tech: string, i: number) => (
                                                        <span key={i} className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl text-sm font-bold text-blue-700 border border-blue-100">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Extra Info */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-orange-600 rounded-2xl p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 -m-8 opacity-10">
                                <Star size={140} fill="currentColor" />
                            </div>
                            <h3 className="text-xl font-black mb-3 relative z-10">Bạn cần hỗ trợ?</h3>
                            <p className="text-white/80 mb-4 relative z-10 text-sm leading-relaxed">Đội ngũ kỹ thuật sẵn sàng hỗ trợ 24/7.</p>
                            <button className="w-full bg-white text-orange-600 py-2.5 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg relative z-10 text-sm">
                                Liên hệ ngay
                            </button>
                        </div>

                        {/* Trust Badges in Sidebar */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-100">
                            <h4 className="font-bold text-slate-900 text-sm mb-4 uppercase tracking-wide">Cam kết của chúng tôi</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: ShieldCheck, title: 'Bảo mật', desc: 'SSL 256-bit' },
                                    { icon: RotateCcw, title: 'Hoàn tiền', desc: '30 ngày' },
                                    { icon: Download, title: 'Tải ngay', desc: 'Sau thanh toán' },
                                    { icon: MessageCircle, title: 'Hỗ trợ', desc: '24/7' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                        <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 flex-shrink-0">
                                            <item.icon size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-xs">{item.title}</p>
                                            <p className="text-[10px] text-slate-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <div className="mt-6">
                    <RelatedProducts currentProduct={product} relatedProducts={relatedProducts} />
                </div>

                {/* CTA Section - Explore More */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Blog CTA */}
                    <Link href="/blog" className="group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 overflow-hidden hover:shadow-2xl transition-all">
                        <div className="absolute top-0 right-0 opacity-10">
                            <FileCode size={160} />
                        </div>
                        <div className="relative z-10">
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold uppercase mb-3">
                                <Zap size={12} /> Resources
                            </span>
                            <h3 className="text-xl font-black text-white mb-2">Khám Phá Blog</h3>
                            <p className="text-slate-400 mb-4 text-sm leading-relaxed">
                                Hướng dẫn, tips & tricks, và cập nhật mới nhất về web development.
                            </p>
                            <div className="flex items-center gap-2 text-orange-400 font-bold group-hover:gap-4 transition-all text-sm">
                                Đọc ngay <ArrowRight size={16} />
                            </div>
                        </div>
                    </Link>

                    {/* Community CTA */}
                    <Link href="/contact" className="group relative bg-gradient-to-br from-orange-600 to-rose-600 rounded-2xl p-6 overflow-hidden hover:shadow-2xl hover:shadow-orange-500/30 transition-all">
                        <div className="absolute top-0 right-0 opacity-10">
                            <Users size={160} />
                        </div>
                        <div className="relative z-10">
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold uppercase mb-3">
                                <MessageCircle size={12} /> Support
                            </span>
                            <h3 className="text-xl font-black text-white mb-2">Tham Gia Cộng Đồng</h3>
                            <p className="text-white/80 mb-4 text-sm leading-relaxed">
                                Kết nối với developers, chia sẻ kinh nghiệm và nhận hỗ trợ 24/7.
                            </p>
                            <div className="flex items-center gap-2 text-white font-bold group-hover:gap-4 transition-all text-sm">
                                Tham gia ngay <ArrowRight size={16} />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Newsletter Section */}
                <div className="mt-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />

                    <div className="relative z-10 max-w-2xl mx-auto text-center">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-sm font-bold mb-4">
                            <Star size={14} className="fill-current" /> Đừng bỏ lỡ
                        </span>
                        <h3 className="text-xl md:text-2xl font-black text-white mb-3">
                            Nhận Thông Báo Sản Phẩm Mới
                        </h3>
                        <p className="text-slate-400 mb-6 text-sm">
                            Đăng ký để nhận thông tin về sản phẩm mới và khuyến mãi độc quyền!
                        </p>
                        <div className="flex gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Email của bạn..."
                                className="flex-1 px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500 text-sm"
                            />
                            <button className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/30 text-sm">
                                Đăng ký
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Demo Modal */}
            {(product as any).demo_url && (
                <DemoPreviewModal
                    isOpen={showDemoModal}
                    onClose={() => setShowDemoModal(false)}
                    demoUrl={(product as any).demo_url}
                    productName={product.name}
                />
            )}
        </div>
    );
}

// Helper Components
const HomeIcon = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
)

const ArrowRightLeftIcon = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 3 4 4-4 4" /><path d="M20 7H4" /><path d="m8 21-4-4 4-4" /><path d="M4 17h16" /></svg>
)
