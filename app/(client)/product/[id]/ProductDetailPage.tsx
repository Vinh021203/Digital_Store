'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    Star, ShieldCheck, RotateCcw, Heart, Check, ExternalLink,
    ChevronRight, Copy, Clock, ShoppingCart, ShoppingBag, Download, Package,
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
    { q: 'Sáº£n pháº©m cÃ³ Ä‘Æ°á»£c cáº­p nháº­t miá»…n phÃ­ khÃ´ng?', a: 'CÃ³, báº¡n sáº½ nháº­n Ä‘Æ°á»£c táº¥t cáº£ cÃ¡c báº£n cáº­p nháº­t miá»…n phÃ­ trong tÆ°Æ¡ng lai.' },
    { q: 'TÃ´i cÃ³ thá»ƒ sá»­ dá»¥ng cho dá»± Ã¡n thÆ°Æ¡ng máº¡i khÃ´ng?', a: 'CÃ³, license Regular cho phÃ©p sá»­ dá»¥ng cho 1 dá»± Ã¡n thÆ°Æ¡ng máº¡i. License Extended cho khÃ´ng giá»›i háº¡n dá»± Ã¡n.' },
    { q: 'CÃ³ há»— trá»£ ká»¹ thuáº­t khÃ´ng?', a: 'CÃ³, chÃºng tÃ´i cung cáº¥p há»— trá»£ qua email trong 6 thÃ¡ng ká»ƒ tá»« ngÃ y mua.' },
    { q: 'LÃ m tháº¿ nÃ o Ä‘á»ƒ táº£i sáº£n pháº©m?', a: 'Sau khi thanh toÃ¡n, báº¡n sáº½ nháº­n Ä‘Æ°á»£c link download qua email vÃ  cÃ³ thá»ƒ táº£i tá»« trang Profile > Downloads.' },
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
        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
        };
    }, [currentIndex]);

    return createPortal(
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
            style={{ top: 0, left: 0, right: 0, bottom: 0, marginTop: 0, zIndex: 2147483647 }}
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

            {/* Main Image - fit actual screenshot ratio */}
            <div
                className="absolute inset-x-4 top-16 bottom-24 flex items-center justify-center md:inset-x-16 md:top-16 md:bottom-28"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative flex max-h-full max-w-[min(94vw,1600px)] items-center justify-center overflow-hidden rounded-2xl bg-transparent shadow-2xl shadow-black/50">
                    <img
                        src={images[currentIndex]}
                        alt={`Image ${currentIndex + 1}`}
                        className="block max-h-[calc(100vh-8.5rem)] max-w-full rounded-2xl object-contain"
                    />
                </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex max-w-[90vw] gap-2 overflow-x-auto rounded-2xl bg-black/55 p-2 backdrop-blur-md">
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
        </div>,
        document.body
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
    const [activeTab, setActiveTab] = useState('description');
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [showDemoModal, setShowDemoModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);
    const [quickBuyCollapsed, setQuickBuyCollapsed] = useState(false);

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
        <ModernProductDetailLayout
            product={product}
            relatedProducts={relatedProducts}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedImageIndex={selectedImageIndex}
            setSelectedImageIndex={setSelectedImageIndex}
            showLightbox={showLightbox}
            setShowLightbox={setShowLightbox}
            showDemoModal={showDemoModal}
            setShowDemoModal={setShowDemoModal}
            handleAddToCart={handleAddToCart}
            handleToggleWishlist={handleToggleWishlist}
            handleToggleCompare={handleToggleCompare}
            isWishlisted={isWishlisted}
            isComparing={isComparing}
            discountPercent={discountPercent}
            quickBuyCollapsed={quickBuyCollapsed}
            setQuickBuyCollapsed={setQuickBuyCollapsed}
        />
    );

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#fffdf9]">
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_8%,rgba(234,88,12,0.08),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(14,165,233,0.07),transparent_32%),linear-gradient(180deg,#fffdf9_0%,#ffffff_42%,#fffaf5_100%)]" />
                <div
                    className="absolute inset-0 opacity-[0.055]"
                    style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='168' height='168' viewBox='0 0 168 168' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ea580c' stroke-opacity='.42' stroke-width='1.3'%3E%3Crect x='18' y='24' width='48' height='34' rx='7'/%3E%3Cpath d='M18 35h48M29 30h.1M38 30h.1M47 30h.1' stroke-linecap='round'/%3E%3Cpath d='M108 34h28l-4 18h-20l-4-18Zm7 27a3 3 0 1 0 0 .1M130 61a3 3 0 1 0 0 .1'/%3E%3Cpath d='M30 120l-12-12 12-12M138 96l12 12-12 12M76 130h32M76 140h48M82 82h32v24H82zM89 90h18M89 98h12'/%3E%3C/g%3E%3C/svg%3E\")",
                        backgroundSize: '168px 168px',
                    }}
                />
            </div>
            {/* Breadcrumb - Clean & Minimal */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-40 backdrop-blur-md bg-white/80 supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500 overflow-x-auto whitespace-nowrap no-scrollbar">
                        <Link href="/" className="hover:text-orange-600 transition-colors flex items-center gap-1"><HomeIcon size={14} /> Trang chá»§</Link>
                        <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                        <Link href="/products" className="hover:text-orange-600 transition-colors">Digital Prod...</Link>
                        <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                        <span className="text-slate-900 font-semibold">{product.name}</span>
                    </div>
                </div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-5 md:px-8 md:py-7 xl:py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-9 mb-8">
                    {/* LEFT COLUMN - Images (7 cols) */}
                    <div className="lg:col-span-7 space-y-4">
                        {/* Main Image */}
                        {(() => {
                            const allImages = [product.image, ...(product.images || [])].filter(Boolean);
                            const currentImage = allImages[selectedImageIndex] || product.image;

                            return (
                                <>
                                    <div
                                        className="relative aspect-video rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-lg shadow-orange-100/40 group cursor-zoom-in"
                                        onClick={() => setShowLightbox(true)}
                                    >
                                        <Image
                                            src={currentImage}
                                            alt={product.name}
                                            fill
                                            className="object-contain transition-transform duration-700 group-hover:scale-[1.02]"
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
                                                <Eye size={20} className="text-orange-600" /> Xem áº£nh lá»›n
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thumbnail Grid */}
                                    <div className="grid grid-cols-4 gap-2.5 md:gap-3">
                                        {allImages.slice(0, 4).map((img, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedImageIndex(i)}
                                                className={`relative aspect-video rounded-xl overflow-hidden border cursor-pointer transition-all hover:-translate-y-0.5 ${i === selectedImageIndex
                                                    ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-lg shadow-orange-100'
                                                    : 'border-slate-200 bg-white shadow-sm hover:border-slate-300'
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
                        <div className="bg-white/95 p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-extrabold text-slate-950 mb-4 flex items-center gap-2 text-lg">
                                <Award className="text-orange-600" size={20} /> Äiá»ƒm ná»•i báº­t
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { icon: ShieldCheck, label: 'Báº£o máº­t', val: 'Cao cáº¥p' },
                                    { icon: FileCode, label: 'Code', val: 'Clean' },
                                    { icon: Layers, label: 'Design', val: 'Modern' },
                                    { icon: Smartphone, label: 'Respon.', val: '100%' },
                                ].map((item, i) => (
                                    <div key={i} className="flex min-h-[92px] flex-col items-center justify-center p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-center">
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
                        <div className="sticky top-24">
                            {/* Header Info */}
                            <div className="rounded-t-2xl border border-slate-200 border-b-0 bg-white/95 p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold uppercase tracking-wider border border-orange-100">
                                        {typeof product.category === 'string' ? product.category : (product.category as any)?.name || 'Resource'}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                                        v{(product as any).version || '1.0.0'}
                                    </span>
                                </div>

                                <h1 className="mt-4 text-2xl md:text-3xl lg:text-[34px] font-bold text-slate-950 leading-[1.12] tracking-tight">
                                    {product.name}
                                </h1>

                                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4">
                                    <div className="flex items-center gap-1">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={18} className={i < Math.floor(product.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                                            ))}
                                        </div>
                                        <span className="font-bold text-slate-900 ml-2">{product.rating || 4.8}</span>
                                        <span className="text-slate-400 text-sm ml-1">({product.reviews || 120} Ä‘Ã¡nh giÃ¡)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                                        <Download size={16} />
                                        <span>{(product.students || product.downloads_count || 1200).toLocaleString()} Ä‘Ã£ bÃ¡n</span>
                                    </div>
                                </div>
                            </div>

                            {/* Price Box */}
                            <div className="bg-white p-5 rounded-b-2xl border border-slate-200 border-t-0 shadow-lg shadow-orange-100/35 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <Zap size={120} />
                                </div>

                                <div className="flex items-end gap-3 mb-2">
                                    <span className="text-3xl md:text-[36px] font-bold text-orange-600 tracking-tight">
                                        {product.price.toLocaleString('vi-VN')}â‚«
                                    </span>
                                    {(product.originalPrice || product.original_price) && (
                                        <span className="text-lg text-slate-400 line-through font-medium mb-1">
                                            {(product.originalPrice || product.original_price).toLocaleString('vi-VN')}â‚«
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 mb-6">GiÃ¡ Ä‘Ã£ bao gá»“m VAT vÃ  trá»n bá»™ quyá»n lá»£i.</p>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 group"
                                    >
                                        <ShoppingCart size={20} className="group-hover:animate-bounce" /> ThÃªm vÃ o giá» hÃ ng
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
                                                    <ExternalLink size={18} /> Má»Ÿ Tab má»›i
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
                                            <span className="text-sm">YÃªu thÃ­ch</span>
                                        </button>
                                        <button
                                            onClick={handleToggleCompare}
                                            className={`flex-1 h-12 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${isComparing
                                                ? 'border-blue-300 bg-blue-50 text-blue-600'
                                                : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500 text-slate-500'}`}
                                        >
                                            <ArrowRightLeftIcon size={20} />
                                            <span className="text-sm">So sÃ¡nh</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Benefits List */}
                            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm">
                                <h4 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">
                                    Quyá»n lá»£i Æ°u Ä‘Ã£i
                                </h4>
                                <ul className="space-y-2.5">
                                    {[
                                        { text: 'Cam káº¿t code sáº¡ch, tá»‘i Æ°u 100%', icon: Check },
                                        { text: 'Files nguá»“n Ä‘áº§y Ä‘á»§ (Figma, React, TS...)', icon: Layers },
                                        { text: 'Há»— trá»£ ká»¹ thuáº­t 6 thÃ¡ng miá»…n phÃ­', icon: MessageCircle },
                                        { text: 'HoÃ n tiá»n trong 30 ngÃ y náº¿u lá»—i', icon: RotateCcw },
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 rounded-xl bg-slate-50/80 px-3 py-2.5 text-sm text-slate-600">
                                            <div className="mt-0.5 p-1 rounded-full bg-green-100 text-green-600">
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
                                        {tab === 'overview' ? 'Tá»•ng quan' : tab === 'details' ? 'Chi tiáº¿t ká»¹ thuáº­t' : tab === 'reviews' ? 'ÄÃ¡nh giÃ¡ (120)' : 'Há»i Ä‘Ã¡p'}
                                    </button>
                                ))}
                            </div>

                            <div className="p-8">
                                {activeTab === 'overview' && (
                                    <div className="prose max-w-none prose-slate prose-headings:font-bold prose-a:text-orange-600">
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
                                                        TÃ­nh nÄƒng chÃ­nh
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
                                                ThÃ´ng sá»‘ ká»¹ thuáº­t
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-slate-50 p-6 rounded-2xl">
                                                {[
                                                    { l: 'PhiÃªn báº£n', v: (product as any).version || '1.0.0' },
                                                    { l: 'NgÃ y cáº­p nháº­t', v: product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN') },
                                                    { l: 'File Format', v: (product as any).fileFormat || 'React, Next.js' },
                                                    { l: 'Compatibility', v: (product as any).compatibility || 'React 18+, Node 16+' },
                                                    { l: 'Há»— trá»£', v: '6 thÃ¡ng miá»…n phÃ­' },
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
                                                        <span className="text-slate-400 text-sm">KhÃ´ng cÃ³</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Features Section */}
                                        {(product as any).features && (product as any).features.length > 0 && (
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                                                    <Zap size={20} className="text-orange-600" />
                                                    TÃ­nh nÄƒng
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
                            <h3 className="text-xl font-bold mb-3 relative z-10">Báº¡n cáº§n há»— trá»£?</h3>
                            <p className="text-white/80 mb-4 relative z-10 text-sm leading-relaxed">Äá»™i ngÅ© ká»¹ thuáº­t sáºµn sÃ ng há»— trá»£ 24/7.</p>
                            <button className="w-full bg-white text-orange-600 py-2.5 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg relative z-10 text-sm">
                                LiÃªn há»‡ ngay
                            </button>
                        </div>

                        {/* Trust Badges in Sidebar */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-100">
                            <h4 className="font-bold text-slate-900 text-sm mb-4 uppercase tracking-wide">Cam káº¿t cá»§a chÃºng tÃ´i</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: ShieldCheck, title: 'Báº£o máº­t', desc: 'SSL 256-bit' },
                                    { icon: RotateCcw, title: 'HoÃ n tiá»n', desc: '30 ngÃ y' },
                                    { icon: Download, title: 'Táº£i ngay', desc: 'Sau thanh toÃ¡n' },
                                    { icon: MessageCircle, title: 'Há»— trá»£', desc: '24/7' },
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
                            <h3 className="text-xl font-bold text-white mb-2">KhÃ¡m PhÃ¡ Blog</h3>
                            <p className="text-slate-400 mb-4 text-sm leading-relaxed">
                                HÆ°á»›ng dáº«n, tips & tricks, vÃ  cáº­p nháº­t má»›i nháº¥t vá» web development.
                            </p>
                            <div className="flex items-center gap-2 text-orange-400 font-bold group-hover:gap-4 transition-all text-sm">
                                Äá»c ngay <ArrowRight size={16} />
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
                            <h3 className="text-xl font-bold text-white mb-2">Tham Gia Cá»™ng Äá»“ng</h3>
                            <p className="text-white/80 mb-4 text-sm leading-relaxed">
                                Káº¿t ná»‘i vá»›i developers, chia sáº» kinh nghiá»‡m vÃ  nháº­n há»— trá»£ 24/7.
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
                            <Star size={14} className="fill-current" /> Äá»«ng bá» lá»¡
                        </span>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                            Nháº­n ThÃ´ng BÃ¡o Sáº£n Pháº©m Má»›i
                        </h3>
                        <p className="text-slate-400 mb-6 text-sm">
                            ÄÄƒng kÃ½ Ä‘á»ƒ nháº­n thÃ´ng tin vá» sáº£n pháº©m má»›i vÃ  khuyáº¿n mÃ£i Ä‘á»™c quyá»n!
                        </p>
                        <div className="flex gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Email cá»§a báº¡n..."
                                className="flex-1 px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500 text-sm"
                            />
                            <button className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/30 text-sm">
                                ÄÄƒng kÃ½
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

const ModernProductDetailLayout = ({
    product,
    relatedProducts,
    activeTab,
    setActiveTab,
    selectedImageIndex,
    setSelectedImageIndex,
    showLightbox,
    setShowLightbox,
    showDemoModal,
    setShowDemoModal,
    handleAddToCart,
    handleToggleWishlist,
    handleToggleCompare,
    isWishlisted,
    isComparing,
    discountPercent,
    quickBuyCollapsed,
    setQuickBuyCollapsed,
}: any) => {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [mobileQuickBuyOpen, setMobileQuickBuyOpen] = useState(false);
    const categoryLabel = typeof product.category === 'string'
        ? product.category
        : product.category?.name || 'SaaS Templates';
    const originalPrice = product.originalPrice || product.original_price;
    const demoUrl = product.demo_url || product.demoUrl;
    const galleryImages = [product.image, ...(product.images || [])]
        .map((item: any) => typeof item === 'string' ? item : item?.url || item?.src || item?.image)
        .filter(Boolean);
    const images = galleryImages.length ? galleryImages : [product.image].filter(Boolean);
    const currentImage = images[selectedImageIndex] || images[0];
    const thumbnailStart = Math.floor(selectedImageIndex / 4) * 4;
    const visibleThumbnails = images.slice(thumbnailStart, thumbnailStart + 4);
    const rating = product.rating || 4.9;
    const reviewCount = product.reviews || product.review_count || 56;
    const soldCount = product.students || product.downloads_count || product.sales || 128;
    const formatPrice = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;
    const featureList = (product.features?.length ? product.features : [
        '30+ màn hình được thiết kế sẵn',
        'Dễ dàng tùy biến và mở rộng',
        'Auto layout & Components thông minh',
        'Giao diện hiện đại, tối ưu trải nghiệm',
        'Responsive-ready cho mọi thiết bị',
    ]).slice(0, 5);
    const heroStats = [
        { value: '12+', label: 'Sections' },
        { value: 'SEO', label: 'Optimized' },
        { value: 'Fast', label: 'Loading' },
        { value: 'Form', label: 'Ready' },
        { value: 'Motion', label: 'Effects' },
    ];
    const shortDescription = product.short_description || product.shortDescription || (
        product.description
            ? `${String(product.description).replace(/\s+/g, ' ').slice(0, 190)}${String(product.description).length > 190 ? '...' : ''}`
            : 'Bộ giao diện sản phẩm số hiện đại, dễ tùy biến, giúp bạn triển khai website nhanh chóng và chuyên nghiệp.'
    );
    const tabs = [
        ['description', 'Mô tả sản phẩm'],
        ['features', 'Tính năng nổi bật'],
        ['screenshots', 'Screenshots'],
        ['package', 'Bộ sản phẩm'],
        ['workflow', 'Quy trình & Ứng dụng'],
        ['license', 'So sánh & Giấy phép'],
        ['reviews', 'Đánh giá'],
    ];
    const overviewCards = [
        { icon: Monitor, title: 'Hiện đại & chuyên nghiệp', stat: 'UI chuẩn bán hàng', tag: 'Layout ready', text: 'Bố cục rõ ràng, hình ảnh lớn và nhịp nội dung phù hợp để giới thiệu sản phẩm số.' },
        { icon: Zap, title: 'Tối ưu hiệu suất', stat: 'Tải nhanh hơn', tag: 'Clean structure', text: 'Cấu trúc gọn, dễ mở rộng, giúp rút ngắn thời gian triển khai và bàn giao dự án.' },
        { icon: Layers, title: 'Dễ dàng tùy biến', stat: 'Component linh hoạt', tag: 'Design system', text: 'Các khối giao diện được tách lớp hợp lý, thuận tiện chỉnh màu, nội dung và branding.' },
        { icon: Smartphone, title: 'Responsive-ready', stat: 'Mobile first', tag: 'Đủ breakpoint', text: 'Tương thích tốt trên desktop, laptop, tablet và mobile với bố cục dễ kiểm soát.' },
    ];
    const screenshotTitles = ['Tổng quan Dashboard', 'Lịch đăng & lên lịch', 'Hộp thư & Tin nhắn', 'Báo cáo & Phân tích'];
    const workflowCards = [
        { icon: Eye, title: 'Phân tích & Lên kế hoạch', tag: 'Nghiên cứu' },
        { icon: Calendar, title: 'Lên lịch & Tạo nội dung', tag: 'Lịch đăng' },
        { icon: Users, title: 'Theo dõi & Tương tác', tag: 'Tương tác' },
        { icon: Palette, title: 'Phân tích & Tối ưu', tag: 'Tối ưu' },
        { icon: Code, title: 'Tùy biến giao diện', tag: 'Customize' },
        { icon: Download, title: 'Xuất bản & Bàn giao', tag: 'Deploy' },
    ];

    const reviewItems = [
        { name: 'Nguyễn Minh Tâm', role: 'Product Manager', text: 'Giao diện đẹp, hiện đại và rất dễ tùy biến. Tiết kiệm cho team rất nhiều thời gian triển khai.' },
        { name: 'Trần Thảo Vy', role: 'Marketing Lead', text: 'Cấu trúc file rõ ràng, dễ chỉnh sửa và có đủ thành phần để dựng landing page nhanh.' },
        { name: 'Lê Hoàng Nam', role: 'Founder', text: 'Demo sát thực tế, responsive ổn và phù hợp để triển khai MVP trong thời gian ngắn.' },
        { name: 'Phạm Gia Bảo', role: 'Frontend Developer', text: 'Component sạch, bố cục dễ đọc, phần gallery và tài liệu giúp bàn giao thuận tiện hơn.' },
        { name: 'Đỗ Minh Anh', role: 'UI Designer', text: 'Thiết kế có hệ thống, màu sắc dễ thay đổi và dùng tốt cho nhiều nhóm sản phẩm số.' },
        { name: 'Hoàng Khánh Linh', role: 'Agency Owner', text: 'Khách duyệt nhanh hơn vì preview rõ ràng, các section đủ để trình bày sản phẩm chuyên nghiệp.' },
    ];

    const goToTab = (id: string) => {
        setActiveTab(id);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const closeLightbox = () => {
        setShowLightbox(false);
        window.setTimeout(() => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }, 0);
    };
    const selectPrevImage = () => {
        setSelectedImageIndex((current: number) => current === 0 ? images.length - 1 : current - 1);
    };
    const selectNextImage = () => {
        setSelectedImageIndex((current: number) => current === images.length - 1 ? 0 : current + 1);
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#fffdf9] font-sans">
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_8%,rgba(99,102,241,0.10),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(234,88,12,0.08),transparent_32%),linear-gradient(180deg,#fffdf9_0%,#ffffff_45%,#fffaf5_100%)]" />
                <div
                    className="absolute inset-0 opacity-[0.055]"
                    style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='168' height='168' viewBox='0 0 168 168' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ea580c' stroke-opacity='.42' stroke-width='1.3'%3E%3Crect x='18' y='24' width='48' height='34' rx='7'/%3E%3Cpath d='M18 35h48M29 30h.1M38 30h.1M47 30h.1' stroke-linecap='round'/%3E%3Cpath d='M108 34h28l-4 18h-20l-4-18Zm7 27a3 3 0 1 0 0 .1M130 61a3 3 0 1 0 0 .1'/%3E%3Cpath d='M30 120l-12-12 12-12M138 96l12 12-12 12M76 130h32M76 140h48M82 82h32v24H82zM89 90h18M89 98h12'/%3E%3C/g%3E%3C/svg%3E\")",
                        backgroundSize: '168px 168px',
                    }}
                />
            </div>

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-7">
                <nav className="mb-7 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm text-slate-500 no-scrollbar">
                    <Link href="/" className="flex items-center gap-1.5 hover:text-orange-600"><HomeIcon size={15} /> Trang chủ</Link>
                    <ChevronRight size={15} className="text-slate-300" />
                    <Link href="/products" className="hover:text-orange-600">Templates</Link>
                    <ChevronRight size={15} className="text-slate-300" />
                    <span>{categoryLabel}</span>
                    <ChevronRight size={15} className="text-slate-300" />
                    <span className="font-semibold text-orange-700">{product.name}</span>
                </nav>

                <section className="grid items-start gap-8 lg:grid-cols-[0.84fr_1.16fr] xl:gap-10">
                    <div>
                        <span className="inline-flex rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-orange-700">
                            Best seller
                        </span>
                        <h1 className="mt-5 max-w-2xl text-3xl font-extrabold leading-[1.2] tracking-normal text-slate-950 md:text-4xl xl:text-[44px]">
                            {product.name}
                        </h1>
                        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={18} className={i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                                ))}
                                <span className="ml-2 font-bold text-slate-900">{rating}</span>
                                <span>({reviewCount} đánh giá)</span>
                            </div>
                            <span className="h-4 w-px bg-slate-200" />
                            <span className="inline-flex items-center gap-1.5"><ShoppingCart size={16} /> {soldCount} lượt bán</span>
                        </div>
                        <div className="mt-6 flex items-end gap-3">
                            <span className="text-4xl font-extrabold text-orange-600 md:text-5xl">{formatPrice(product.price)}</span>
                            {originalPrice && <span className="mb-1 text-xl font-semibold text-slate-400 line-through">{formatPrice(originalPrice)}</span>}
                            {discountPercent > 0 && <span className="mb-2 rounded-full bg-rose-100 px-3 py-1 text-sm font-bold text-rose-600">-{discountPercent}%</span>}
                        </div>
                        <p className="mt-5 max-w-xl text-base font-medium leading-8 text-slate-600">
                            {shortDescription}
                        </p>
                        <div className="mt-5 rounded-2xl border border-orange-100 bg-white/80 p-2 shadow-sm backdrop-blur">
                            <div className="grid grid-cols-5 divide-x divide-orange-100">
                                {heroStats.map((item) => (
                                    <div key={item.value} className="px-2 py-2 text-center">
                                        <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-white">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                        <p className="text-sm font-bold leading-5 text-slate-950">{item.value}</p>
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {featureList.slice(0, 3).map((feature: string, index: number) => (
                                <div key={index} className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
                                    <Check size={13} />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                        <div className={`mt-7 grid gap-3 sm:flex sm:flex-wrap ${demoUrl ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            <button onClick={handleAddToCart} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl bg-orange-600 px-3 py-3 text-xs font-bold text-white shadow-xl shadow-orange-200 transition hover:bg-orange-700 sm:px-7 sm:py-4 sm:text-sm">
                                <ShoppingCart size={18} /> Thêm vào giỏ hàng
                            </button>
                            {demoUrl && (
                                <button onClick={() => setShowDemoModal(true)} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-3 py-3 text-xs font-bold text-orange-700 transition hover:bg-orange-50 sm:px-7 sm:py-4 sm:text-sm">
                                    <Play size={18} /> Xem trước demo
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="min-w-0">
                        <div onClick={() => setShowLightbox(true)} className="group relative aspect-[16/9] w-full cursor-zoom-in overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 p-3 shadow-2xl shadow-orange-100/80">
                            <div className="relative h-full overflow-hidden rounded-xl bg-white">
                                {currentImage && <Image src={currentImage} alt={product.name} fill className="object-contain transition duration-500 group-hover:scale-[1.015]" priority />}
                            </div>
                        </div>
                        <div className="mt-5 flex items-center gap-4">
                            <button
                                type="button"
                                onClick={selectPrevImage}
                                className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-orange-200 hover:text-orange-600 md:flex"
                                aria-label="Ảnh trước"
                            >
                                <ChevronRight size={20} className="rotate-180" />
                            </button>
                            <div className="grid min-w-0 flex-1 grid-cols-4 gap-4 overflow-hidden">
                                {visibleThumbnails.map((img: string, i: number) => {
                                    const imageIndex = thumbnailStart + i;
                                    return (
                                    <button key={`${img}-${imageIndex}`} type="button" onClick={() => setSelectedImageIndex(imageIndex)} className={`relative aspect-[16/9] min-w-0 overflow-hidden rounded-xl border bg-white transition ${imageIndex === selectedImageIndex ? 'border-orange-600 ring-2 ring-orange-200' : 'border-slate-200 opacity-80 hover:opacity-100'}`}>
                                        <Image src={img} alt="" fill className="object-cover" sizes="(min-width: 1024px) 12vw, 22vw" />
                                    </button>
                                    );
                                })}
                            </div>
                            <button
                                type="button"
                                onClick={selectNextImage}
                                className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-orange-200 hover:text-orange-600 md:flex"
                                aria-label="Ảnh tiếp theo"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 md:mt-5 md:gap-3">
                            {[
                                { icon: Eye, title: 'Preview rõ ràng', desc: 'Xem trước từng màn hình' },
                                { icon: Download, title: 'Tải file nhanh', desc: 'Nhận ngay sau thanh toán' },
                                { icon: MessageCircle, title: 'Hỗ trợ triển khai', desc: 'Tư vấn chỉnh sửa cơ bản' },
                            ].map((item) => (
                                <div key={item.title} className="flex min-w-0 flex-col items-center gap-1.5 rounded-2xl border border-orange-100 bg-white/80 p-2 text-center shadow-sm backdrop-blur md:flex-row md:gap-3 md:p-3 md:text-left">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-50 to-sky-50 text-orange-600 md:h-10 md:w-10">
                                        <item.icon size={16} className="md:h-[19px] md:w-[19px]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold leading-snug text-slate-950 md:text-sm">{item.title}</p>
                                        <p className="hidden truncate text-xs font-medium text-slate-500 md:block">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                    <div className="flex min-w-max gap-2">
                        {tabs.map(([id, label]) => (
                            <button key={id} onClick={() => goToTab(id)} className={`rounded-lg px-5 py-3 text-sm font-semibold transition ${activeTab === id ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <section id="description" className="mt-8 scroll-mt-24">
                    <h2 className="mb-5 text-xl font-bold text-slate-950">1. Mô tả sản phẩm</h2>
                    <div className="mb-6 rounded-2xl border border-orange-100 bg-white/95 p-4 shadow-sm md:p-6">
                        <div className={`relative max-w-none whitespace-pre-line text-sm font-medium leading-7 text-slate-600 md:text-base md:leading-8 ${showFullDescription ? '' : 'max-h-[340px] overflow-hidden md:max-h-none'}`}>
                            {product.description || 'Sản phẩm được thiết kế để giúp bạn triển khai website nhanh hơn, đẹp hơn và dễ tùy biến theo từng nhu cầu thực tế.'}
                            {!showFullDescription && (
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/90 to-transparent md:hidden" />
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowFullDescription((value) => !value)}
	                            className="-mt-1 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 md:hidden"
                        >
                            {showFullDescription ? 'Thu gọn' : 'Xem thêm'}
                            <ChevronDown size={14} className={`transition-transform ${showFullDescription ? 'rotate-180' : ''}`} />
                        </button>
                        {(product.tags?.length || product.techStack?.length) && (
	                            <div className="mt-5 hidden flex-wrap gap-2 border-t border-slate-100 pt-5 md:flex">
                                {[...(product.tags || []), ...(product.techStack || [])].slice(0, 12).map((tag: string, index: number) => (
                                    <span key={`${tag}-${index}`} className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">#{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    <h3 id="features" className="mb-5 scroll-mt-24 text-xl font-bold text-slate-950">Tổng quan sản phẩm</h3>
                    <div className="grid grid-cols-2 gap-3 md:gap-5 xl:grid-cols-4">
                        {overviewCards.map((item, index) => (
                            <div
                                key={index}
                                className="group relative overflow-hidden rounded-2xl border border-orange-100/80 bg-white p-3 shadow-[0_16px_45px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_24px_60px_rgba(234,88,12,0.14)] md:p-5"
                            >
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-sky-300" />
                                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-orange-100/70 blur-2xl transition duration-300 group-hover:bg-orange-200/80" />
	                                <div className="relative flex items-start justify-between gap-2 md:gap-4">
	                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 text-orange-600 shadow-sm ring-1 ring-orange-100 transition duration-300 group-hover:scale-105 group-hover:from-orange-100 group-hover:to-amber-100 group-hover:text-orange-600 group-hover:ring-orange-200 md:h-14 md:w-14">
	                                        <item.icon size={19} className="md:h-6 md:w-6" />
	                                    </div>
	                                    <span className="hidden rounded-full bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 ring-1 ring-slate-100 sm:inline-flex">{item.tag}</span>
	                                </div>
	                                <div className="relative mt-4 md:mt-6">
	                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-orange-600 md:mb-2 md:text-xs md:tracking-[0.1em]">{item.stat}</p>
	                                    <h3 className="text-sm font-bold leading-snug text-slate-950 md:text-lg">{item.title}</h3>
	                                    <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-slate-600 md:mt-3 md:line-clamp-none md:text-sm md:leading-6">{item.text}</p>
	                                </div>
	                                <div className="relative mt-3 hidden items-center gap-2 text-xs font-bold text-slate-500 md:mt-5 md:flex">
                                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                    Đã kiểm tra trước khi bàn giao
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

	                <section id="screenshots" className="mt-7 scroll-mt-24 md:mt-8">
	                    <h2 className="mb-4 text-xl font-bold text-slate-950 md:mb-5">2. Screenshots nổi bật</h2>
	                    <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:pb-0 xl:grid-cols-4">
	                        {images.slice(0, 4).map((img: string, index: number) => (
	                            <button key={index} onClick={() => { setSelectedImageIndex(index); setShowLightbox(true); }} className="w-[82%] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:w-auto md:shrink">
	                                <div className="relative aspect-[16/9] bg-slate-50"><Image src={img} alt="" fill className="object-cover" /></div>
	                                <div className="p-3 md:p-4">
	                                    <h3 className="text-sm font-bold text-slate-900 md:text-base">{screenshotTitles[index] || `Screenshot ${index + 1}`}</h3>
	                                    <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-600 md:mt-2 md:text-sm md:leading-6">Theo dõi giao diện thực tế, bố cục và trải nghiệm triển khai.</p>
	                                </div>
	                            </button>
                        ))}
                    </div>
                </section>

	                <div className="mt-6 grid gap-6 md:mt-8 lg:grid-cols-[0.95fr_1.05fr]">
	                    <section id="package" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
	                        <h2 className="mb-3 text-lg font-bold text-slate-950 md:mb-5 md:text-xl">3. Bộ sản phẩm bao gồm</h2>
	                        <div className="grid gap-4 md:grid-cols-[0.9fr_1fr] md:gap-5">
	                            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-orange-50 md:aspect-square">
	                                {product.image && <Image src={product.image} alt="" fill className="object-cover" />}
	                            </div>
	                            <ul className="grid grid-cols-2 gap-2 md:block md:space-y-3">
	                                {['30+ Screens được thiết kế sẵn', '150+ UI Components', 'Light & Dark Theme', 'Responsive Breakpoints', 'Style Guide & Design System', 'Hướng dẫn sử dụng chi tiết', 'Bộ icon và asset minh họa', 'Tài liệu bàn giao dự án'].map((item) => (
	                                    <li key={item} className="flex gap-2 rounded-xl bg-orange-50/50 px-2.5 py-2 text-[11px] font-semibold leading-4 text-slate-700 md:bg-transparent md:px-0 md:py-0 md:text-sm"><Check size={15} className="mt-0.5 shrink-0 text-orange-600 md:h-[18px] md:w-[18px]" /> {item}</li>
	                                ))}
	                            </ul>
	                        </div>
	                    </section>

	                    <section id="workflow" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
	                        <div className="mb-3 flex items-center justify-between gap-3 md:mb-4">
	                            <h2 className="text-lg font-bold text-slate-950 md:text-xl">4. Quy trình & Ứng dụng</h2>
	                            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-700">6 bước</span>
	                        </div>
	                        <div className="grid grid-cols-2 gap-2 md:gap-3">
	                            {workflowCards.map((item, index) => (
	                                <div key={index} className="flex min-w-0 items-start gap-2 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/70 to-sky-50/40 p-2.5 md:items-center md:gap-3 md:p-3">
	                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm md:h-11 md:w-11">
	                                        <item.icon size={17} className="md:h-5 md:w-5" />
	                                    </div>
	                                    <div className="min-w-0 flex-1">
	                                        <div className="flex items-center gap-1.5 md:gap-2">
	                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white md:h-6 md:w-6 md:text-xs">{index + 1}</span>
	                                            <h3 className="line-clamp-2 text-xs font-bold leading-4 text-slate-900 md:truncate md:text-sm">{item.title}</h3>
	                                        </div>
	                                        <p className="mt-1 text-[11px] font-semibold text-orange-700 md:text-xs">{item.tag}</p>
	                                    </div>
	                                </div>
                            ))}
                        </div>
                    </section>
                </div>

	                <div id="license" className="mt-6 grid scroll-mt-24 gap-5 md:mt-8 md:gap-6 lg:grid-cols-[1.05fr_0.95fr]">
	                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
	                        <h2 className="mb-3 text-lg font-bold text-slate-950 md:mb-4 md:text-xl">5. So sánh phiên bản</h2>
	                        <div className="overflow-x-auto rounded-xl border border-slate-100">
	                            <table className="w-full min-w-[560px] table-fixed border-collapse text-xs md:text-sm">
                                <thead>
                                    <tr className="text-left text-slate-500">
	                                        <th className="border-b border-r border-slate-100 p-2 md:p-3">Tính năng</th>
	                                        <th className="border-b border-r border-slate-100 p-2 text-center md:p-3">Personal</th>
	                                        <th className="border-b border-r border-orange-200 bg-orange-50 p-2 text-center text-orange-700 md:p-3">Business</th>
	                                        <th className="border-b border-slate-100 p-2 text-center md:p-3">Enterprise</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        ['Số lượng Screens', '20+', '30+', '30+'],
                                        ['UI Components', '100+', '150+', '150+'],
                                        ['Responsive Ready', '✓', '✓', '✓'],
                                        ['Hỗ trợ', 'Email', 'Ưu tiên', '24/7'],
                                        ['Cập nhật miễn phí', '6 tháng', 'Trọn đời', 'Trọn đời'],
                                        ['Giấy phép', '1 dự án', '1 dự án thương mại', 'Không giới hạn'],
                                        ['Giá', formatPrice(Math.max(product.price * 0.65, 0)), formatPrice(product.price), formatPrice(product.price * 2.6)],
                                    ].map((row) => (
                                        <tr key={row[0]} className="text-slate-700">
                                            {row.map((cell, index) => (
	                                                <td key={index} className={`border-b ${index < row.length - 1 ? 'border-r' : ''} border-slate-100 p-2 md:p-3 ${index > 0 ? 'text-center font-bold' : 'font-medium'} ${index === 2 ? 'bg-orange-50/60 text-orange-700' : ''}`}>{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

	                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
	                        <h2 className="mb-3 text-lg font-bold text-slate-950 md:mb-5 md:text-xl">6. Giấy phép sử dụng</h2>
	                        <div className="mb-4 flex h-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-50 to-sky-50 text-orange-600 md:mb-5 md:h-28">
	                            <ShieldCheck size={42} className="md:h-[70px] md:w-[70px]" />
	                        </div>
	                        <div className="space-y-2 md:space-y-3">
	                            {['Sử dụng cho 1 dự án cuối cùng', 'Không giới hạn người dùng nội bộ', 'Không được bán lại hoặc phân phối lại', 'Cập nhật miễn phí trọn đời', 'Hỗ trợ kỹ thuật ưu tiên'].map((item) => (
	                                <div key={item} className="flex items-center gap-2.5 text-xs font-semibold leading-5 text-slate-700 md:gap-3 md:text-sm"><Check size={16} className="shrink-0 text-orange-600 md:h-[18px] md:w-[18px]" /> {item}</div>
	                            ))}
	                        </div>
	                        <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50 p-3 text-xs leading-5 text-slate-600 md:mt-6 md:p-4 md:text-sm md:leading-6">
                            <b className="text-orange-700">Lưu ý quan trọng:</b> Giấy phép không thể chuyển nhượng và áp dụng cho dự án của bạn.
                        </div>
                    </section>
                </div>

                <section id="reviews" className="mt-8 scroll-mt-24">
                    <h2 className="mb-5 text-xl font-bold text-slate-950">7. Khách hàng nói gì về {product.name}</h2>
                    <div className="relative overflow-hidden rounded-2xl">
                        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#fffdf9] to-transparent" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#fffdf9] to-transparent" />
                        <div className="flex w-max gap-5 py-1 will-change-transform hover:[animation-play-state:paused]" style={{ animation: 'reviewsMarquee 38s linear infinite' }}>
                            {[...reviewItems, ...reviewItems].map((review, index) => (
                                <div key={`${review.name}-${index}`} className="w-[360px] shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:w-[420px]">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 font-bold text-orange-700">{review.name.charAt(0)}</div>
                                        <div>
                                            <p className="font-bold text-slate-900">{review.name}</p>
                                            <p className="text-xs font-semibold text-slate-500">{review.role}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex">{[...Array(5)].map((_, i) => <Star key={i} size={15} className="fill-amber-400 text-amber-400" />)}</div>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">{review.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {relatedProducts.length > 0 && (
                    <div className="mt-8">
                        <RelatedProducts currentProduct={product} relatedProducts={relatedProducts} />
                    </div>
                )}

                <div className="fixed right-0 top-1/2 z-30 -translate-y-1/2 md:hidden">
                    {mobileQuickBuyOpen ? (
                        <div className="mr-3 w-[min(82vw,280px)] overflow-hidden rounded-2xl border border-orange-100 bg-white/95 text-slate-950 shadow-[0_18px_48px_rgba(15,23,42,0.22)] backdrop-blur-xl">
                            <div className="border-b border-orange-50 bg-gradient-to-r from-white to-orange-50/80 p-3">
                                <div className="flex items-start gap-3">
                                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-200">
                                        <ShoppingBag size={19} strokeWidth={2.4} />
                                        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-orange-500" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-orange-600">Mua nhanh</p>
                                        <p className="truncate text-sm font-bold leading-5 text-slate-950">{product.name}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setMobileQuickBuyOpen(false)}
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition active:scale-95 hover:bg-orange-50 hover:text-orange-600"
                                        aria-label="Thu gọn mua nhanh"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-3">
                                <div className="flex items-end justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-500">Giá hiện tại</p>
                                        <p className="truncate text-2xl font-extrabold leading-none text-orange-600">{formatPrice(product.price)}</p>
                                    </div>
                                    {discountPercent > 0 && (
                                        <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600">-{discountPercent}%</span>
                                    )}
                                </div>
                                <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                                    <button onClick={handleAddToCart} className="flex min-w-0 items-center justify-center gap-2 rounded-xl bg-orange-600 px-3 py-3 text-sm font-bold text-white shadow-lg shadow-orange-100 transition active:scale-[0.98]">
                                        <ShoppingCart size={18} /> Thêm vào giỏ
                                    </button>
                                    {demoUrl && (
                                        <button onClick={() => setShowDemoModal(true)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-100 bg-white text-orange-700 transition active:scale-[0.98]" aria-label="Xem demo">
                                            <Play size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setMobileQuickBuyOpen(true)}
                            className="group flex h-16 w-12 flex-col items-center justify-center gap-1 rounded-l-2xl border border-r-0 border-orange-100 bg-slate-950 text-white shadow-[0_12px_32px_rgba(15,23,42,0.24)] transition active:scale-95"
                            aria-label="Mở mua nhanh"
                            aria-expanded={mobileQuickBuyOpen}
                        >
                            <ShoppingCart size={19} strokeWidth={2.4} />
                            <ChevronRight size={15} className="rotate-180 text-orange-300 transition group-active:-translate-x-0.5" />
                        </button>
                    )}
                </div>

                <div className="fixed bottom-24 left-6 z-30 hidden xl:block">
                    {quickBuyCollapsed ? (
                        <button
                            type="button"
                            onClick={() => setQuickBuyCollapsed(false)}
                            className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-2xl shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-orange-600"
                            aria-label="Mở mua nhanh"
                        >
                            <ShoppingBag size={24} strokeWidth={2.4} />
                            <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-orange-500" />
                        </button>
                    ) : (
                        <div className="w-[250px] overflow-hidden rounded-2xl border border-orange-100 bg-white/95 text-slate-950 shadow-[0_18px_55px_rgba(15,23,42,0.16)] backdrop-blur-xl">
                            <div className="border-b border-orange-50 bg-gradient-to-r from-white to-orange-50/70 p-3.5">
                                <div className="flex items-start gap-3">
                                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-200">
                                        <ShoppingBag size={20} strokeWidth={2.4} />
                                        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-orange-500" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">Mua nhanh</p>
                                        <p className="truncate text-sm font-bold leading-5 text-slate-950">{product.name}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setQuickBuyCollapsed(true)}
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-orange-50 hover:text-orange-600"
                                        aria-label="Thu gọn mua nhanh"
                                    >
                                        <ChevronRight size={17} className="rotate-180" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-3.5">
                                <div className="flex items-end justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500">Giá hiện tại</p>
                                        <p className="text-2xl font-extrabold leading-none text-orange-600">{formatPrice(product.price)}</p>
                                    </div>
                                    {discountPercent > 0 && (
                                        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600">-{discountPercent}%</span>
                                    )}
                                </div>
                                <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                                    <button onClick={handleAddToCart} className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-3 py-3 text-sm font-bold text-white shadow-lg shadow-orange-100 transition hover:bg-orange-700">
                                        <ShoppingBag size={18} strokeWidth={2.4} /> Thêm
                                    </button>
                                    {demoUrl && (
                                        <button onClick={() => setShowDemoModal(true)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-100 bg-white text-orange-700 transition hover:bg-orange-50" aria-label="Xem demo">
                                            <Play size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <ImageLightbox
                    isOpen={showLightbox}
                    onClose={closeLightbox}
                    images={images}
                    currentIndex={selectedImageIndex}
                    onNavigate={setSelectedImageIndex}
                />
                <style jsx>{`
                    @keyframes reviewsMarquee {
                        from { transform: translateX(0); }
                        to { transform: translateX(-50%); }
                    }
                `}</style>
            </main>

            {demoUrl && (
                <DemoPreviewModal
                    isOpen={showDemoModal}
                    onClose={() => setShowDemoModal(false)}
                    demoUrl={demoUrl}
                    productName={product.name}
                />
            )}
        </div>
    );
};

// Helper Components
const HomeIcon = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
)

const ArrowRightLeftIcon = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 3 4 4-4 4" /><path d="M20 7H4" /><path d="m8 21-4-4 4-4" /><path d="M4 17h16" /></svg>
)

